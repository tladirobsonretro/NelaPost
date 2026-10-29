'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp'
type CropMode = 'original' | 'square' | 'landscape' | 'wide' | 'portrait'
let backgroundRemovalPipeline: Promise<any> | null = null
const field: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid #dfe3e8', borderRadius: 10, padding: '11px 12px', font: 'inherit', fontSize: 13, background: '#fff', color: '#171923' }
const button: React.CSSProperties = { border: '1px solid #dce1e6', borderRadius: 10, padding: '11px 15px', background: '#fff', color: '#303440', fontSize: 12, fontWeight: 800, cursor: 'pointer' }
function downloadBlob(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1500) }
function outputName(name: string, format: OutputFormat) { const base = name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'image'; return base + (format === 'image/jpeg' ? '.jpg' : format === 'image/png' ? '.png' : '.webp') }

export default function ImageToolsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [format, setFormat] = useState<OutputFormat>('image/jpeg')
  const [quality, setQuality] = useState(78)
  const [maxDimension, setMaxDimension] = useState('1600')
  const [crop, setCrop] = useState<CropMode>('original')
  const [background, setBackground] = useState('#ffffff')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [removedUrl, setRemovedUrl] = useState('')
  const [removeBusy, setRemoveBusy] = useState(false)
  const [removeProgress, setRemoveProgress] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (!file) { setPreviewUrl(''); return }; const url = URL.createObjectURL(file); setPreviewUrl(url); return () => URL.revokeObjectURL(url) }, [file])
  function choose(next: File | null) { setFile(next); setError(''); setMessage(''); setRemovedUrl(''); setRemoveProgress('') }
  async function removeImageBackground() {
    if (!file) { setError('Choose an image first.'); return }
    setRemoveBusy(true); setError(''); setMessage(''); setRemovedUrl(''); setRemoveProgress('Loading the background-removal model…')
    let sourceUrl = ''
    try {
      const { pipeline } = await import('@huggingface/transformers')
      if (!backgroundRemovalPipeline) backgroundRemovalPipeline = pipeline('background-removal', 'xrds/isnet-general-onnx-int8', { dtype: 'q8' })
      const remover = await backgroundRemovalPipeline
      setRemoveProgress('Removing the background on your device…')
      sourceUrl = URL.createObjectURL(file)
      const results = await remover(sourceUrl)
      if (!results?.[0] || typeof results[0].toBlob !== 'function') throw new Error('The model did not return an image. Please try another image.')
      const blob = await results[0].toBlob()
      if (!(blob instanceof Blob) || blob.size === 0) throw new Error('Could not create the transparent PNG. Please try again.')
      setRemovedUrl(URL.createObjectURL(blob))
      setMessage('Background removed. Preview the transparent PNG below, then download it.')
      setRemoveProgress('')
    } catch (e) {
      backgroundRemovalPipeline = null
      setRemoveProgress('')
      setError('Background removal could not finish. Check your connection for the first model download and try again. ' + (e instanceof Error ? e.message : ''))
    } finally {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl)
      setRemoveBusy(false)
    }
  }
  async function processImage() {
    if (!file) { setError('Choose an image first.'); return }
    setBusy(true); setError(''); setMessage('')
    try {
      const image = new Image()
      const src = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read this image.')); reader.onerror = () => reject(new Error('Could not read this image.')); reader.readAsDataURL(file) })
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('This image format is not supported by your browser.')); image.src = src })
      let sourceW = image.naturalWidth, sourceH = image.naturalHeight
      let targetRatio: number | null = null
      if (crop === 'square') targetRatio = 1
      if (crop === 'landscape') targetRatio = 4 / 3
      if (crop === 'wide') targetRatio = 16 / 9
      if (crop === 'portrait') targetRatio = 4 / 5
      if (targetRatio) {
        if (sourceW / sourceH > targetRatio) sourceW = sourceH * targetRatio
        else sourceH = sourceW / targetRatio
      }
      const max = maxDimension === 'original' ? Infinity : Number(maxDimension)
      if (!Number.isFinite(max) && maxDimension !== 'original') throw new Error('Choose a valid maximum size.')
      const scale = Math.min(1, max / Math.max(sourceW, sourceH))
      const width = Math.max(1, Math.round(sourceW * scale)), height = Math.max(1, Math.round(sourceH * scale))
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Your browser could not prepare the image.')
      if (format === 'image/jpeg') { context.fillStyle = background; context.fillRect(0, 0, width, height) }
      const sx = (image.naturalWidth - sourceW) / 2, sy = (image.naturalHeight - sourceH) / 2
      context.drawImage(image, sx, sy, sourceW, sourceH, 0, 0, width, height)
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Could not export this image. Try a different format.')), format, format === 'image/png' ? undefined : quality / 100))
      downloadBlob(blob, outputName(file.name, format))
      const saved = ((1 - blob.size / file.size) * 100)
      const sizeNote = saved >= 0 ? saved.toFixed(0) + '% smaller than the original' : Math.abs(saved).toFixed(0) + '% larger than the original'
      setMessage('Downloaded ' + width + ' × ' + height + ' px. The new file is ' + sizeNote + '.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong while processing this image.') }
    finally { setBusy(false) }
  }
  return <main style={{ minHeight: '100vh', background: '#f7f8fa', color: '#171923', fontFamily: 'Inter,Arial,sans-serif', padding: '24px 18px 50px', boxSizing: 'border-box' }}>
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#087f5b', fontWeight: 800, fontSize: 20 }}>NelaPost <span style={{ color: '#747887', fontWeight: 500, fontSize: 12 }}>Essentials</span></Link>
        <Link href="/" style={{ color: '#087f5b', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>← All Essentials</Link>
      </header>
      <p style={{ color: '#a85a12', fontWeight: 800, fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>IMAGE TOOLS</p>
      <h1 style={{ fontSize: 'clamp(32px,6vw,46px)', letterSpacing: -1.5, margin: '0 0 12px' }}>Make every image fit.</h1>
      <p style={{ color: '#666b78', fontSize: 14, lineHeight: 1.7, maxWidth: 660, margin: '0 0 25px' }}>Resize, compress, crop and convert images for websites, CVs, product listings and social posts. Everything is processed on your device.</p>
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 20, boxShadow: '0 8px 26px rgba(20,24,35,.035)', minWidth: 0 }}>
          <h2 style={{ fontSize: 17, margin: '0 0 7px' }}>1. Choose an image</h2>
          <p style={{ color: '#747887', fontSize: 12, lineHeight: 1.6, margin: '0 0 14px' }}>JPG, PNG, WebP and other formats supported by your browser.</p>
          <input ref={inputRef} type="file" accept="image/*" onChange={event => choose(event.target.files?.[0] || null)} style={{ ...field, padding: 10 }} />
          {file && <p style={{ color: '#626672', fontSize: 11, overflowWrap: 'anywhere', lineHeight: 1.5 }}>{file.name}<br />{(file.size / 1024).toFixed(0)} KB · {file.type || 'Image file'}</p>}
          <div style={{ background: '#f7f8fa', borderRadius: 12, minHeight: 190, display: 'grid', placeItems: 'center', overflow: 'hidden', marginTop: 14, padding: 8 }}>
            {previewUrl ? <img src={previewUrl} alt="Selected image preview" style={{ display: 'block', maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} /> : <span style={{ color: '#9296a0', fontSize: 12 }}>Your preview will appear here</span>}
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 20, boxShadow: '0 8px 26px rgba(20,24,35,.035)', minWidth: 0 }}>
          <h2 style={{ fontSize: 17, margin: '0 0 7px' }}>2. Adjust your image</h2>
          <p style={{ color: '#747887', fontSize: 12, lineHeight: 1.6, margin: '0 0 16px' }}>You can change these settings before each download.</p>
          <label htmlFor="image-format" style={{ display: 'block', fontSize: 11, fontWeight: 800, marginBottom: 7 }}>OUTPUT FORMAT</label>
          <select id="image-format" value={format} onChange={event => setFormat(event.target.value as OutputFormat)} style={field}><option value="image/jpeg">JPG (smaller files)</option><option value="image/png">PNG (supports transparency)</option><option value="image/webp">WebP (web-friendly)</option></select>
          <label htmlFor="image-size" style={{ display: 'block', fontSize: 11, fontWeight: 800, margin: '16px 0 7px' }}>MAXIMUM LONGEST EDGE</label>
          <select id="image-size" value={maxDimension} onChange={event => setMaxDimension(event.target.value)} style={field}><option value="original">Keep original size</option><option value="320">320 px · thumbnail</option><option value="800">800 px · small web image</option><option value="1200">1,200 px · social / web</option><option value="1600">1,600 px · standard</option><option value="2400">2,400 px · high resolution</option><option value="4000">4,000 px · large</option></select>
          <label htmlFor="image-crop" style={{ display: 'block', fontSize: 11, fontWeight: 800, margin: '16px 0 7px' }}>CROP / ASPECT RATIO</label>
          <select id="image-crop" value={crop} onChange={event => setCrop(event.target.value as CropMode)} style={field}><option value="original">Original proportions</option><option value="square">Square · 1:1</option><option value="landscape">Landscape · 4:3</option><option value="wide">Wide · 16:9</option><option value="portrait">Portrait · 4:5</option></select>
          {format !== 'image/png' && <><label htmlFor="image-quality" style={{ display: 'block', fontSize: 11, fontWeight: 800, margin: '16px 0 7px' }}>COMPRESSION QUALITY: {quality}%</label><input id="image-quality" type="range" min="35" max="100" step="1" value={quality} onChange={event => setQuality(Number(event.target.value))} style={{ width: '100%', accentColor: '#087f5b' }} /><div style={{ display: 'flex', justifyContent: 'space-between', color: '#9296a0', fontSize: 10 }}><span>Smaller file</span><span>Higher quality</span></div></>}
          {format === 'image/jpeg' && <><label htmlFor="image-background" style={{ display: 'block', fontSize: 11, fontWeight: 800, margin: '16px 0 7px' }}>TRANSPARENT AREAS BECOME</label><select id="image-background" value={background} onChange={event => setBackground(event.target.value)} style={field}><option value="#ffffff">White</option><option value="#000000">Black</option><option value="#f2f2f2">Light grey</option></select></>}
          <div style={{ marginTop: 18, borderTop: '1px solid #edf0f2', paddingTop: 18 }}>
            <h3 style={{ fontSize: 14, margin: '0 0 6px' }}>Remove Background</h3>
            <p style={{ color: '#747887', fontSize: 12, lineHeight: 1.6, margin: '0 0 12px' }}>Use AI to isolate the main subject and create a transparent PNG. Your image is processed on your device and is not uploaded to NelaPost. The model downloads the first time you use this feature.</p>
            <button type="button" onClick={removeImageBackground} disabled={!file || removeBusy || busy} style={{ ...button, width: '100%', background: '#fff', borderColor: '#087f5b', color: '#087f5b', opacity: !file || removeBusy || busy ? .5 : 1 }}>{removeBusy ? 'Removing background…' : 'Remove Background'}</button>
            {removeProgress && <p role="status" style={{ color: '#626672', fontSize: 12, lineHeight: 1.5, margin: '10px 0 0' }}>{removeProgress}</p>}
            {removedUrl && <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 800, margin: '0 0 8px' }}>TRANSPARENT PREVIEW</p>
              <div style={{ minHeight: 180, display: 'grid', placeItems: 'center', overflow: 'hidden', padding: 10, borderRadius: 12, backgroundColor: '#fff', backgroundImage: 'linear-gradient(45deg,#e7e9ed 25%,transparent 25%),linear-gradient(-45deg,#e7e9ed 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e7e9ed 75%),linear-gradient(-45deg,transparent 75%,#e7e9ed 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0,0 10px,10px -10px,-10px 0px' }}>
                <img src={removedUrl} alt="Image with background removed and transparency preserved" style={{ display: 'block', maxWidth: '100%', maxHeight: 340, objectFit: 'contain' }} />
              </div>
              <button type="button" onClick={() => { const a = document.createElement('a'); a.href = removedUrl; a.download = outputName(file?.name || 'image', 'image/png'); document.body.appendChild(a); a.click(); a.remove() }} style={{ ...button, width: '100%', marginTop: 10, background: '#087f5b', borderColor: '#087f5b', color: '#fff' }}>Download Transparent PNG</button>
            </div>}
          </div>
          <button type="button" onClick={processImage} disabled={!file || busy} style={{ ...button, width: '100%', marginTop: 20, background: '#087f5b', borderColor: '#087f5b', color: '#fff', opacity: !file || busy ? .5 : 1 }}>{busy ? 'Processing on your device…' : 'Process and download'}</button>
          {error && <p role="alert" style={{ color: '#b42318', fontSize: 12, lineHeight: 1.5, margin: '13px 0 0' }}>{error}</p>}
          {message && <p role="status" style={{ color: '#087f5b', fontSize: 12, lineHeight: 1.6, margin: '13px 0 0' }}>{message}</p>}
          <button type="button" onClick={() => { choose(null); if (inputRef.current) inputRef.current.value = '' }} style={{ ...button, width: '100%', marginTop: 9 }}>Clear image</button>
        </div>
      </section>
      <p style={{ color: '#777d89', fontSize: 11, lineHeight: 1.7, marginTop: 18 }}>Privacy note: your image stays in your browser and is not uploaded to NelaPost. PNG output ignores the quality slider because PNG is lossless. Animated GIFs are processed as a single still image. Very large images may depend on your device memory.</p>
    </div>
  </main>
}
