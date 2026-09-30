import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {installationId,saveConnection,canConnect} from '../../../../../lib/server'

export async function GET(request:Request){
 const url=new URL(request.url),code=url.searchParams.get('code'),state=url.searchParams.get('state')
 const c=await cookies(),expectedState=c.get('tiktok_oauth_state')?.value
 const clientKey=process.env.TIKTOK_CLIENT_KEY,clientSecret=process.env.TIKTOK_CLIENT_SECRET
 const redirectUri=process.env.TIKTOK_REDIRECT_URI||new URL('/api/auth/tiktok/callback',url.origin).toString()
 if(!code||!state||state!==expectedState||!clientKey||!clientSecret)return NextResponse.json({error:'Invalid TikTok OAuth callback.'},{status:400})
 try{
  const id=await installationId()
  if(!(await canConnect(id,'tiktok')))return NextResponse.json({error:'NelaPost allows a maximum of 3 connected platforms.'},{status:400})
  const tokenRes=await fetch('https://open.tiktokapis.com/v2/oauth/token/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Cache-Control':'no-cache'},body:new URLSearchParams({client_key:clientKey,client_secret:clientSecret,code,grant_type:'authorization_code',redirect_uri:redirectUri})})
  const tokenData=await tokenRes.json()
  if(!tokenRes.ok||!tokenData.access_token)return NextResponse.json({error:'TikTok token exchange failed.',details:tokenData.error_description||tokenData.error||'Unknown TikTok error'},{status:502})
  const meRes=await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',{headers:{Authorization:'Bearer '+tokenData.access_token}})
  const meData=await meRes.json()
  if(!meRes.ok||!meData.data?.user)return NextResponse.json({error:'TikTok authorization succeeded but account details could not be retrieved.'},{status:400})
  const user=meData.data.user
  await saveConnection({installation_id:id,platform:'tiktok',access_token:tokenData.access_token,refresh_token:tokenData.refresh_token||null,token_expires_at:tokenData.expires_in?new Date(Date.now()+Number(tokenData.expires_in)*1000).toISOString():null,external_account_id:String(user.open_id||tokenData.open_id||''),external_account_name:String(user.display_name||''),metadata:{open_id:user.open_id||tokenData.open_id||null,display_name:user.display_name||'',avatar_url:user.avatar_url||'',scope:tokenData.scope||''}})
  const response=NextResponse.redirect(new URL('/?connected=tiktok',url.origin))
  response.cookies.delete('tiktok_oauth_state')
  response.cookies.set('nelapost_installation_id',id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
  return response
 }catch(error:any){return NextResponse.json({error:error?.message||'TikTok connection failed.'},{status:500})}
}
