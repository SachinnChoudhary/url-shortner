import { useState } from 'react'
import { Hash, MousePointerClick, Clock, BarChart2, ArrowRight } from 'lucide-react'

const BASE_URL = 'http://localhost:8001'

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

export default function AnalyticsSection({ showToast }) {
  const [shortId, setShortId] = useState('')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = async (e) => {
    e.preventDefault()
    const id = shortId.trim()
    if (!id) return

    setLoading(true)
    setData(null)

    try {
      const res = await fetch(`${BASE_URL}/url/analytics/${id}`)
      const json = await res.json()

      if (res.ok) {
        setData(json)
      } else {
        showToast('Short ID not found', 'error')
      }
    } catch {
      showToast('Cannot reach server', 'error')
    } finally {
      setLoading(false)
    }
  }

  const firstSeen = data?.analytics?.length
    ? Math.min(...data.analytics.map(a => a.timestamp))
    : null

  const lastSeen = data?.analytics?.length
    ? Math.max(...data.analytics.map(a => a.timestamp))
    : null

  return (
    <div className="card">
      <p className="card-title">Track a Short URL</p>

      <form onSubmit={fetchAnalytics}>
        <div className="input-group">
          <div className="input-wrap">
            <span className="input-icon">
              <Hash size={15} />
            </span>
            <input
              id="analytics-input"
              type="text"
              value={shortId}
              onChange={e => setShortId(e.target.value)}
              placeholder="Enter short ID (e.g. aB3xYz)"
              required
            />
          </div>
          <button
            id="analytics-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" /> Fetching…</>
              : <><ArrowRight size={15} strokeWidth={2.5} /> Analyze</>
            }
          </button>
        </div>
      </form>

      {data && (
        <>
          <div className="divider" />

          {/* Stats */}
          <div className="analytics-summary">
            <div className="stat-box">
              <div className="stat-value">
                {data.totalClicks}
              </div>
              <div className="stat-label">
                <MousePointerClick size={11} style={{ display: 'inline', marginRight: 4 }} />
                Total Clicks
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{ fontSize: 20, paddingTop: 6 }}>
                {lastSeen ? timeAgo(lastSeen) : '—'}
              </div>
              <div className="stat-label">
                <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                Last Click
              </div>
            </div>
          </div>

          {/* Visit history */}
          <p className="card-title" style={{ marginBottom: 12 }}>Visit History</p>

          {data.analytics.length === 0 ? (
            <div className="empty-state">No visits recorded yet.</div>
          ) : (
            <div className="visit-list">
              {[...data.analytics].reverse().map((item, i) => (
                <div key={i} className="visit-item">
                  <span className="visit-dot" />
                  <span className="visit-num">#{data.analytics.length - i}</span>
                  <span style={{ flex: 1 }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    {timeAgo(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
