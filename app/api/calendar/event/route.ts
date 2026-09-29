import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
export async function POST(request:Request){
 const token=(await cookies()).get('google_calendar_access_token')?.value
 if(!token)return NextResponse.json({error:'Connect Google Calendar first.'},{status:401})
 const body=await request.json()
 const start=new Date(body.start);const end=new Date(body.end||start.getTime()+30*60*1000)
 const r=await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({summary:body.summary||'NelaPost scheduled post',description:body.description||'',start:{dateTime:start.toISOString()},end:{dateTime:end.toISOString()}})})
 if(!r.ok)return NextResponse.json({error:'Google Calendar could not create the event.'},{status:r.status})
 return NextResponse.json(await r.json())
}