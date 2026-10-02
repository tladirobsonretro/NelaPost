import {NextResponse} from 'next/server'
import {installationId,saveConnection} from '../../../../../lib/server'
import {createHmac,timingSafeEqual} from 'crypto'

function verifyState(state:string,secret:string){
 const parts=state.split('.')
 if(parts.length!==3)return null
 const [platform,nonce,signature]=parts
 if((platform!=='instagram'&&platform!=='facebook')||!nonce||!signature)return null
 const expected=createHmac('sha256',secret).update(platform+'.'+nonce).digest('hex')
 if(signature.length!==expected.length)return null
 if(!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return null
 return platform
}

export async function GET(request:Request){
 const u=new URL(request.url)
 console.log('[meta-oauth] callback received',{hasCode:!!u.searchParams.get('code'),hasState:!!u.searchParams.get('state'),statePlatform:u.searchParams.get('state')?.split('.')[0]||null,stateParts:u.searchParams.get('state')?.split('.').length||0})
 const code=u.searchParams.get('code')
 const state=u.searchParams.get('state')
 if(!code||!state)return NextResponse.json({error:'Invalid Meta authorization request.'},{status:400})

 const parts=state.split('.')
 const statePlatform=parts[0]
 const stateSecret=statePlatform==='instagram'?process.env.META_INSTAGRAM_APP_SECRET:statePlatform==='facebook'?process.env.META_APP_SECRET:undefined
 if(!stateSecret)return NextResponse.json({error:'Meta OAuth is not configured.'},{status:503})
 const platform=verifyState(state,stateSecret)
 if(!platform)return NextResponse.json({error:'Invalid Meta authorization request.'},{status:400})

 const redirect=process.env.META_REDIRECT_URI||new URL('/api/auth/meta/callback',request.url).toString()
 const appOrigin=new URL(redirect).origin
 const version=process.env.META_GRAPH_VERSION||'v24.0'

 try{
  const installation_id=await installationId()

  if(platform==='instagram'){
   const appId=process.env.META_INSTAGRAM_APP_ID
   const secret=process.env.META_INSTAGRAM_APP_SECRET
   if(!appId||!secret)return NextResponse.json({error:'Instagram Business Login is not configured. Add META_INSTAGRAM_APP_ID and META_INSTAGRAM_APP_SECRET in Render.'},{status:503})

   const tokenRes=await fetch('https://api.instagram.com/oauth/access_token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({
     client_id:appId,
     client_secret:secret,
     grant_type:'authorization_code',
     redirect_uri:redirect,
     code
    })
   })
   if(!tokenRes.ok)return NextResponse.json({error:'Instagram authorization failed.'},{status:400})
   const shortData=await tokenRes.json()

   const longRes=await fetch('https://graph.instagram.com/access_token?'+new URLSearchParams({
    grant_type:'ig_exchange_token',
    client_secret:secret,
    access_token:shortData.access_token
   }))
   const longData=longRes.ok?await longRes.json():shortData
   const accessToken=longData.access_token
   if(!accessToken)return NextResponse.json({error:'Instagram did not return an access token.'},{status:400})

   const meRes=await fetch('https://graph.instagram.com/me?'+new URLSearchParams({
    fields:'user_id,username',
    access_token:accessToken
   }))
   if(!meRes.ok)return NextResponse.json({error:'Instagram authorization succeeded but account details could not be retrieved.'},{status:400})
   const me=await meRes.json()

   await saveConnection({
    installation_id,
    platform:'instagram',
    access_token:accessToken,
    token_expires_at:longData.expires_in?new Date(Date.now()+Number(longData.expires_in)*1000).toISOString():null,
    external_account_id:String(me.user_id||''),
    external_account_name:String(me.username||''),
    metadata:{username:me.username||'',instagram_user_id:me.user_id||null}
   })

   const response=NextResponse.redirect(new URL('/?connected=instagram',appOrigin))
   response.cookies.set('nelapost_installation_id',installation_id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
   return response
  }

  const appId=process.env.META_APP_ID
  const secret=process.env.META_APP_SECRET
  if(!appId||!secret)return NextResponse.json({error:'Meta OAuth is not configured.'},{status:503})

  const tokenRes=await fetch('https://graph.facebook.com/'+version+'/oauth/access_token?'+new URLSearchParams({client_id:appId,client_secret:secret,redirect_uri:redirect,code}))
  if(!tokenRes.ok)return NextResponse.json({error:'Meta authorization failed.'},{status:400})
  const shortData=await tokenRes.json()
  const longRes=await fetch('https://graph.facebook.com/'+version+'/oauth/access_token?'+new URLSearchParams({grant_type:'fb_exchange_token',client_id:appId,client_secret:secret,fb_exchange_token:shortData.access_token}))
  const longData=longRes.ok?await longRes.json():shortData
  const userToken=longData.access_token

  const pagesRes=await fetch('https://graph.facebook.com/'+version+'/me/accounts?'+new URLSearchParams({fields:'id,name,access_token',access_token:userToken}))
  if(!pagesRes.ok)return NextResponse.json({error:'Meta did not return a Facebook Page connection.'},{status:400})
  const pagesData=await pagesRes.json()
  const pages=Array.isArray(pagesData.data)?pagesData.data:[]
  const page=pages[0]
  if(!page)return NextResponse.json({error:'No Facebook Page was found for this account.'},{status:400})

  await saveConnection({
   installation_id,
   platform:'facebook',
   access_token:page.access_token,
   external_account_id:String(page.id),
   external_account_name:String(page.name||''),
   metadata:{page_id:page.id,page_name:page.name||''}
  })

  const response=NextResponse.redirect(new URL('/?connected=facebook',appOrigin))
  response.cookies.set('nelapost_installation_id',installation_id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
  return response
 }catch(error:any){
  return NextResponse.json({error:error?.message||'Meta connection failed.'},{status:500})
 }
}
