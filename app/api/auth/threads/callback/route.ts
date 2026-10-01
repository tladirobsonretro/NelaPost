import {NextResponse} from 'next/server'
import {createHmac,timingSafeEqual} from 'crypto'
import {installationId,saveConnection,canConnect} from '../../../../../lib/server'

function verifyState(state:string,secret:string){
 const [nonce,signature]=state.split('.')
 if(!nonce||!signature)return false
 const expected=createHmac('sha256',secret).update(nonce).digest('hex')
 if(signature.length!==expected.length)return false
 return timingSafeEqual(Buffer.from(signature),Buffer.from(expected))
}

export async function GET(request:Request){
 const u=new URL(request.url)
 const code=u.searchParams.get('code')
 const state=u.searchParams.get('state')
 const error=u.searchParams.get('error')
 if(error)return NextResponse.json({error:u.searchParams.get('error_description')||'Threads authorization was cancelled.'},{status:400})
 const secret=process.env.THREADS_APP_SECRET
 const appId=process.env.THREADS_APP_ID
 if(!code||!state||!secret||!appId||!verifyState(state,secret))return NextResponse.json({error:'Invalid Threads authorization request.'},{status:400})
 const redirect=process.env.THREADS_REDIRECT_URI||new URL('/api/auth/threads/callback',request.url).toString()
 const origin=new URL(redirect).origin
 try{
  const installation_id=await installationId()
  if(!(await canConnect(installation_id,'threads')))return NextResponse.json({error:'NelaPost allows a maximum of 5 connected platforms.'},{status:400})
  const tokenRes=await fetch('https://graph.threads.net/oauth/access_token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:appId,client_secret:secret,grant_type:'authorization_code',redirect_uri:redirect,code})})
  const tokenData=await tokenRes.json()
  if(!tokenRes.ok||!tokenData.access_token)throw new Error(tokenData.error_message||tokenData.error?.message||'Threads token exchange failed')
  const longRes=await fetch('https://graph.threads.net/access_token?'+new URLSearchParams({grant_type:'th_exchange_token',client_secret:secret,access_token:tokenData.access_token}))
  const longData=longRes.ok?await longRes.json():tokenData
  const accessToken=longData.access_token||tokenData.access_token
  const meRes=await fetch('https://graph.threads.net/v1.0/me?'+new URLSearchParams({fields:'id,username,name,threads_profile_picture_url',access_token:accessToken}))
  const me=await meRes.json()
  if(!meRes.ok||!me.id)throw new Error(me.error?.message||'Threads account details could not be retrieved')
  await saveConnection({installation_id,platform:'threads',access_token:accessToken,token_expires_at:longData.expires_in?new Date(Date.now()+Number(longData.expires_in)*1000).toISOString():null,external_account_id:String(me.id),external_account_name:String(me.username||me.name||''),metadata:{threads_user_id:me.id,username:me.username||'',name:me.name||'',profile_picture_url:me.threads_profile_picture_url||''}})
  const response=NextResponse.redirect(new URL('/?connected=threads',origin))
  response.cookies.set('nelapost_installation_id',installation_id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
  return response
 }catch(error:any){return NextResponse.json({error:error?.message||'Threads connection failed.'},{status:500})}
}
