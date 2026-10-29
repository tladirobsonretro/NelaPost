'use client'

import React from 'react'

export type AvatarConfig = {
  skin?: string
  hair?: string
  shirt?: string
  background?: string
}

const skins: Record<string, string> = { warm:'#C9855B', deep:'#70432F', rich:'#4A2C24', golden:'#E2AC78', fair:'#F0C8A4', rose:'#D99B83' }
const shirts: Record<string, string> = { green:'#087F5B', blue:'#3768A8', purple:'#7652A5', orange:'#D97736', pink:'#C65D85', black:'#30343B' }
const backgrounds: Record<string, string> = { mint:'#DDF2E7', sky:'#DCEBFA', lilac:'#EAE2F7', peach:'#F9E4D6', lemon:'#F5F0C9', slate:'#E5E9ED' }

export function cleanAvatarConfig(value: unknown): Required<AvatarConfig> {
  const config = value && typeof value === 'object' ? value as AvatarConfig : {}
  return {
    skin: skins[config.skin || ''] ? config.skin! : 'warm',
    hair: ['short','curly','long','coils'].includes(config.hair || '') ? config.hair! : 'coils',
    shirt: shirts[config.shirt || ''] ? config.shirt! : 'green',
    background: backgrounds[config.background || ''] ? config.background! : 'mint',
  }
}

export default function ProfileAvatar({ config, initials = 'N', size = 72 }: { config?: AvatarConfig; initials?: string; size?: number }) {
  const c = cleanAvatarConfig(config)
  const skin = skins[c.skin], shirt = shirts[c.shirt], bg = backgrounds[c.background]
  return (
    <span className="npAvatar" role="img" aria-label="Customisable profile avatar" style={{ width:size, height:size, background:bg, display:'inline-grid', placeItems:'center', borderRadius:'50%', overflow:'hidden', flexShrink:0 }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <path d="M15 100 Q18 72 39 69 L61 69 Q82 72 85 100Z" fill={shirt}/>
        <path d="M42 62 L58 62 L61 75 Q50 84 39 75Z" fill={skin}/>
        <ellipse cx="50" cy="45" rx="25" ry="30" fill={skin}/>
        {c.hair === 'long' && <path d="M24 39 Q16 6 49 7 Q82 6 76 39 L74 72 Q67 83 65 65 L67 34 Q50 21 33 34 L35 66 Q32 81 26 70Z" fill="#33251F"/>}
        {c.hair === 'short' && <path d="M25 42 Q18 10 49 10 Q81 10 75 42 L67 31 Q49 22 33 33Z" fill="#33251F"/>}
        {c.hair === 'curly' && <g fill="#33251F"><circle cx="30" cy="27" r="12"/><circle cx="42" cy="17" r="12"/><circle cx="56" cy="16" r="12"/><circle cx="69" cy="26" r="12"/><circle cx="24" cy="39" r="8"/><circle cx="75" cy="39" r="8"/></g>}
        {c.hair === 'coils' && <g fill="#33251F"><circle cx="28" cy="29" r="8"/><circle cx="38" cy="19" r="8"/><circle cx="49" cy="16" r="8"/><circle cx="60" cy="19" r="8"/><circle cx="71" cy="29" r="8"/><circle cx="24" cy="39" r="7"/><circle cx="76" cy="39" r="7"/><path d="M29 35 Q50 21 71 35 L68 43 Q50 33 32 43Z"/></g>}
        <ellipse cx="40" cy="46" rx="2.6" ry="3.3" fill="#292522"/><ellipse cx="60" cy="46" rx="2.6" ry="3.3" fill="#292522"/>
        <path d="M43 58 Q50 63 57 58" fill="none" stroke="#8F4C43" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M38 39 Q41 37 44 39 M56 39 Q59 37 62 39" fill="none" stroke="#33251F" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </span>
  )
}
