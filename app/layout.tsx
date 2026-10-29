import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata={
 title:'NelaPost',
 description:'Free & Open Source Tools',
 icons:{
  icon:[{url:'/logo-mark.svg',type:'image/svg+xml'}],
  shortcut:['/logo-mark.svg'],
 }
}

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>
}
