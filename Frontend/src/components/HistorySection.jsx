import { useState, useEffect } from 'react'
import { Clock, Copy, Trash2, ExternalLink, LinkIcon } from 'lucide-react'

const HISTORY_KEY = 'snip_history'

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp
  const s = Math.floor(diff / 1000)
  if (s < 60)   return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function HistorySection({ showToast }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    setHistory(stored)
  }, [])

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      showToast('Copied!', 'success')
    } catch {
      showToast('Copy failed', 'error')
    }
  }

  const removeItem = (shortId) => {
    const updated = history.filter(h => h.shortId !== shortId)
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    showToast('Removed', 'success')
  }

  const clearAll = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
    showToast('History cleared', 'success')
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p className="card-title" style={{ marginBottom: 0 }}>
          <Clock size={13} />
          Recent Links
          {history.length > 0 && (
            <span style={{
              marginLeft: 6, fontSize: 11, fontWeight: 600,
              background: 'var(--accent-glow)', color: 'var(--accent)',
              borderRadius: 100, padding: '2px 8px',
              border: '1px solid rgba(108,99,255,0.3)',
            }}>
              {history.length}
            </span>
          )}
        </p>
        {history.length > 0 && (
          <button
            id="clear-history-btn"
            className="btn-icon"
            onClick={clearAll}
            title="Clear all history"
          >
            <Trash2 size={14} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <LinkIcon size={32} className="empty-icon" style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
          No links yet. Shorten a URL to see it here.
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, i) => (
            <div key={item.shortId} className="history-item" id={`history-item-${i}`}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={item.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="history-short"
                >
                  {item.shortUrl}
                </a>
                <span className="history-original">
                  {item.original}
                </span>
              </div>
              <span className="history-time">{timeAgo(item.createdAt)}</span>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                <button
                  className="btn-icon"
                  onClick={() => copyUrl(item.shortUrl)}
                  title="Copy"
                >
                  <Copy size={13} />
                </button>
                <a
                  href={item.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-icon"
                  title="Open"
                  style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  className="btn-icon"
                  onClick={() => removeItem(item.shortId)}
                  title="Remove"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
