import {NextResponse} from 'next/server'
function base64url(input:Uint8Array){return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
async function challenge(verifier:string){const data=new TextEncoder().encode(verifier);const digest=await crypto.subtle.digest('SHA-256',data);return base64url(new Uint8Array(digest))}
export async function GET(request:Request){
 const clientId=process.env.X_CLIENT_ID
 const clientSecret=process.env.X_CLIENT_SECRET
 if(!clientId||!clientSecret)return NextResponse.json({error:'X login is not configured on NelaPost. Add X_CLIENT_ID and X_CLIENT_SECRET in Render.'},{status:503})
 const origin=new URL(request.url).origin
 const redirectUri=process.env.X_REDIRECT_URI||new URL('/api/auth/x/callback',origin).toString()
 const state=crypto.randomUUID()
 const verifier=base64url(crypto.getRandomValues(new Uint8Array(32)))
 const codeChallenge=await challenge(verifier)
 const auth=new URL('https://x.com/i/oauth2/authorize')
 auth.searchParams.set('response_type','code')
 auth.searchParams.set('client_id',clientId)
 auth.searchParams.set('redirect_uri',redirectUri)
 auth.searchParams.set('scope','tweet.read users.read tweet.write media.write offline.access')
 auth.searchParams.set('state',state)
 auth.searchParams.set('code_challenge',codeChallenge)
 auth.searchParams.set('code_challenge_method','S256')
 const response=NextResponse.redirect(auth)
 response.cookies.set('x_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
 response.cookies.set('x_oauth_verifier',verifier,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
 return response
}