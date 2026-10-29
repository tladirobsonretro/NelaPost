import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'NelaPost: practical tools to help you grow'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
 return new ImageResponse(
  (
   <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '66px 76px',
    background: '#f7fbf8',
    color: '#17211d',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
   }}>
    <div style={{ position: 'absolute', right: -80, top: -180, width: 600, height: 600, borderRadius: 300, background: '#e3f3ea', display: 'flex' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, zIndex: 1 }}>
     <div style={{ width: 88, height: 88, borderRadius: 22, background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 62, fontWeight: 800, letterSpacing: -5 }}>N</div>
     <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 48, fontWeight: 800, color: '#087f5b', letterSpacing: -2 }}>NelaPost</div>
      <div style={{ fontSize: 19, color: '#66716b', marginTop: 4 }}>ESSENTIALS</div>
     </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 920, zIndex: 1 }}>
     <div style={{ fontSize: 55, lineHeight: 1.12, fontWeight: 750, letterSpacing: -2, marginBottom: 22 }}>Practical tools to help you grow.</div>
     <div style={{ fontSize: 25, lineHeight: 1.45, color: '#59645e' }}>Build your CV. Manage your business. Plan your content.</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 19, color: '#087f5b', fontWeight: 700, zIndex: 1 }}>
     <div style={{ width: 36, height: 4, background: '#087f5b', borderRadius: 2 }} />
     Free, practical tools in one place
    </div>
   </div>
  ),
  { ...size }
 )
}
