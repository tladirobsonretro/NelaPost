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
const hairColour = '#33251F'

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
    <span className="npAvatar" role="img" aria-label="Customisable block-style profile avatar" style={{ width:size, height:size, background:bg, display:'inline-grid', placeItems:'center', borderRadius:'50%', overflow:'hidden', flexShrink:0 }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        {/* Geometric shoulders and torso */}
        <path d="M12 100 L16 83 Q20 72 37 70 L63 70 Q80 72 84 83 L88 100Z" fill={shirt}/>
        <path d="M40 62 L60 62 L61 74 Q50 81 39 74Z" fill={skin}/>

        {/* Hair sits behind the head to create a toy-like silhouette */}
        {c.hair === 'long' && <path d="M22 43 Q17 9 50 8 Q83 9 78 43 L76 76 Q73 84 67 78 L67 37 Q50 25 33 37 L33 78 Q27 84 24 76Z" fill={hairColour}/>}
        {c.hair === 'short' && <path d="M24 43 Q19 9 50 9 Q81 9 76 43 L68 35 Q50 27 32 35Z" fill={hairColour}/>}
        {c.hair === 'curly' && <g fill={hairColour}><circle cx="29" cy="29" r="11"/><circle cx="39" cy="19" r="11"/><circle cx="50" cy="15" r="11"/><circle cx="61" cy="19" r="11"/><circle cx="71" cy="29" r="11"/><circle cx="24" cy="39" r="8"/><circle cx="76" cy="39" r="8"/></g>}
        {c.hair === 'coils' && <g fill={hairColour}><circle cx="28" cy="29" r="8"/><circle cx="38" cy="19" r="8"/><circle cx="49" cy="15" r="8"/><circle cx="60" cy="19" r="8"/><circle cx="71" cy="29" r="8"/><circle cx="24" cy="39" r="7"/><circle cx="76" cy="39" r="7"/></g>}

        {/* Rounded-square head: deliberately not an oval */}
        <rect x="25" y="19" width="50" height="53" rx="9" fill={skin}/>

        {/* Simple front hairline keeps each hairstyle readable */}
        {c.hair === 'short' && <path d="M26 39 Q28 24 41 24 L59 24 Q72 25 74 39 L67 35 Q50 29 33 36Z" fill={hairColour}/>}
        {c.hair === 'curly' && <path d="M27 36 Q34 25 42 28 Q50 20 59 28 Q68 25 73 36 L68 41 Q50 33 32 41Z" fill={hairColour}/>}
        {c.hair === 'coils' && <path d="M27 36 Q33 27 40 30 Q50 22 60 30 Q68 27 73 36 L68 42 Q50 34 32 42Z" fill={hairColour}/>}
        {c.hair === 'long' && <path d="M26 39 Q28 23 42 23 L58 23 Q72 24 74 39 L67 35 Q50 28 33 35Z" fill={hairColour}/>}

        {/* Tall white pill eyes with clear black pupils */}
        <ellipse cx="40" cy="47" rx="5" ry="8" fill="#FFFFFF"/>
        <ellipse cx="60" cy="47" rx="5" ry="8" fill="#FFFFFF"/>
        <ellipse cx="40" cy="48" rx="2.4" ry="3.6" fill="#171717"/>
        <ellipse cx="60" cy="48" rx="2.4" ry="3.6" fill="#171717"/>

        {/* Minimal friendly expression */}
        <path d="M43 60 Q50 64 57 60" fill="none" stroke="#7E4038" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </span>
  )
}
