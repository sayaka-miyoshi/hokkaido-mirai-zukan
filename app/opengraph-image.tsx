import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export const runtime = 'edge'
export const alt = SITE_NAME
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '64px',
          background: 'linear-gradient(180deg, #E8F4FC 0%, #4A8FB8 55%, #1A4D7C 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(26,77,124,0.25) 0%, transparent 60%)',
          }}
        />
        <div style={{ fontSize: 72, marginBottom: 16 }}>🗻</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2, maxWidth: 900 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 30, marginTop: 20, maxWidth: 900, lineHeight: 1.4, opacity: 0.92 }}>
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size },
  )
}
