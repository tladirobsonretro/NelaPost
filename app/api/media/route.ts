import {NextResponse} from 'next/server'
import {admin,installationId} from '../../../lib/server'

export async function GET(){
  try{
    const id=await installationId()
    const db=admin()
    const {data,error}=await db.storage.from('nelapost-media').list(id,{limit:100,sortBy:{column:'created_at',order:'desc'}})
    if(error) throw error
    const media=(data||[]).filter(item=>item.name).map(item=>{
      const path=`${id}/${item.name}`
      const {data:publicData}=db.storage.from('nelapost-media').getPublicUrl(path)
      const metadata:any=item.metadata||{}
      return {name:item.name,url:publicData.publicUrl,type:String(metadata.mimetype||'').startsWith('video/')?'video':'image',size:metadata.size?Number(metadata.size):undefined}
    })
    return NextResponse.json({media})
  }catch(error:any){
    return NextResponse.json({error:error?.message||'Could not load media library'},{status:500})
  }
}

export async function DELETE(request:Request){
  try{
    const id=await installationId()
    const name=new URL(request.url).searchParams.get('name')
    if(!name||name.includes('/')||name.includes('\\')) return NextResponse.json({error:'Invalid media name'},{status:400})
    const db=admin()
    const {error}=await db.storage.from('nelapost-media').remove([`${id}/${name}`])
    if(error) throw error
    return NextResponse.json({ok:true})
  }catch(error:any){
    return NextResponse.json({error:error?.message||'Could not delete media'},{status:500})
  }
}

export async function POST(request:Request){
  try{
    const id=await installationId()
    const form=await request.formData()
    const file=form.get('file')
    if(!(file instanceof File)) return NextResponse.json({error:'No media file provided'},{status:400})
    if(!file.type.startsWith('image/')&&!file.type.startsWith('video/')) return NextResponse.json({error:'Only image and video files are supported. Maximum file size is 200MB'},{status:400})
    if(file.size>200*1024*1024) return NextResponse.json({error:'Media must be 200MB or smaller'},{status:400})
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
