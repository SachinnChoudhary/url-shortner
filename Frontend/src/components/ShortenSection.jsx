import { useState } from 'react'
import { Link2, ArrowRight, Copy, ExternalLink, CheckCheck } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8001'
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')

const HISTORY_KEY = 'snip_history'

function saveToHistory(original, shortId) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  const entry = {
    shortId,
    original,
    shortUrl: `${FRONTEND_URL}/${shortId}`,
    createdAt: Date.now(),
  }
  // Avoid duplicates
  const updated = [entry, ...history.filter(h => h.shortId !== shortId)].slice(0, 50)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export default function ShortenSection({ showToast }) {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShorten = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`${BASE_URL}/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (res.ok) {
        const shortUrl = `${FRONTEND_URL}/${data.id}`
        setResult({ shortUrl, shortId: data.id })
        saveToHistory(url, data.id)
        setUrl('')
        showToast('Short URL created!', 'success')
      } else {
        showToast(data.error || 'Failed to shorten URL', 'error')
      }
    } catch {
      showToast('Cannot reach server. Is it running on port 8001?', 'error')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      showToast('Copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Copy failed', 'error')
    }
  }

  return (
    <div className="card">
      <p className="card-title">Paste your URL</p>

      <form onSubmit={handleShorten}>
        <div className="input-group">
          <div className="input-wrap">
            <span className="input-icon">
              <Link2 size={15} />
            </span>
            <input
              id="shorten-input"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-very-long-url.com/goes/here"
              required
              autoFocus
            />
          </div>
          <button
            id="shorten-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" /> Shortening…</>
              : <><ArrowRight size={15} strokeWidth={2.5} /> Shorten</>
            }
          </button>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div className="result-box">
          <a
            id="result-url-link"
            href={result.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="result-url"
          >
            {result.shortUrl}
          </a>
          <div className="result-actions">
            <button
              id="copy-btn"
              className="btn-icon"
              onClick={() => copyToClipboard(result.shortUrl)}
              title="Copy"
            >
              {copied ? <CheckCheck size={15} color="var(--green)" /> : <Copy size={15} />}
            </button>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-icon"
              title="Open"
            >
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      )}

      <div className="divider" />

      {/* Tips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          'Links redirect instantly to the original URL',
          'Every click is tracked with a timestamp',
          'Use the Analytics tab to check click stats',
        ].map((tip, i) => (
          <p key={i} style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ color: 'var(--text-dim)' }}>–</span>
            {tip}
          </p>
        ))}
      </div>
    </div>
  )
}
