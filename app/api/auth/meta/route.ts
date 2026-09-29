import {NextResponse} from 'next/server'
import {createHmac,randomUUID} from 'crypto'

function signState(platform:string,nonce:string,secret:string){
 return createHmac('sha256',secret).update(platform+'.'+nonce).digest('hex')
}

export async function GET(request:Request){
 const incoming=new URL(request.url)
 const platform=incoming.searchParams.get('platform')
 if(platform!=='instagram'&&platform!=='facebook')return NextResponse.json({error:'Choose Instagram or Facebook.'},{status:400})

 const redirect=process.env.META_REDIRECT_URI||new URL('/api/auth/meta/callback',request.url).toString()
 const version=process.env.META_GRAPH_VERSION||'v24.0'
 const nonce=randomUUID()

 if(platform==='instagram'){
  const appId=process.env.META_INSTAGRAM_APP_ID
  const secret=process.env.META_INSTAGRAM_APP_SECRET
  if(!appId||!secret)return NextResponse.json({error:'Instagram Business Login is not configured. Add META_INSTAGRAM_APP_ID and META_INSTAGRAM_APP_SECRET in Render.'},{status:503})
  const state=platform+'.'+nonce+'.'+signState(platform,nonce,secret)
  const url=new URL('https://www.instagram.com/oauth/authorize')
  url.searchParams.set('client_id',appId)
  url.searchParams.set('redirect_uri',redirect)
  url.searchParams.set('response_type','code')
  url.searchParams.set('force_reauth','true')
  url.searchParams.set('scope','instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights')
  url.searchParams.set('state',state)
  return NextResponse.redirect(url)
 }

 const appId=process.env.META_APP_ID
 const secret=process.env.META_APP_SECRET
 if(!appId||!secret)return NextResponse.json({error:'Facebook publishing is not configured on NelaPost yet. Add META_APP_ID and META_APP_SECRET in Render.'},{status:503})
 const state=platform+'.'+nonce+'.'+signState(platform,nonce,secret)
 const url=new URL('https://www.facebook.com/'+version+'/dialog/oauth')
 url.searchParams.set('client_id',appId)
 url.searchParams.set('redirect_uri',redirect)
 url.searchParams.set('response_type','code')
 url.searchParams.set('state',state)
 url.searchParams.set('scope','pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish')
 return NextResponse.redirect(url)
}
