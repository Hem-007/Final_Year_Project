import { useNavigate } from 'react-router-dom'
import './Landing.css'

function Landing() {
  const navigate = useNavigate()

  const scrollToDemo = () => {
    const element = document.getElementById('how-it-works')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Detect Fake Job Scams Using AI</h1>
            <p className="hero-subtitle">Analyze job descriptions, company images, and links in seconds</p>
            
            <div className="hero-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Analyze Job Now
              </button>
              <button className="btn btn-secondary" onClick={scrollToDemo}>
                View Demo
              </button>
            </div>
          </div>

          <div className="hero-illustration">
            <div className="ai-scanner">
              <div className="scanner-ring"></div>
              <div className="scanner-content">
                <div className="scan-item">📄</div>
                <div className="scan-item">🖼️</div>
                <div className="scan-item">🔗</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why JobShield AI?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Multi-Source Analysis</h3>
              <p>Analyze job text, images, and links in one place for comprehensive verification</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Results</h3>
              <p>Get AI-powered analysis in seconds, not days</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>High Accuracy</h3>
              <p>Advanced machine learning models trained on thousands of job postings</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Your Data is Safe</h3>
              <p>Enterprise-grade encryption and privacy protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Info</h3>
              <p>Paste job description, upload images, and provide the job link</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI scans text patterns, image authenticity, and link reputation</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Results</h3>
              <p>Receive detailed report with risk score and recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <h2>Trusted by Job Seekers</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">100K+</div>
              <div className="stat-label">Jobs Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">99.2%</div>
              <div className="stat-label">Detection Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Users Protected</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Check Your Next Job Opportunity?</h2>
          <p>Stay safe from job scams. Analyze any posting in seconds.</p>
          <button 
            className="btn btn-primary-large"
            onClick={() => navigate('/dashboard')}
          >
            Analyze Your Job Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>JobShield AI</h4>
              <p>Protecting job seekers from fraudulent postings using AI</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/dashboard">Analyze Job</a></li>
                <li><a href="/#how-it-works">How It Works</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 JobShield AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Landing
