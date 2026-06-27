from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceOut
from app.utils.auth import get_current_user
from app.models.user import User
from app.services.geo_service import get_client_ip, get_country_for_ip

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=list[ServiceOut])
async def list_services(
    request: Request,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    query = select(Service).where(Service.is_active == True)
    if category:
        query = query.where(Service.category == category)
    query = query.order_by(Service.category, Service.name)
    result = await db.execute(query)
    services = result.scalars().all()

    visitor_country = await get_country_for_ip(get_client_ip(request))

    # Group by category first so the response always stays clustered by
    # platform (all Instagram together, then all Facebook, etc.) — a plain
    # global sort by country would interleave categories and break that.
    by_category: dict[str, list[Service]] = {}
    for s in services:
        by_category.setdefault(s.category, []).append(s)

    def has_country_match(cat_services: list[Service]) -> bool:
        return any(s.country == visitor_country for s in cat_services)

    # Categories that contain at least one service matching the visitor's
    # country bubble to the top (alphabetical among themselves); the rest
    # follow, also alphabetical. Without a resolved country, keep original
    # (alphabetical-by-category) order.
    category_order = sorted(
        by_category.keys(),
        key=lambda cat: (0, cat) if not visitor_country else (not has_country_match(by_category[cat]), cat)
    )

    ordered_services: list[Service] = []
    for cat in category_order:
        cat_services = by_category[cat]
        if visitor_country:
            # Within a category, the visitor's-country services lead, then
            # the rest — both buckets keep their existing name ordering.
            cat_services = sorted(cat_services, key=lambda s: s.country != visitor_country)
        ordered_services.extend(cat_services)

    return ordered_services


@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(Service.category).where(Service.is_active == True).distinct()
    )
    return [r[0] for r in result.all()]


@router.get("/{service_id}", response_model=ServiceOut)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Service).where(Service.id == service_id, Service.is_active == True))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service
