'use client'

import React from 'react'

export type AvatarConfig = {
  skin?: string
  hair?: string
  shirt?: string
  outfit?: string
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
    outfit: ['suit','tshirt','blazer'].includes(config.outfit || '') ? config.outfit! : 'tshirt',
    background: backgrounds[config.background || ''] ? config.background! : 'mint',
  }
}

export default function ProfileAvatar({ config, initials = 'N', size = 72 }: { config?: AvatarConfig; initials?: string; size?: number }) {
  const c = cleanAvatarConfig(config)
  const skin = skins[c.skin], clothing = shirts[c.shirt], bg = backgrounds[c.background]
  return (
    <span className="npAvatar" role="img" aria-label="Customisable block-style profile avatar" style={{ width:size, height:size, background:bg, display:'inline-grid', placeItems:'center', borderRadius:'50%', overflow:'hidden', flexShrink:0 }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        {/* Head and neck */}
        <path d="M40 62 L60 62 L61 76 Q50 82 39 76Z" fill={skin}/>

        {/* Business clothing options */}
        {c.outfit === 'tshirt' && <g>
          <path d="M12 100 L16 83 L34 72 L42 77 L50 83 L58 77 L66 72 L84 83 L88 100Z" fill={clothing}/>
          <path d="M40 75 L50 84 L60 75 L57 71 L43 71Z" fill={skin}/>
        </g>}
        {c.outfit === 'suit' && <g>
          <path d="M12 100 L16 83 L34 72 L43 76 L50 84 L57 76 L66 72 L84 83 L88 100Z" fill={clothing}/>
          <path d="M38 73 L50 86 L62 73 L57 70 L43 70Z" fill="#FFFFFF"/>
          <path d="M38 73 L47 84 L42 100 L25 100 L34 78Z" fill={clothing === '#30343B' ? '#454B55' : clothing}/>
          <path d="M62 73 L53 84 L58 100 L75 100 L66 78Z" fill={clothing === '#30343B' ? '#454B55' : clothing}/>
          <path d="M47 84 L50 88 L53 84 L52 100 L48 100Z" fill="#30343B"/>
        </g>}
        {c.outfit === 'blazer' && <g>
          <path d="M12 100 L16 83 L34 72 L43 76 L50 84 L57 76 L66 72 L84 83 L88 100Z" fill={clothing}/>
          <path d="M39 73 L50 84 L61 73 L56 70 L44 70Z" fill="#FFFFFF"/>
          <path d="M38 73 L47 84 L42 100 L26 100 L34 78Z" fill={clothing === '#30343B' ? '#454B55' : clothing}/>
          <path d="M62 73 L53 84 L58 100 L74 100 L66 78Z" fill={clothing === '#30343B' ? '#454B55' : clothing}/>
          <path d="M47 84 L53 84 L52 100 L48 100Z" fill="#FFFFFF"/>
        </g>}

        {/* Hair sits behind the rounded-square head */}
        {c.hair === 'long' && <path d="M22 43 Q17 9 50 8 Q83 9 78 43 L76 76 Q73 84 67 78 L67 37 Q50 25 33 37 L33 78 Q27 84 24 76Z" fill={hairColour}/>}
        {c.hair === 'short' && <path d="M24 43 Q19 9 50 9 Q81 9 76 43 L68 35 Q50 27 32 35Z" fill={hairColour}/>}
        {c.hair === 'curly' && <g fill={hairColour}><circle cx="29" cy="29" r="11"/><circle cx="39" cy="19" r="11"/><circle cx="50" cy="15" r="11"/><circle cx="61" cy="19" r="11"/><circle cx="71" cy="29" r="11"/><circle cx="24" cy="39" r="8"/><circle cx="76" cy="39" r="8"/></g>}
        {c.hair === 'coils' && <g fill={hairColour}><circle cx="28" cy="29" r="8"/><circle cx="38" cy="19" r="8"/><circle cx="49" cy="15" r="8"/><circle cx="60" cy="19" r="8"/><circle cx="71" cy="29" r="8"/><circle cx="24" cy="39" r="7"/><circle cx="76" cy="39" r="7"/></g>}

        {/* Rounded-square head */}
        <rect x="25" y="19" width="50" height="53" rx="9" fill={skin}/>

        {/* Front hairline, without eyebrows */}
        {c.hair === 'short' && <path d="M26 39 Q28 24 41 24 L59 24 Q72 25 74 39 L67 35 Q50 29 33 36Z" fill={hairColour}/>}
        {c.hair === 'curly' && <path d="M27 36 Q34 25 42 28 Q50 20 59 28 Q68 25 73 36 L68 41 Q50 33 32 41Z" fill={hairColour}/>}
        {c.hair === 'coils' && <path d="M27 36 Q33 27 40 30 Q50 22 60 30 Q68 27 73 36 L68 42 Q50 34 32 42Z" fill={hairColour}/>}
        {c.hair === 'long' && <path d="M26 39 Q28 23 42 23 L58 23 Q72 24 74 39 L67 35 Q50 28 33 35Z" fill={hairColour}/>}

        {/* Larger round white eyes with black pupils */}
        <circle cx="40" cy="48" r="7" fill="#FFFFFF"/>
        <circle cx="60" cy="48" r="7" fill="#FFFFFF"/>
        <circle cx="40" cy="48" r="3.3" fill="#171717"/>
        <circle cx="60" cy="48" r="3.3" fill="#171717"/>

        {/* Minimal friendly expression */}
        <path d="M43 60 Q50 64 57 60" fill="none" stroke="#7E4038" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </span>
  )
}
