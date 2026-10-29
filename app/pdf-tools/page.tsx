'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { jsPDF } from 'jspdf'

type Task = 'merge' | 'extract' | 'rotate' | 'images'
const field: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid #dfe3e8', borderRadius: 10, padding: '11px 12px', font: 'inherit', fontSize: 13, background: '#fff', color: '#171923' }
const button: React.CSSProperties = { border: '1px solid #dce1e6', borderRadius: 10, padding: '11px 15px', background: '#fff', color: '#303440', fontSize: 12, fontWeight: 800, cursor: 'pointer' }
function saveBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1500) }
function safeName(name: string) { return name.replace(/\.pdf$/i, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'document' }
function parsePages(value: string, total: number): number[] {
  const result = new Set<number>()
  for (const part of value.split(',')) {
    const token = part.trim()
    if (!token) continue
    const range = token.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const start = Number(range[1]), end = Number(range[2])
      if (start < 1 || end < start || end > total) throw new Error('Page range "' + token + '" is outside this PDF. It has ' + total + ' pages.')
      for (let page = start; page <= end; page++) result.add(page - 1)
    } else {
      if (!/^\d+$/.test(token)) throw new Error('Use page numbers like 1, 3, 5-7.')
      const page = Number(token)
      if (page < 1 || page > total) throw new Error('Page ' + page + ' is outside this PDF. It has ' + total + ' pages.')
      result.add(page - 1)
    }
  }
  if (!result.size) throw new Error('Enter at least one page number.')
  return [...result].sort((a, b) => a - b)
}

export default function PDFToolsPage() {
  const [task, setTask] = useState<Task>('merge')
  const [files, setFiles] = useState<File[]>([])
  const [pageRange, setPageRange] = useState('1')
  const [rotateBy, setRotateBy] = useState('90')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const resetFiles = (next: File[]) => { setFiles(next); setMessage(''); setError('') }
  const addFiles = (list: FileList | null) => { if (!list) return; const incoming = Array.from(list).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')); resetFiles(task === 'merge' ? [...files, ...incoming] : incoming.slice(0, 1)) }
  async function run() {
    setBusy(true); setError(''); setMessage('')
    try {
      if (task === 'images') {
        if (!files.length) throw new Error('Choose one or more image files first.')
        const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read ' + file.name)); reader.onerror = () => reject(new Error('Could not read ' + file.name)); reader.readAsDataURL(file) })
          const image = new Image()
          await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error(file.name + ' is not a supported image.')); image.src = dataUrl })
          if (i > 0) pdf.addPage()
          const pageW = pdf.internal.pageSize.getWidth() - 48, pageH = pdf.internal.pageSize.getHeight() - 48
          const scale = Math.min(pageW / image.naturalWidth, pageH / image.naturalHeight)
          const w = image.naturalWidth * scale, h = image.naturalHeight * scale
          pdf.addImage(dataUrl, file.type.includes('png') ? 'PNG' : 'JPEG', (pdf.internal.pageSize.getWidth() - w) / 2, (pdf.internal.pageSize.getHeight() - h) / 2, w, h, undefined, 'FAST')
        }
        saveBlob(pdf.output('blob'), 'nelapost-images.pdf')
        setMessage('Your PDF is ready. The images were fitted to A4 pages and downloaded to your device.')
        return
      }
      if (!files.length) throw new Error('Choose a PDF file first.')
      if (task === 'merge' && files.length < 2) throw new Error('Choose at least two PDFs to merge.')
      if (task === 'merge') {
        const merged = await PDFDocument.create()
        for (const file of files) {
          const source = await PDFDocument.load(await file.arrayBuffer())
          const pages = await merged.copyPages(source, source.getPageIndices())
          pages.forEach(page => merged.addPage(page))
        }
        saveBlob(new Blob([await merged.save({ useObjectStreams: true }) as BlobPart], { type: 'application/pdf' }), 'nelapost-merged.pdf')
        setMessage('Merged ' + files.length + ' PDFs into one file.')
      } else if (task === 'extract') {
        const source = await PDFDocument.load(await files[0].arrayBuffer())
        const selected = parsePages(pageRange, source.getPageCount())
        const output = await PDFDocument.create()
        const pages = await output.copyPages(source, selected)
        pages.forEach(page => output.addPage(page))
        saveBlob(new Blob([await output.save({ useObjectStreams: true }) as BlobPart], { type: 'application/pdf' }), safeName(files[0].name) + '-pages.pdf')
        setMessage('Downloaded ' + selected.length + ' selected page(s) in the order shown in your page selection.')
      } else {
        const source = await PDFDocument.load(await files[0].arrayBuffer())
        const rotation = Number(rotateBy)
        source.getPages().forEach(page => page.setRotation(degrees((page.getRotation().angle + rotation + 360) % 360)))
        saveBlob(new Blob([await source.save({ useObjectStreams: true }) as BlobPart], { type: 'application/pdf' }), safeName(files[0].name) + '-rotated.pdf')
        setMessage('Rotated every page and downloaded the updated PDF.')
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Try another file.') }
    finally { setBusy(false) }
  }
  const tasks: { id: Task; title: string; detail: string }[] = [
    { id: 'merge', title: 'Merge PDFs', detail: 'Combine several PDFs into one document.' },
    { id: 'extract', title: 'Extract pages', detail: 'Keep only the pages you need.' },
    { id: 'rotate', title: 'Rotate pages', detail: 'Rotate every page in a PDF.' },
    { id: 'images', title: 'Images to PDF', detail: 'Put images into a single PDF.' }
  ]
  return <main style={{ minHeight: '100vh', background: '#f7f8fa', color: '#171923', fontFamily: 'Inter,Arial,sans-serif', padding: '24px 18px 50px', boxSizing: 'border-box' }}>
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#087f5b', fontWeight: 800, fontSize: 20 }}>NelaPost <span style={{ color: '#747887', fontWeight: 500, fontSize: 12 }}>Essentials</span></Link>
        <Link href="/" style={{ color: '#087f5b', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>← All Essentials</Link>
      </header>
      <p style={{ color: '#087f5b', fontWeight: 800, fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>PDF TOOLS</p>
      <h1 style={{ fontSize: 'clamp(32px,6vw,46px)', letterSpacing: -1.5, margin: '0 0 12px' }}>Your documents, sorted.</h1>
      <p style={{ color: '#666b78', fontSize: 14, lineHeight: 1.7, maxWidth: 660, margin: '0 0 25px' }}>Merge files, extract pages, rotate PDFs or turn images into a PDF. Files are processed in your browser and are not uploaded to NelaPost.</p>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))', gap: 10, marginBottom: 20 }}>
        {tasks.map(item => <button key={item.id} type="button" onClick={() => { setTask(item.id); resetFiles([]); if (inputRef.current) inputRef.current.value = '' }} style={{ ...button, textAlign: 'left', padding: 15, background: task === item.id ? '#eaf6ef' : '#fff', borderColor: task === item.id ? '#a8d8bf' : '#dce1e6' }}><strong style={{ display: 'block', color: task === item.id ? '#087f5b' : '#303440', marginBottom: 6 }}>{item.title}</strong><span style={{ display: 'block', color: '#747887', fontWeight: 400, lineHeight: 1.5 }}>{item.detail}</span></button>)}
      </section>
      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 22, boxShadow: '0 8px 26px rgba(20,24,35,.035)' }}>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>{tasks.find(item => item.id === task)?.title}</h2>
        <p style={{ color: '#747887', fontSize: 12, lineHeight: 1.6, margin: '0 0 17px' }}>{task === 'merge' ? 'Choose two or more PDFs. Files are merged in the order you select them.' : task === 'extract' ? 'Choose a PDF and enter pages such as 1, 3, 5-7.' : task === 'rotate' ? 'Choose a PDF and rotate every page by 90, 180 or 270 degrees.' : 'Choose JPG, PNG or other browser-supported images. Each image becomes one A4 page.'}</p>
        <input ref={inputRef} type="file" accept={task === 'images' ? 'image/*' : 'application/pdf,.pdf'} multiple={task === 'merge' || task === 'images'} onChange={event => task === 'images' ? resetFiles(Array.from(event.target.files || [])) : addFiles(event.target.files)} style={{ ...field, padding: 10 }} />
        {files.length > 0 && <div style={{ marginTop: 13, padding: 12, background: '#f7f8fa', borderRadius: 10 }}><div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>{files.length} file(s) selected</div>{files.map((file, i) => <div key={file.name + i} style={{ fontSize: 12, color: '#626672', padding: '4px 0', overflowWrap: 'anywhere' }}>{i + 1}. {file.name} <span style={{ color: '#9296a0' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span></div>)}</div>}
        {task === 'extract' && <div style={{ marginTop: 16 }}><label htmlFor="pdf-pages" style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 7 }}>PAGES TO KEEP</label><input id="pdf-pages" value={pageRange} onChange={event => setPageRange(event.target.value)} placeholder="e.g. 1, 3, 5-7" style={field} /></div>}
        {task === 'rotate' && <div style={{ marginTop: 16 }}><label htmlFor="pdf-rotate" style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 7 }}>ROTATION</label><select id="pdf-rotate" value={rotateBy} onChange={event => setRotateBy(event.target.value)} style={field}><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option></select></div>}
        {error && <p role="alert" style={{ color: '#b42318', fontSize: 12, lineHeight: 1.5, margin: '14px 0 0' }}>{error}</p>}
        {message && <p role="status" style={{ color: '#087f5b', fontSize: 12, lineHeight: 1.5, margin: '14px 0 0' }}>{message}</p>}
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 18 }}><button type="button" onClick={run} disabled={busy || !files.length} style={{ ...button, background: '#087f5b', borderColor: '#087f5b', color: '#fff', opacity: busy || !files.length ? .5 : 1 }}>{busy ? 'Working on your files…' : 'Process and download'}</button><button type="button" onClick={() => { resetFiles([]); if (inputRef.current) inputRef.current.value = '' }} style={button}>Clear files</button></div>
      </section>
      <p style={{ color: '#777d89', fontSize: 11, lineHeight: 1.7, marginTop: 18 }}>Privacy note: processing happens on your device. This page does not send your files to NelaPost. Large or password-protected PDFs may not work. This first release does not yet offer true PDF compression or PDF-to-Word conversion.</p>
    </div>
  </main>
}
