import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * CustomSelect — smooth animated dropdown, supports flat & grouped options.
 *
 * Props:
 *   value          — currently selected value (string/number/null)
 *   onChange       — (value, option) => void
 *   options        — flat: [{ value, label, meta }]
 *                  — grouped: [{ group, items: [{ value, label, meta }] }]
 *   grouped        — boolean, default false
 *   placeholder    — string
 *   searchable     — boolean, default true
 *   disabled       — boolean
 *   renderTrigger  — optional (selected, placeholder) => JSX
 *   renderOption   — optional (option, isSelected) => JSX
 *   className      — wrapper className
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  grouped = false,
  placeholder = 'Select…',
  searchable = true,
  disabled = false,
  renderTrigger,
  renderOption,
  className = '',
}) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef   = useRef(null)
  const searchRef = useRef(null)
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  // ── Flatten for lookups ───────────────────────────────────────────────────
  const allItems = grouped ? options.flatMap(g => g.items) : options
  const selected = allItems.find(o => String(o.value) === String(value)) ?? null

  // ── Filter ────────────────────────────────────────────────────────────────
  const q = search.toLowerCase().trim()
  const filtered = grouped
    ? options
        .map(g => ({ ...g, items: q ? g.items.filter(o => o.label.toLowerCase().includes(q)) : g.items }))
        .filter(g => g.items.length > 0)
    : (q ? options.filter(o => o.label.toLowerCase().includes(q)) : options)

  // ── Open / close ────────────────────────────────────────────────────────
  const openDropdown = () => {
    if (disabled) return
    setOpen(true)
    setSearch('')
    // On desktop only: auto-focus the search input. On mobile this would pop
    // the virtual keyboard immediately, which we'd rather the user trigger
    // deliberately by tapping the search box themselves.
    if (searchable && !isTouchDevice) {
      setTimeout(() => searchRef.current?.focus(), 30)
    }
  }

  const close = useCallback(() => {
    setOpen(false)
    setSearch('')
  }, [])

  const toggle = () => (open ? close() : openDropdown())

  // ── Outside-click detection ───────────────────────────────────────────────
  // Plain `click` — fires naturally after any tap/click resolves, so it never
  // races with scrolling or option selection the way pointerdown/up did.
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close()
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open, close])

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, close])

  // ── Flip up if near bottom of viewport ───────────────────────────────────
  const [dropUp, setDropUp] = useState(false)
  useEffect(() => {
    if (!open || !wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    setDropUp(window.innerHeight - rect.bottom < 280 && rect.top > 280)
  }, [open])

  // ── Select an option ─────────────────────────────────────────────────────
  const handleSelect = (opt) => {
    onChange(opt.value, opt)
    close()
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>

      {/* ── Trigger button ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 border rounded-xl text-left text-sm
          transition-all duration-150 min-h-[44px] touch-manipulation select-none outline-none
          ${open
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white'
            : 'border-slate-200 bg-white hover:border-slate-300 active:bg-slate-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
        `}
      >
        {renderTrigger ? renderTrigger(selected, placeholder) : (
          <span className={`truncate ${selected ? 'text-slate-800' : 'text-slate-400'}`}>
            {selected ? selected.label : placeholder}
          </span>
        )}
        <svg
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown panel ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 bg-white border border-slate-200 rounded-2xl
            shadow-xl shadow-slate-200/60 overflow-hidden flex flex-col"
          style={{ maxHeight: '320px', ...(dropUp ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }) }}
        >
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-8 pr-3 py-2 text-xs text-slate-700 bg-slate-50
                    border border-slate-100 rounded-lg placeholder-slate-400
                    focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400
                      hover:text-slate-600 touch-manipulation p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List — native scrolling, no pointer-event interception */}
          <div className="overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {grouped ? (
              filtered.length === 0
                ? <p className="text-center text-slate-400 text-xs py-6">No results</p>
                : filtered.map(group => (
                  <div key={group.group}>
                    <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm px-3 py-1.5
                      border-b border-slate-100 flex items-center gap-2 z-10">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                        {group.group}
                      </span>
                      <span className="text-[9px] text-slate-400 shrink-0">{group.items.length}</span>
                    </div>
                    {group.items.map(opt => (
                      <OptionRow
                        key={opt.value}
                        opt={opt}
                        selected={String(value) === String(opt.value)}
                        onSelect={handleSelect}
                        renderOption={renderOption}
                      />
                    ))}
                  </div>
                ))
            ) : (
              filtered.length === 0
                ? <p className="text-center text-slate-400 text-xs py-6">No results</p>
                : filtered.map(opt => (
                  <OptionRow
                    key={opt.value}
                    opt={opt}
                    selected={String(value) === String(opt.value)}
                    onSelect={handleSelect}
                    renderOption={renderOption}
                  />
                ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function OptionRow({ opt, selected, onSelect, renderOption }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(opt)}
      className={`w-full text-left px-3 py-2.5 text-sm transition-colors touch-manipulation
        ${selected ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'}
      `}
    >
      {renderOption ? renderOption(opt, selected) : (
        <span className="flex items-center justify-between gap-2">
          <span className="truncate">{opt.label}</span>
          {selected && (
            <svg className="w-3.5 h-3.5 shrink-0 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      )}
    </button>
  )
}
