import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          borderRadius: 36,
          position: 'relative',
        }}
      >
        <svg width="132" height="132" viewBox="0 0 132 132">
          <path d="M18 108V24h19l58 54V24h19v84H96L37 53v55z" fill="#ffffff" />
          <circle cx="112" cy="112" r="9" fill="#8B5CF6" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
