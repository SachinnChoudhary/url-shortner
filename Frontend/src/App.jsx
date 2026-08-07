import { useState, useCallback } from 'react'
import { Link2, BarChart2, Clock } from 'lucide-react'
import ShortenSection from './components/ShortenSection'
import AnalyticsSection from './components/AnalyticsSection'
import HistorySection from './components/HistorySection'
import Toast from './components/Toast'
import './index.css'

const TABS = [
  { id: 'shorten',   label: 'Shorten',   Icon: Link2 },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'history',   label: 'History',   Icon: Clock },
]

function App() {
  const [activeTab, setActiveTab] = useState('shorten')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  return (
    <div className="app">
      <div className="container">
        {/* ── Header ── */}
        <header className="header">
          <div className="logo">
            <img src="/logo.png" alt="Shrnk logo" className="logo-img" />
            <span className="logo-text">Shrnk</span>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="hero">
          <h1>Paste long URL.<br />Get a short one.</h1>
          <p>Free URL shortener with click analytics. No account needed — links are instant and permanent.</p>
        </section>

        {/* ── Tabs ── */}
        <div className="tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`tab-${id}`}
              className={`tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === 'shorten'   && <ShortenSection   showToast={showToast} />}
        {activeTab === 'analytics' && <AnalyticsSection showToast={showToast} />}
        {activeTab === 'history'   && <HistorySection   showToast={showToast} />}

        {/* ── Footer ── */}
        <footer className="footer">
          Shrnk — simple URL shortener
        </footer>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>{toast.message}</div>
        </div>
      )}
    </div>
  )
}

export default App
