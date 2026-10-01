import {NextResponse} from 'next/server'
import {createHmac,randomUUID} from 'crypto'
import {installationId} from '../../../../lib/server'

export async function GET(request:Request){
 const appId=process.env.THREADS_APP_ID
 const secret=process.env.THREADS_APP_SECRET
 if(!appId||!secret)return NextResponse.json({error:'Threads OAuth is not configured. Add THREADS_APP_ID and THREADS_APP_SECRET in Render.'},{status:503})
 const redirect=process.env.THREADS_REDIRECT_URI||new URL('/api/auth/threads/callback',request.url).toString()
 const nonce=randomUUID()
 const state=nonce+'.'+createHmac('sha256',secret).update(nonce).digest('hex')
 const url=new URL('https://threads.net/oauth/authorize')
 url.searchParams.set('client_id',appId)
 url.searchParams.set('redirect_uri',redirect)
 url.searchParams.set('response_type','code')
 url.searchParams.set('scope','threads_basic,threads_content_publish')
 url.searchParams.set('state',state)
 const response=NextResponse.redirect(url)
 response.cookies.set('nelapost_installation_id',await installationId(),{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
 return response
}
