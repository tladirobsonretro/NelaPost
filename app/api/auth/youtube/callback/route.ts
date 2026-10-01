import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {installationId,saveConnection,canConnect} from '../../../../../lib/server'

const YOUTUBE_REDIRECT_URI='https://nelapost.onrender.com/api/auth/youtube/callback'
const NELAPOST_URL='https://nelapost.onrender.com'

export async function GET(request:Request){
 const u=new URL(request.url)
 const code=u.searchParams.get('code')
 const state=u.searchParams.get('state')
 const c=await cookies()
 if(!code||!state||state!==c.get('youtube_oauth_state')?.value)return NextResponse.json({error:'Invalid YouTube authorization request.'},{status:400})
 const clientId=process.env.GOOGLE_CLIENT_ID
 const secret=process.env.GOOGLE_CLIENT_SECRET
 if(!clientId||!secret)return NextResponse.json({error:'Google YouTube OAuth is not configured.'},{status:503})
 try{
  const installation_id=await installationId()
  if(!(await canConnect(installation_id,'youtube')))return NextResponse.json({error:'NelaPost allows a maximum of 5 connected platforms.'},{status:400})
  const token=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:clientId,client_secret:secret,redirect_uri:YOUTUBE_REDIRECT_URI,grant_type:'authorization_code'})})
  if(!token.ok)return NextResponse.json({error:'YouTube token exchange failed.'},{status:400})
  const data=await token.json()
  const channelRes=await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',{headers:{Authorization:'Bearer '+data.access_token}})
  if(!channelRes.ok)return NextResponse.json({error:'YouTube authorization succeeded but the channel could not be retrieved.'},{status:400})
  const channels=await channelRes.json()
  const channel=channels.items?.[0]
  if(!channel)return NextResponse.json({error:'No YouTube channel was found for this Google account.'},{status:400})
  await saveConnection({
   installation_id,
   platform:'youtube',
   access_token:data.access_token,
   refresh_token:data.refresh_token||null,
   token_expires_at:data.expires_in?new Date(Date.now()+Number(data.expires_in)*1000).toISOString():null,
   external_account_id:String(channel.id||''),
   external_account_name:String(channel.snippet?.title||''),
   metadata:{channel_id:channel.id||'',channel_name:channel.snippet?.title||''}
  })
  const response=NextResponse.redirect(NELAPOST_URL+'/?connected=youtube')
  response.cookies.set('nelapost_installation_id',installation_id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
  response.cookies.delete('youtube_oauth_state')
  return response
 }catch(error:any){
  return NextResponse.json({error:error?.message||'YouTube connection failed.'},{status:500})
 }
}
