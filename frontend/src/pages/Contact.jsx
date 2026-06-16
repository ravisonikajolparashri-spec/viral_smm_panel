import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LegalLayout, { LegalHeader, LegalCard } from '../components/LegalLayout'

const contactCards = [
  {
    icon: '✉',
    title: 'Email',
    desc: 'For order issues, refunds, or account help.',
    action: { href: 'mailto:reyanshofficial01@gmail.com', label: 'reyanshofficial01@gmail.com' },
  },
  {
    icon: '☎',
    title: 'Phone / WhatsApp',
    desc: 'Call or message us directly.',
    action: { href: 'tel:+919410275555', label: '+91 94102 75555' },
  },
  {
    icon: '⏱',
    title: 'Support Hours',
    desc: "We're available round the clock.",
    action: null,
  },
]

export default function Contact() {
  const { user } = useAuth()

  return (
    <LegalLayout>
      <LegalHeader
        title="Contact Us"
        meta="Have a question about an order, payment, or your account? Reach out — we typically respond within 24 hours."
      />

      <LegalCard>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 sm:mb-4">Get in Touch</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {contactCards.map(c => (
              <div key={c.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg mb-3">
                  {c.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{c.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-2">{c.desc}</p>
                {c.action ? (
                  <a href={c.action.href} className="text-sm font-semibold text-blue-600 hover:underline break-all">
                    {c.action.label}
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-slate-800">24/7 Support</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Before You Reach Out</p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-sm text-slate-600 leading-relaxed">
            If your question is about an order, payment, refund, or account, please include your{' '}
            <strong className="text-slate-800">Order ID</strong> or <strong className="text-slate-800">registered email</strong>{' '}
            — this helps us resolve things faster. Many common questions are already answered in our{' '}
            <Link to="/faq" className="text-blue-600 font-medium hover:underline">FAQ</Link>.
            {user && (
              <>
                {' '}You're signed in as <strong className="text-slate-800">{user.username}</strong> ({user.email}) — feel free to mention this when you write in.
              </>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 sm:px-8 py-6 sm:py-8 text-center text-white">
          <h2 className="text-lg sm:text-xl font-bold mb-1.5">Still need help?</h2>
          <p className="text-blue-200 text-sm mb-5">Our support team is here for you 24/7.</p>
          <a
            href="mailto:reyanshofficial01@gmail.com"
            className="inline-flex items-center justify-center bg-white text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors min-h-[44px]"
          >
            Email Support
          </a>
        </div>
      </LegalCard>
    </LegalLayout>
  )
}
