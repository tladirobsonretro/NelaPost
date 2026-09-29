import {NextResponse} from 'next/server'

export async function GET(request:Request){
  const url=new URL(request.url)
  const code=url.searchParams.get('code')
  const state=url.searchParams.get('state')
  const cookies=request.headers.get('cookie')||''
  const getCookie=(name:string)=>cookies.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1)
  const expectedState=getCookie('x_oauth_state')
  const verifier=getCookie('x_oauth_verifier')
  const clientId=process.env.X_CLIENT_ID
  const redirectUri=process.env.X_REDIRECT_URI || new URL('/api/auth/x/callback',url.origin).toString()
  if(!code||!state||state!==expectedState||!verifier||!clientId)return NextResponse.json({error:'Invalid X OAuth callback'}, {status:400})
  const body=new URLSearchParams({code,grant_type:'authorization_code',client_id:clientId,redirect_uri:redirectUri,code_verifier:verifier})
  const token=await fetch('https://api.x.com/2/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body})
  if(!token.ok)return NextResponse.json({error:'X token exchange failed',details:await token.text()},{status:502})
  const data=await token.json()
  const response=NextResponse.redirect(new URL('/?x=connected',url.origin))
  response.cookies.set('x_access_token',data.access_token,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*2,path:'/'})
  if(data.refresh_token)response.cookies.set('x_refresh_token',data.refresh_token,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
  response.cookies.delete('x_oauth_state');response.cookies.delete('x_oauth_verifier')
  return response
}
