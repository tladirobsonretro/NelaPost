'use client'

import React from 'react'

export const animalAvatars = [
  { id: 'elephant', label: 'Elephant' },
  { id: 'wolf', label: 'Wolf' },
  { id: 'lion', label: 'Lion' },
  { id: 'fox', label: 'Fox' },
  { id: 'owl', label: 'Owl' },
  { id: 'bear', label: 'Bear' },
  { id: 'panda', label: 'Panda' },
  { id: 'tiger', label: 'Tiger' },
  { id: 'eagle', label: 'Eagle' },
  { id: 'shark', label: 'Shark' },
] as const

export type AnimalAvatarId = typeof animalAvatars[number]['id']

export function isAnimalAvatarId(value: unknown): value is AnimalAvatarId {
  return animalAvatars.some((animal) => animal.id === value)
}

export default function ProfileAvatar({ animal = 'elephant', size = 40 }: { animal?: string; size?: number }) {
  const safeAnimal = isAnimalAvatarId(animal) ? animal : 'elephant'
  const label = animalAvatars.find((item) => item.id === safeAnimal)?.label || 'Elephant'
  return (
    <span className="npAvatar" role="img" aria-label={label + ' avatar'} style={{ width: size, height: size, display: 'inline-block', overflow: 'hidden', borderRadius: '50%', background: '#050505', flexShrink: 0, lineHeight: 0 }}>
      <img src={'/avatars/' + safeAnimal + '.svg'} alt="" width={size} height={size} draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
    </span>
  )
}
