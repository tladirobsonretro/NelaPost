import {NextResponse} from 'next/server'
import {admin,installationId} from '../../../lib/server'

export async function GET(){
 try{
  const id=await installationId()
  const {data,error}=await admin().from('social_connections').select('platform,external_account_id,external_account_name,metadata,updated_at').eq('installation_id',id)
  if(error)throw error
  const connected=Object.fromEntries((data||[]).map(x=>[x.platform,{name:x.external_account_name||'',id:x.external_account_id||'',metadata:x.metadata||{},updated_at:x.updated_at}]))
  const response=NextResponse.json({connected})
  response.cookies.set('nelapost_installation_id',id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
  return response
 }catch(error:any){return NextResponse.json({error:error?.message||'Could not load connections'},{status:500})}
}
