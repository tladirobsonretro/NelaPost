import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata={
 title:'NelaPost',
 description:'Create. Schedule. Publish.',
 icons:{
  icon:[{url:'/icon.svg',type:'image/svg+xml'}],
  shortcut:['/icon.svg'],
  apple:['/icon.svg']
 }
}

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>
}
