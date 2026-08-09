import { useEffect, useState } from 'react'
import { ExternalLink, AlertTriangle, ArrowLeft } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8001'

export default function RedirectHandler({ shortId }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function handleRedirect() {
      try {
        const res = await fetch(`${BASE_URL}/${shortId}?json=true`)
        const data = await res.json()

        if (!isMounted) return

        if (res.ok && data.redirectURL) {
          window.location.href = data.redirectURL
        } else {
          setError(data.error || 'Short URL not found')
          setLoading(false)
        }
      } catch (err) {
        if (!isMounted) return
        setError('Unable to reach server. Please check your backend connection.')
        setLoading(false)
      }
    }

    handleRedirect()

    return () => {
      isMounted = false
    }
  }, [shortId])

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
          Redirecting...
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Taking you to destination for link <strong>/{shortId}</strong>
        </p>
      </div>
    )
  }

  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{
        display: 'inline-flex',
        padding: 12,
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        marginBottom: 16
      }}>
        <AlertTriangle size={28} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
        Link Not Found
      </h3>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24 }}>
        {error}
      </p>
      <a
        href="/"
        className="btn btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        onClick={(e) => {
          e.preventDefault()
          window.history.pushState({}, '', '/')
          window.location.reload()
        }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </a>
    </div>
  )
}
