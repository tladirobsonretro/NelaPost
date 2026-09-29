import {NextResponse} from 'next/server'
export async function GET(request:Request){
 const clientId=process.env.GOOGLE_CLIENT_ID
 const redirect=process.env.GOOGLE_REDIRECT_URI||new URL('/api/auth/google/callback',request.url).toString()
 if(!clientId)return NextResponse.json({error:'Google Calendar is not configured on NelaPost yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Render.'},{status:503})
 const state=crypto.randomUUID()
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth')
 url.searchParams.set('client_id',clientId);url.searchParams.set('redirect_uri',redirect);url.searchParams.set('response_type','code')
 url.searchParams.set('scope','https://www.googleapis.com/auth/calendar.events')
 url.searchParams.set('access_type','offline');url.searchParams.set('prompt','consent');url.searchParams.set('state',state)
 const res=NextResponse.redirect(url);res.cookies.set('google_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
 return res
}