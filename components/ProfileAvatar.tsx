'use client'

import React from 'react'

const allowedEmojis = ['🙂','😎','👩','👨','🧑','👩‍💻','👨‍💻','🧑‍💼']

export default function ProfileAvatar({ emoji = '🙂', size = 40 }: { emoji?: string; size?: number }) {
  const safeEmoji = allowedEmojis.includes(emoji) ? emoji : '🙂'
  return (
    <span
      className="npAvatar"
      role="img"
      aria-label="Profile avatar"
      style={{
        width: size,
        height: size,
        display: 'inline-grid',
        placeItems: 'center',
        borderRadius: '50%',
        background: '#eaf5ee',
        flexShrink: 0,
        fontSize: size * 0.68,
        lineHeight: 1,
      }}
    >
      {safeEmoji}
    </span>
  )
}
