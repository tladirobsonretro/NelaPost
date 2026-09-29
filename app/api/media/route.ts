import {NextResponse} from 'next/server'
import {admin,installationId} from '../../../lib/server'

export async function POST(request:Request){
  try{
    const id=await installationId()
    const form=await request.formData()
    const file=form.get('file')
    if(!(file instanceof File)) return NextResponse.json({error:'No media file provided'},{status:400})
    if(!file.type.startsWith('image/')&&!file.type.startsWith('video/')) return NextResponse.json({error:'Only image and video files are supported'},{status:400})
    if(file.size>50*1024*1024) return NextResponse.json({error:'Media must be 50MB or smaller'},{status:400})
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_')
    const path=`${id}/${crypto.randomUUID()}-${safeName}`
    const db=admin()
    const {error}=await db.storage.from('nelapost-media').upload(path,file,{contentType:file.type,upsert:false})
    if(error) throw error
    const {data}=db.storage.from('nelapost-media').getPublicUrl(path)
    const response=NextResponse.json({url:data.publicUrl,type:file.type.startsWith('video/')?'video':'image',name:file.name})
    response.cookies.set('nelapost_installation_id',id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
    return response
  }catch(error:any){
    return NextResponse.json({error:error?.message||'Media upload failed'},{status:500})
  }
}
