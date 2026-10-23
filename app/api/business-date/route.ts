import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ''
  const today = `${part('year')}-${part('month')}-${part('day')}`

  return NextResponse.json(
    { today, now: now.toISOString() },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
