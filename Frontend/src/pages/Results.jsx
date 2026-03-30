import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Results.css'

const API_BASE = 'http://localhost:8000'

function mapAnalysisResult(result, requestData = {}) {
  const label = result.label || result.prediction || 'Unknown'
  const probability = result.probability ?? result.fraud_probability ?? 0
  const riskScore = Math.round(probability * 100)
  const trustScore = Math.max(0, 100 - riskScore)
  const source = result.input_source || 'text'

  const textIssues = [
    `Prediction: ${label}`,
    `Confidence: ${result.confidence}`,
    `Processed ${result.extracted_text_length} characters from ${source} input.`
  ]

  if (result.risk_level === 'High') {
    textIssues.push('Multiple scam indicators were detected in the posting content.')
  } else if (result.risk_level === 'Medium') {
    textIssues.push('Some caution signals were detected and should be reviewed manually.')
  }

  return {
    riskScore,
    riskLevel: result.risk_level,
    textAnalysis: {
      score: trustScore,
      issues: textIssues
    },
    imageAnalysis: {
      score: source === 'image' ? trustScore : (requestData.imageCount > 0 ? 50 : 0),
      images: requestData.imageCount || 0,
      status: source === 'image'
        ? 'OCR completed'
        : ((requestData.imageCount || 0) > 0 ? 'Provided but not primary source' : 'No images')
    },
    linkAnalysis: {
      score: source === 'url' ? trustScore : (requestData.jobLink ? 50 : 0),
      url: requestData.jobLink || 'Not provided',
      status: source === 'url'
        ? 'Scraped and analyzed'
        : (requestData.jobLink ? 'Provided but not primary source' : 'Not analyzed')
    },
    recommendations: [
      result.recommendation,
      'Research the company on official channels before responding.',
      'Do not share banking details, ID scans, or passwords during early screening.',
      'Verify recruiter email domains and cross-check the job on the employer website.'
    ]
  }
}

function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const runImageAnalysis = useCallback(async (primaryImage, requestData) => {
    try {
      console.log('[Results] Sending image to /analyze/image')
      const fd = new FormData()
      fd.append('image', primaryImage)

      // FIX: use the correct /analyze/image endpoint for multipart uploads
      const response = await fetch(`${API_BASE}/analyze/image`, {
        method: 'POST',
        body: fd
      })

      const data = await response.json()
      console.log('[Results] Image API Response:', data)

      if (!response.ok) {
        throw new Error(data.detail || 'Image analysis failed')
      }

      const mapped = mapAnalysisResult(data, requestData)
      sessionStorage.setItem('analysisResult', JSON.stringify(data))
      setAnalysisResults(mapped)
    } catch (error) {
      console.error('[Results] Error:', error)
      setErrorMessage(error.message || 'Unable to complete analysis.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check for cached result from Dashboard (text/url submissions)
    const cachedResult = sessionStorage.getItem('analysisResult')
    const sessionAnalysisData = sessionStorage.getItem('analysisData')
    const requestData = sessionAnalysisData ? JSON.parse(sessionAnalysisData) : {}

    if (cachedResult) {
      console.log('[Results] Using cached result from Dashboard')
      const rawResult = JSON.parse(cachedResult)
      setAnalysisResults(mapAnalysisResult(rawResult, requestData))
      setIsLoading(false)
      return
    }

    // Fallback: image submitted from Dashboard but not yet analyzed
    const stateInput = location.state?.analysisInput
    const primaryImage = stateInput?.primaryImage

    if (!primaryImage) {
      // Nothing to work with — go back
      if (!stateInput && !sessionAnalysisData) {
        navigate('/dashboard')
        return
      }
      setErrorMessage('No analysis result found. Please try again.')
      setIsLoading(false)
      return
    }

    runImageAnalysis(primaryImage, requestData)
  }, [location.state, navigate, runImageAnalysis])

  if (isLoading) {
    return (
      <main className="results-container">
        <div className="loading-section">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h2>Analyzing Job Posting</h2>
          <p>Our AI is scanning the job description, images, and links...</p>
        </div>
      </main>
    )
  }

  if (!analysisResults) {
    return (
      <main className="results-container">
        <div className="container">
          <div className="error-section">
            <h2>Something went wrong</h2>
            <p>{errorMessage || 'Please try again with a new job posting'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Analyze Another Job
            </button>
          </div>
        </div>
      </main>
    )
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return '#10b981'
      case 'Medium': return '#f59e0b'
      case 'High': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <main className="results-container">
      <div className="results-header">
        <div className="container">
          <h1>Analysis Complete</h1>
          <p>Here's what we found about this job posting</p>
        </div>
      </div>

      <div className="container results-content">
        {/* Risk Score Card */}
        <div className="risk-score-card">
          <div className="risk-circle">
            <div
              className="risk-meter"
              style={{
                background: `conic-gradient(${getRiskColor(analysisResults.riskLevel)} 0deg ${analysisResults.riskScore * 3.6}deg, #e5e7eb ${analysisResults.riskScore * 3.6}deg)`
              }}
            >
              <div className="risk-center">
                <div className="risk-score">{analysisResults.riskScore}</div>
                <div className="risk-label">Risk Score</div>
              </div>
            </div>
          </div>
          <div className="risk-info">
            <h2>Overall Risk Level</h2>
            <div className="risk-badge" style={{ background: getRiskColor(analysisResults.riskLevel) }}>
              {analysisResults.riskLevel}
            </div>
            <p>
              {analysisResults.riskLevel === 'Low' &&
                'This job posting appears to be legitimate based on our analysis.'}
              {analysisResults.riskLevel === 'Medium' &&
                'Some indicators suggest caution. Verify details with the company.'}
              {analysisResults.riskLevel === 'High' &&
                'Multiple red flags detected. Proceed with extreme caution.'}
            </p>
          </div>
        </div>

        {/* Analysis Grid */}
        <div className="analysis-grid">
          <div className="analysis-card">
            <div className="card-header">
              <h3>📝 Text Analysis</h3>
              <div className="score-badge" style={{ background: getScoreColor(analysisResults.textAnalysis.score) }}>
                {analysisResults.textAnalysis.score}%
              </div>
            </div>
            <div className="card-content">
              {analysisResults.textAnalysis.issues.length > 0 ? (
                <>
                  <p className="card-title">Findings:</p>
                  <ul className="issues-list">
                    {analysisResults.textAnalysis.issues.map((issue, i) => (
                      <li key={i}>
                        <span className="issue-icon">ℹ️</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="success-text">✓ No major text issues detected</p>
              )}
            </div>
          </div>

          <div className="analysis-card">
            <div className="card-header">
              <h3>🖼️ Image Analysis</h3>
              <div className="score-badge" style={{ background: getScoreColor(analysisResults.imageAnalysis.score) }}>
                {analysisResults.imageAnalysis.score}%
              </div>
            </div>
            <div className="card-content">
              <div className="stat-row">
                <span>Images Analyzed:</span>
                <strong>{analysisResults.imageAnalysis.images}</strong>
              </div>
              <div className="stat-row">
                <span>Status:</span>
                <strong>{analysisResults.imageAnalysis.status}</strong>
              </div>
            </div>
          </div>

          <div className="analysis-card">
            <div className="card-header">
              <h3>🔗 Link Analysis</h3>
              <div className="score-badge" style={{ background: getScoreColor(analysisResults.linkAnalysis.score) }}>
                {analysisResults.linkAnalysis.score}%
              </div>
            </div>
            <div className="card-content">
              <div className="stat-row">
                <span>URL:</span>
                <strong className="url-text" title={analysisResults.linkAnalysis.url}>
                  {analysisResults.linkAnalysis.url}
                </strong>
              </div>
              <div className="stat-row">
                <span>Safety Status:</span>
                <strong style={{ color: getScoreColor(analysisResults.linkAnalysis.score) }}>
                  {analysisResults.linkAnalysis.status}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-section">
          <h2>Recommended Steps</h2>
          <div className="recommendations-list">
            {analysisResults.recommendations.map((rec, i) => (
              <div key={i} className="recommendation-item">
                <div className="rec-number">{i + 1}</div>
                <div className="rec-content"><p>{rec}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => {
              sessionStorage.removeItem('analysisResult')
              sessionStorage.removeItem('analysisData')
              navigate('/dashboard')
            }}
          >
            Analyze Another Job
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </div>
    </main>
  )
}

function getScoreColor(score) {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export default Results
