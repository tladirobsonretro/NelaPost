import {NextResponse} from 'next/server'
import {installationId} from '../../../../lib/server'

export async function GET(request:Request){
 const clientKey=process.env.TIKTOK_CLIENT_KEY?.trim().replace(/^(['"])(.*)\\1$/,'$2')
 if(!clientKey)return NextResponse.json({error:'TikTok is not configured on NelaPost yet. Add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in Render.'},{status:503})
 const redirectUri=process.env.TIKTOK_REDIRECT_URI?.trim().replace(/^(['"])(.*)\\1$/,'$2')||new URL('/api/auth/tiktok/callback',request.url).toString()
 const id=await installationId()
 const state=crypto.randomUUID()
 const response=NextResponse.redirect(new URL('https://www.tiktok.com/v2/auth/authorize/?'+new URLSearchParams({
  client_key:clientKey,response_type:'code',scope:'user.info.basic,video.publish',redirect_uri:redirectUri,state
 }).toString()))
 response.cookies.set('tiktok_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
 response.cookies.set('nelapost_installation_id',id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
 return response
}
