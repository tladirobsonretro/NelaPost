import {NextResponse} from 'next/server'

export async function GET(request:Request){
 const clientId=process.env.GOOGLE_CLIENT_ID
 const secret=process.env.GOOGLE_CLIENT_SECRET
 if(!clientId||!secret)return NextResponse.json({error:'Google OAuth is not configured on NelaPost. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Render.'},{status:503})
 const origin=new URL(request.url).origin
 const redirect=process.env.GOOGLE_YOUTUBE_REDIRECT_URI||new URL('/api/auth/youtube/callback',origin).toString()
 const state=crypto.randomUUID()
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth')
 url.searchParams.set('client_id',clientId)
 url.searchParams.set('redirect_uri',redirect)
 url.searchParams.set('response_type','code')
 url.searchParams.set('scope','https://www.googleapis.com/auth/youtube.upload')
 url.searchParams.set('access_type','offline')
 url.searchParams.set('prompt','consent')
 url.searchParams.set('state',state)
 const res=NextResponse.redirect(url)
 res.cookies.set('youtube_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
 return res
}
