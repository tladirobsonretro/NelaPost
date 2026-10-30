'use client'

import Link from 'next/link'
import AccountMenu from '../components/AccountMenu'

const cardStyle: React.CSSProperties = { border: '1px solid #e6e8ee', borderRadius: 15, padding: 20, background: '#fff', boxShadow: '0 4px 16px rgba(20,24,35,.035)', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 220 }
const buttonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, padding: '12px 14px', fontWeight: 700, fontSize: 13, textDecoration: 'none', width: '100%', boxSizing: 'border-box', minHeight: 44 }
const iconStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', fontSize: 20, marginBottom: 15, flex: 'none' }

function ToolCard({ icon, title, description, href, tint, color }: { icon: string; title: string; description: string; href: string; tint: string; color: string }) {
  return <article style={cardStyle}>
    <div style={{ ...iconStyle, background: tint, color }}>{icon}</div>
    <h2 style={{ fontSize: 18, letterSpacing: '-.4px', margin: '0 0 8px' }}>{title}</h2>
    <p style={{ fontSize: 13, lineHeight: 1.65, color: '#68707b', margin: '0 0 20px', flex: 1 }}>{description}</p>
    <Link href={href} style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Open {title} <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></Link>
  </article>
}

export default function Home() {
  return <main style={{ minHeight: '100vh', background: '#f5f7f8', color: '#171923', fontFamily: 'Inter,Arial,sans-serif', padding: '24px 16px 44px', boxSizing: 'border-box' }}>
    <div style={{ width: '100%', maxWidth: 920, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <Link href="/" aria-label="NelaPost home" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', minWidth: 0 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, flex: 'none', borderRadius: 12, background: '#11131a', color: '#fff', fontSize: 21, fontWeight: 800 }}>N.</span>
          <span style={{ minWidth: 0 }}><span style={{ display: 'block', fontSize: 22, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-.8px', color: '#087F5B' }}>NelaPost</span><span style={{ display: 'block', fontSize: 11, color: '#777b88', marginTop: 3 }}>Practical tools to help you grow</span></span>
        </Link>
        <AccountMenu />
      </header>

      <section style={{ background: '#fff', border: '1px solid #e6e8ee', borderRadius: 20, padding: 'clamp(20px,5vw,34px)', boxShadow: '0 7px 25px rgba(32,35,49,.04)' }}>
        <div style={{ fontSize: 11, letterSpacing: 1.2, fontWeight: 800, color: '#087F5B', marginBottom: 9 }}>NELAPOST ESSENTIALS</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,38px)', lineHeight: 1.1, letterSpacing: '-1.2px', margin: '0 0 10px' }}>What would you like to work on?</h1>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: '#68707b', margin: '0 0 24px', maxWidth: 650 }}>Choose a tool to manage your business, prepare for work or organise your next step. Practical tools, together in one place.</p>

        <div aria-label="NelaPost tools" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))', gap: 13 }}>
          <article style={cardStyle}>
            <div style={{ ...iconStyle, background: '#e8f5ef', color: '#087F5B' }}>▣</div>
            <h2 style={{ fontSize: 18, letterSpacing: '-.4px', margin: '0 0 8px' }}>Store Manager</h2>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: '#68707b', margin: '0 0 20px', flex: 1 }}>Manage daily sales, products and stock, expenses, cash-ups, reports and customer invoices for your shop or small retail operation.</p>
            <Link href="/business" style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Open Store Manager <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></Link>
          </article>
          <article style={cardStyle}>
            <div style={{ ...iconStyle, background: '#e8f5ef', color: '#087F5B' }}>▦</div>
            <h2 style={{ fontSize: 18, letterSpacing: '-.4px', margin: '0 0 8px' }}>Social Planner</h2>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: '#68707b', margin: '0 0 20px', flex: 1 }}>Plan what to post and when. Get practical monthly ideas, personalise captions and download your calendar without connecting social accounts.</p>
            <Link href="/social-planner" style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Open Social Planner <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></Link>
          </article>
          <article style={cardStyle}>
            <div style={{ ...iconStyle, background: '#edf4ff', color: '#1769e0' }}>▤</div>
            <h2 style={{ fontSize: 18, letterSpacing: '-.4px', margin: '0 0 8px' }}>CV Studio</h2>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: '#68707b', margin: '0 0 20px', flex: 1 }}>Build a professional, ATS-friendly CV with practical writing guidance and PDF or Word exports.</p>
            <Link href="/cv-studio" style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Open CV Studio <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span></Link>
          </article>
          <article style={cardStyle}>
            <div style={{ ...iconStyle, background: '#f0eaff', color: '#6d28d9' }} aria-hidden="true"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2"/></svg></div>
            <h2 style={{ fontSize: 18, letterSpacing: '-.4px', margin: '0 0 5px' }}>ReadyWorks</h2>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6d28d9', margin: '0 0 10px' }}>Where work meets opportunity.</p>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: '#68707b', margin: '0 0 20px', flex: 1 }}>Need something done? Post a job, connect with available workers and choose the right person. Ready to work? Discover opportunities, respond to jobs and connect with people who need your skills.</p>
            <a href="https://ready-app-gmot.onrender.com" target="_blank" rel="noopener noreferrer" style={{ ...buttonStyle, background: '#087F5B', color: '#fff' }}>Explore ReadyWorks <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}><path d="M4 12 12 4M5 4h7v7"/></svg></a>
          </article>
          <ToolCard icon="▧" title="PDF Tools" description="Merge PDFs, extract pages, rotate documents and turn images into PDFs. Files are processed in your browser." href="/pdf-tools" tint="#f0f1f4" color="#555b67" />
          <ToolCard icon="▩" title="Image Tools" description="Resize, crop, compress and convert images for social posts, product listings, CVs and websites." href="/image-tools" tint="#fff2e6" color="#a85a12" />
        </div>
      </section>

      <footer style={{ marginTop: 22, padding: '16px 2px 0', borderTop: '1px solid #e1e5e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 11, color: '#858b95' }}>
        <span>© {new Date().getFullYear()} NelaPost</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}><span>Simple Growth. Real Progress.</span><Link href="/about" style={{ color: '#087F5B', fontWeight: 700, textDecoration: 'none' }}>About</Link><Link href="/privacy" style={{ color: '#087F5B', textDecoration: 'none' }}>Privacy</Link><Link href="/terms" style={{ color: '#087F5B', textDecoration: 'none' }}>Terms</Link></span>
      </footer>
    </div>
  </main>
}
