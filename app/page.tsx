'use client'

import Link from 'next/link'

const cardStyle: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 20, padding: 24, background: '#fff', boxShadow: '0 12px 36px rgba(20,24,35,.045)', display: 'flex', flexDirection: 'column', minHeight: 245 }
const buttonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, padding: '12px 16px', fontWeight: 700, fontSize: 13, textDecoration: 'none', width: '100%', boxSizing: 'border-box' }
const iconStyle: React.CSSProperties = { width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center', fontSize: 22, marginBottom: 18 }

function ToolCard({ icon, title, description, href, tint, color }: { icon: string; title: string; description: string; href: string; tint: string; color: string }) {
  return <article style={cardStyle}>
    <div style={{ ...iconStyle, background: tint, color }}>{icon}</div>
    <h2 style={{ fontSize: 20, letterSpacing: '-.5px', margin: '0 0 9px' }}>{title}</h2>
    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#686575', margin: '0 0 22px', flex: 1 }}>{description}</p>
    <Link href={href} style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Open {title} <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></Link>
  </article>
}

export default function Home() {
  return <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f7fbf8 0%,#f7f7fa 48%,#f5f6fa 100%)', color: '#171923', fontFamily: 'Inter,Arial,sans-serif', padding: '28px 20px 36px', boxSizing: 'border-box' }}>
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 62 }}>
        <Link href="/" aria-label="NelaPost home" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minWidth: 0 }}>
          <img src="/logo-mark.svg" alt="" width="46" height="46" style={{ borderRadius: 13, display: 'block' }} />
          <div><div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.8px', color: '#087F5B' }}>NelaPost</div><div style={{ fontSize: 12, color: '#777383', marginTop: 3 }}>Essentials</div></div>
        </Link>
        <Link href="/profile" aria-label="Your profile and settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 12px 8px 8px', border: '1px solid #dfe7e1', borderRadius: 999, background: '#fff', color: '#25372c', textDecoration: 'none', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(20,24,35,.04)' }}>
          <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 999, display: 'grid', placeItems: 'center', background: '#e8f5ef', color: '#087F5B', fontSize: 14 }}>♙</span>
          <span>Profile & Settings</span>
        </Link>
      </header>
      <section style={{ maxWidth: 720, marginBottom: 32 }}>
        <p style={{ fontSize: 11, letterSpacing: 2, fontWeight: 800, color: '#087F5B', margin: '0 0 12px' }}>PRACTICAL TOOLS, ALL IN ONE PLACE</p>
        <h1 style={{ fontSize: 'clamp(36px,7vw,58px)', lineHeight: 1.04, letterSpacing: '-2.2px', margin: '0 0 17px' }}>Meet NelaPost Essentials.</h1>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: '#626672', margin: 0 }}>Free, practical tools to help you get things done, manage your work and move forward. Choose what you need today. No unnecessary extras.</p>
      </section>
      <section aria-label="NelaPost Essentials tools" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,265px),1fr))', gap: 16 }}>
        <article style={cardStyle}>
          <div style={{ ...iconStyle, background: '#e8f5ef', color: '#087F5B' }}>▣</div>
          <h2 style={{ fontSize: 20, letterSpacing: '-.5px', margin: '0 0 9px' }}>Shop Manager</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: '#686575', margin: '0 0 22px', flex: 1 }}>Manage daily sales, products and stock, expenses, cash-ups, reports and customer invoices for your shop or small retail operation.</p>
          <Link href="/business" style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Open Shop Manager <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></Link>
        </article>
        <article style={cardStyle}>
          <div style={{ ...iconStyle, background: '#e8f5ef', color: '#087F5B' }}>▦</div>
          <h2 style={{ fontSize: 20, letterSpacing: '-.5px', margin: '0 0 9px' }}>Social Planner</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: '#686575', margin: '0 0 22px', flex: 1 }}>Plan what to post and when. Get practical monthly ideas, personalise captions and download your calendar without connecting social accounts.</p>
          <Link href="/social-planner" style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Open Social Planner <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></Link>
        </article>
        <article style={cardStyle}>
          <div style={{ ...iconStyle, background: '#edf4ff', color: '#1769e0' }}>▤</div>
          <h2 style={{ fontSize: 20, letterSpacing: '-.5px', margin: '0 0 9px' }}>CV Studio</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: '#686575', margin: '0 0 22px', flex: 1 }}>Build a professional, ATS-friendly CV with practical writing guidance and PDF or Word exports.</p>
          <Link href="/cv-studio" style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Open CV Studio <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></Link>
        </article>
        <ToolCard icon="▧" title="PDF Tools" description="Merge PDFs, extract pages, rotate documents and turn images into PDFs. Files are processed in your browser." href="/pdf-tools" tint="#f0f1f4" color="#555b67" />
        <ToolCard icon="▩" title="Image Tools" description="Resize, crop, compress and convert images for social posts, product listings, CVs and websites." href="/image-tools" tint="#fff2e6" color="#a85a12" />
      </section>
      <footer style={{ marginTop: 48, paddingTop: 18, borderTop: '1px solid #e4e5eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 11, color: '#8b8e99' }}>
        <span>© {new Date().getFullYear()} NelaPost</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}><span>Simple Growth. Real Progress.</span><Link href="/about" style={{ color: '#087F5B', fontWeight: 700, textDecoration: 'none' }}>About NelaPost</Link><Link href="/privacy" style={{ color: '#087F5B', textDecoration: 'none' }}>Privacy</Link><Link href="/terms" style={{ color: '#087F5B', textDecoration: 'none' }}>Terms</Link></span>
      </footer>
    </div>
  </main>
}
