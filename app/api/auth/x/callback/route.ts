import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {installationId,saveConnection,canConnect} from '../../../../../lib/server'
export async function GET(request:Request){
 const url=new URL(request.url)
 const code=url.searchParams.get('code')
 const state=url.searchParams.get('state')
 const c=await cookies()
 const expectedState=c.get('x_oauth_state')?.value
 const verifier=c.get('x_oauth_verifier')?.value
 const clientId=process.env.X_CLIENT_ID
 const clientSecret=process.env.X_CLIENT_SECRET
 const redirectUri=process.env.X_REDIRECT_URI||new URL('/api/auth/x/callback',url.origin).toString()
 if(!code||!state||state!==expectedState||!verifier||!clientId||!clientSecret)return NextResponse.json({error:'Invalid X OAuth callback'},{status:400})
 try{
  const installation_id=await installationId()
  if(!(await canConnect(installation_id,'x')))return NextResponse.json({error:'NelaPost allows a maximum of 3 connected platforms.'},{status:400})
  const body=new URLSearchParams({code,grant_type:'authorization_code',redirect_uri:redirectUri,code_verifier:verifier})
  const basic=Buffer.from(clientId+':'+clientSecret,'utf8').toString('base64')
  const token=await fetch('https://api.x.com/2/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Authorization':'Basic '+basic},body})
  if(!token.ok)return NextResponse.json({error:'X token exchange failed',details:await token.text()},{status:502})
  const data=await token.json()
  const me=await fetch('https://api.x.com/2/users/me',{headers:{Authorization:'Bearer '+data.access_token}})
  const meData=me.ok?await me.json():{}
  await saveConnection({installation_id,platform:'x',access_token:data.access_token,refresh_token:data.refresh_token||null,token_expires_at:data.expires_in?new Date(Date.now()+Number(data.expires_in)*1000).toISOString():null,external_account_id:meData.data?.id||null,external_account_name:meData.data?.username?String(meData.data.username):meData.data?.name||'',metadata:{username:meData.data?.username||'',name:meData.data?.name||''}})
  const publicOrigin=new URL(redirectUri).origin
  const response=NextResponse.redirect(new URL('/?connected=x',publicOrigin))
  response.cookies.set('nelapost_installation_id',installation_id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
  response.cookies.delete('x_oauth_state')
  response.cookies.delete('x_oauth_verifier')
  return response
 }catch(error:any){return NextResponse.json({error:error?.message||'X connection failed'},{status:500})}
}
