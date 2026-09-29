import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
export async function GET(request:Request){
 const u=new URL(request.url);const code=u.searchParams.get('code');const state=u.searchParams.get('state');const c=await cookies()
 if(!code||!state||state!==c.get('google_oauth_state')?.value)return NextResponse.json({error:'Invalid Google authorization request.'},{status:400})
 const clientId=process.env.GOOGLE_CLIENT_ID;const secret=process.env.GOOGLE_CLIENT_SECRET;const redirect=process.env.GOOGLE_REDIRECT_URI||new URL('/api/auth/google/callback',request.url).toString()
 if(!clientId||!secret)return NextResponse.json({error:'Google Calendar OAuth is not configured.'},{status:503})
 const token=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:clientId,client_secret:secret,redirect_uri:redirect,grant_type:'authorization_code'})})
 if(!token.ok)return NextResponse.json({error:'Google authorization failed.'},{status:400})
 const data=await token.json()
 c.set('google_calendar_access_token',data.access_token,{httpOnly:true,secure:true,sameSite:'lax',maxAge:3600,path:'/'})
 if(data.refresh_token)c.set('google_calendar_refresh_token',data.refresh_token,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*30,path:'/'})
 c.set('google_calendar_connected','1',{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*30,path:'/'})
 c.delete('google_oauth_state')
 return NextResponse.redirect(new URL('/?calendar=connected',request.url))
}