import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import './Evolution.css'

const API_BASE = 'http://localhost:8000'

// ── Palette ──────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']
const RISK_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' }

// ── Helpers ───────────────────────────────────────────────────────────────────
function toChartArray(obj) {
  return Object.entries(obj || {}).map(([name, value]) => ({ name, value }))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="evo-section-header">
      <span className="evo-section-icon">{icon}</span>
      <div>
        <h2 className="evo-section-title">{title}</h2>
        {subtitle && <p className="evo-section-sub">{subtitle}</p>}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="evo-stat-card" style={{ borderTopColor: color }}>
      <span className="evo-stat-value" style={{ color }}>{value}</span>
      <span className="evo-stat-label">{label}</span>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="evo-empty">
      <span className="evo-empty-icon">📭</span>
      <p>{message}</p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Evolution() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/evolution`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server responded with ${r.status}`)
        return r.json()
      })
      .then((json) => { setData(json); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="evo-loading">
        <div className="evo-spinner" />
        <p>Loading evolution data…</p>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="evo-error">
        <span>⚠️</span>
        <p>Could not load evolution data: <strong>{error}</strong></p>
        <p className="evo-error-hint">Make sure the backend is running at <code>{API_BASE}</code></p>
      </div>
    )
  }

  const { fraud_trend, scam_types, risk_levels, common_signals, safety_tips } = data

  const trendData = toChartArray(fraud_trend)
  const scamData  = toChartArray(scam_types)
  const riskData  = toChartArray(risk_levels).filter((d) => d.value > 0)

  const totalAnalyzed = Object.values(risk_levels || {}).reduce((a, b) => a + b, 0)
  const totalFake     = Object.values(fraud_trend || {}).reduce((a, b) => a + b, 0)
  const highRisk      = risk_levels?.High || 0

  return (
    <div className="evo-page">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="evo-hero">
        <div className="evo-hero-inner">
          <span className="evo-hero-badge">Live Analytics</span>
          <h1 className="evo-hero-title">Scam Evolution Dashboard</h1>
          <p className="evo-hero-sub">
            Real-time trends derived from user-submitted job postings analysed by JobShield AI.
          </p>
        </div>
      </div>

      <div className="evo-content">

        {/* ── Summary stats ──────────────────────────────────────────────── */}
        <div className="evo-stats-row">
          <StatCard label="Total Analysed"  value={totalAnalyzed} color="#3b82f6" />
          <StatCard label="Fake Jobs Found" value={totalFake}     color="#ef4444" />
          <StatCard label="High-Risk Posts" value={highRisk}      color="#f59e0b" />
          <StatCard label="Scam Categories" value={scamData.length} color="#8b5cf6" />
        </div>

        {/* ── Fraud Trend ─────────────────────────────────────────────────── */}
        <div className="evo-card">
          <SectionHeader
            icon="📈"
            title="Fraud Trend Over Time"
            subtitle="Number of fake job postings detected per day"
          />
          {trendData.length === 0 ? (
            <EmptyState message="No trend data yet — start analysing job postings to see this chart." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v) => [`${v} fake job(s)`, 'Count']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Scam Types + Risk Levels ────────────────────────────────────── */}
        <div className="evo-two-col">

          {/* Scam Types — Bar chart */}
          <div className="evo-card">
            <SectionHeader
              icon="🕵️"
              title="Scam Type Breakdown"
              subtitle="Keyword-based classification of detected scam patterns"
            />
            {scamData.length === 0 ? (
              <EmptyState message="No scam type data available yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={scamData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v) => [`${v} occurrence(s)`, 'Count']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {scamData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Risk Levels — Pie chart */}
          <div className="evo-card">
            <SectionHeader
              icon="🎯"
              title="Risk Level Distribution"
              subtitle="Posts grouped by model-predicted risk category"
            />
            {riskData.length === 0 ? (
              <EmptyState message="No risk data available yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {riskData.map((entry) => (
                      <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v, name) => [`${v} post(s)`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Common Scam Signals ─────────────────────────────────────────── */}
        <div className="evo-card">
          <SectionHeader
            icon="🔍"
            title="Common Scam Signals"
            subtitle="Most frequently detected keywords across all submitted postings"
          />
          {common_signals.length === 0 ? (
            <EmptyState message="No signal data available yet." />
          ) : (
            <div className="evo-signals">
              {common_signals.map((signal, i) => (
                <span key={i} className="evo-signal-tag">
                  <span className="evo-signal-rank">#{i + 1}</span>
                  {signal}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Safety Tips ─────────────────────────────────────────────────── */}
        <div className="evo-card evo-tips-card">
          <SectionHeader
            icon="🛡️"
            title="Safety Tips"
            subtitle="How to protect yourself from fake job postings"
          />
          <div className="evo-tips-grid">
            {(safety_tips || []).map((tip, i) => (
              <div key={i} className="evo-tip">
                <span className="evo-tip-num">{i + 1}</span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
