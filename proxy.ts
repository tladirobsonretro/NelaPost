import {NextResponse,type NextRequest} from 'next/server'
import {createServerClient} from '@supabase/ssr'

export async function proxy(request:NextRequest){
 let response=NextResponse.next({request})
 const supabase=createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {cookies:{getAll(){return request.cookies.getAll()},setAll(cookiesToSet){cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}}
 )
 const {data}=await supabase.auth.getClaims()
 const pathname=request.nextUrl.pathname
 const publicPath=pathname==='/login'||pathname==='/auth/callback'||pathname==='/privacy'||pathname==='/terms'||pathname==='/api/cron/publish'
 if(!data?.claims&&!publicPath){
  const loginUrl=new URL('/login',request.url)
  return NextResponse.redirect(loginUrl)
 }
 return response
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|logo-mark.svg|.*\\.(?:txt|svg|png|jpg|jpeg|gif|webp)$).*)']}
