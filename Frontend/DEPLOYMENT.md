# JobShield AI - Deployment & Customization Guide

## 📋 Table of Contents
1. [Deployment Options](#deployment-options)
2. [Customization Guide](#customization-guide)
3. [Configuration](#configuration)
4. [Backend Integration](#backend-integration)
5. [Performance Optimization](#performance-optimization)
6. [Troubleshooting](#troubleshooting)

---

## Deployment Options

### 1. Local Development

#### Using Python (Built-in)
```bash
# Python 3
cd path/to/Fake_Job
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Visit: `http://localhost:8000/START-HERE.html`

#### Using Node.js
```bash
# Install http-server
npm install -g http-server

# Run server
cd path/to/Fake_Job
http-server -p 8000
```
Visit: `http://localhost:8000/START-HERE.html`

#### Using Live Server (VS Code)
1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 2. Cloud Deployment

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd path/to/Fake_Job
netlify deploy --prod --dir .
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd path/to/Fake_Job
vercel --prod
```

#### GitHub Pages
1. Push to GitHub repository
2. Go to Settings → Pages
3. Select branch to deploy (main/master)
4. Site URL: `https://username.github.io/Fake_Job`

#### Traditional Hosting (Shared/Dedicated)
1. FTP/SFTP all files to your hosting server
2. Set `index.html` as default page
3. Ensure HTTPS is enabled
4. Configure DNS if using custom domain

#### Docker Deployment
```dockerfile
# Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t jobshield-ai .
docker run -p 80:80 jobshield-ai
```

---

## Customization Guide

### 1. Branding & Colors

#### Change App Name
**File:** `index.html`, `dashboard.html`, `results.html`
```html
<!-- Find and replace -->
<span class="logo-text">JobShield AI</span>

<!-- Change to -->
<span class="logo-text">Your Brand Name</span>
```

#### Change Color Scheme
**File:** `assets/css/styles.css`
```css
:root {
    /* Change primary color */
    --primary-color: #1e3a8a;        /* Change this to your color */
    --primary-dark: #1e293b;         /* Darker variant */
    --primary-light: #3b82f6;        /* Lighter variant */
    
    /* Change status colors */
    --success-color: #10b981;        /* "Safe" green */
    --warning-color: #f59e0b;        /* "Suspicious" orange */
    --danger-color: #ef4444;         /* "Fake" red */
}
```

#### Change Font
```css
:root {
    --font-family: 'Your Font Here', sans-serif;
}
```

### 2. Content Updates

#### Update Hero Section
**File:** `index.html`
```html
<h1 class="hero-title">Detect Fake Job Scams Using AI</h1>
<p class="hero-subtitle">Analyze job descriptions, company images, and links in seconds</p>
```

#### Add/Remove Features
**File:** `index.html` → `features-grid`
```html
<div class="feature-card">
    <div class="feature-icon">🎯</div>
    <h3>Your Feature Title</h3>
    <p>Your feature description goes here</p>
</div>
```

#### Update Safety Tips
**File:** `results.html` → `tips-grid`
```html
<div class="tip-card">
    <div class="tip-icon">🔐</div>
    <h3>Your Tip Title</h3>
    <p>Your safety tip description</p>
</div>
```

### 3. Adding New Pages

#### Create New Page
1. Create `new-page.html`
2. Copy structure from existing page
3. Add to navbar:
```html
<ul class="nav-links">
    <li><a href="new-page.html">New Page</a></li>
</ul>
```

#### Create New Section
1. Add the HTML structure
2. Create CSS class in `styles.css`
3. Import any JavaScript requirements

### 4. Styling Modifications

#### Adjust Spacing
```css
:root {
    --spacing-md: 1rem;     /* Change base spacing */
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
}
```

#### Modify Border Radius
```css
:root {
    --radius-lg: 0.75rem;   /* More/less rounded cards */
    --radius-xl: 1rem;
}
```

#### Change Shadows
```css
:root {
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    /* Increase opacity for more depth */
}
```

---

## Configuration

### Environment Variables (For Backend Integration)

Create `config.js`:
```javascript
const CONFIG = {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    API_KEY: process.env.API_KEY,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB
    MAX_DESCRIPTION_LENGTH: 5000,
    TIMEOUT: 30000,
    ENVIRONMENT: process.env.NODE_ENV || 'development'
};
```

### Feature Flags

Add to `main.js`:
```javascript
const FEATURES = {
    ENABLE_IMAGE_ANALYSIS: true,
    ENABLE_LINK_ANALYSIS: true,
    ENABLE_TEXT_ANALYSIS: true,
    ENABLE_SAFETY_TIPS: true,
    USE_REAL_API: false,  // false = simulated, true = real API
    DEBUG_MODE: true
};
```

---

## Backend Integration

### Current State (Demo)
- Uses sessionStorage for data passing
- Simulated AI analysis
- No server communication

### Integration Steps

#### 1. Create Backend Endpoint
```javascript
// Example: main.js form submission
async function submitAnalysis(data) {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        sessionStorage.setItem('analysisResult', JSON.stringify(result));
        window.location.href = 'results.html';
    } catch (error) {
        showToast('Analysis failed: ' + error.message, 'error');
    }
}
```

#### 2. Handle File Upload
```javascript
async function uploadImages(files) {
    const formData = new FormData();
    for (let file of files) {
        formData.append('images', file);
    }
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    
    return response.json();
}
```

#### 3. Display Real Results
```javascript
// In results.js
function displayRealResults(analysisData) {
    // Replace simulation code with:
    updateScore(analysisData.riskScore);
    displayTextFindings(analysisData.textAnalysis);
    displayImageFindings(analysisData.imageAnalysis);
    displayLinkFindings(analysisData.linkAnalysis);
    displayInsights(analysisData.explanation);
}
```

#### 4. API Response Format
```json
{
    "riskScore": 75,
    "riskLevel": "fake",
    "confidence": 87,
    "textAnalysis": {
        "findings": [
            {"text": "Suspicious keywords detected", "positive": false},
            {"text": "Professional grammar", "positive": true}
        ]
    },
    "imageAnalysis": {
        "findings": [
            {"text": "Image matches known scam", "positive": false}
        ]
    },
    "linkAnalysis": {
        "findings": [
            {"text": "Domain recently registered", "positive": false}
        ]
    },
    "explanation": "Multiple red flags indicate this is likely a fake job posting."
}
```

---

## Performance Optimization

### 1. Image Optimization
```bash
# Compress images before deployment
# Using ImageMagick:
convert image.jpg -quality 85 image-optimized.jpg
```

### 2. CSS Optimization
```bash
# Minify CSS (using cssnano or similar)
npm install -g cssnano-cli
cssnano assets/css/styles.css -o assets/css/styles.min.css
```

### 3. JavaScript Optimization
```bash
# Minify JS (using terser)
npm install -g terser
terser assets/js/main.js -o assets/js/main.min.js
```

### 4. Lazy Loading
```html
<!-- Add to image elements -->
<img src="image.jpg" loading="lazy" alt="Description">
```

### 5. Caching Strategy
```javascript
// service-worker.js
const CACHE_NAME = 'jobshield-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/main.js'
];
```

---

## Security Considerations

### 1. Input Validation
```javascript
// Always validate user input
function validateJobDescription(text) {
    if (!text || text.trim().length === 0) return false;
    if (text.length > 5000) return false;
    return true;
}
```

### 2. XSS Prevention
```javascript
// Use textContent instead of innerHTML
element.textContent = userContent;  // ✓ Safe
element.innerHTML = userContent;     // ✗ Vulnerable
```

### 3. HTTPS
- Always use HTTPS in production
- Set Strict-Transport-Security header

### 4. CORS
```javascript
// If backend is on different domain
fetch('/api/analyze', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
    // CORS handled by server
});
```

### 5. Data Privacy
- Don't store sensitive data in localStorage
- Use sessionStorage for temporary data
- Implement proper authentication

---

## Troubleshooting

### Issue: Styles not loading
**Solution:**
```bash
# Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
# Check file paths in HTML
# Verify CSS file exists at assets/css/styles.css
```

### Issue: JavaScript errors in console
**Solution:**
```javascript
// Check browser console (F12)
// Verify all JS files are loaded
// Ensure paths are correct
// Check for syntax errors
```

### Issue: Images not uploading
**Solution:**
```javascript
// Check file size (must be < 5MB)
// Check file type (must be image/)
// Test browser file API support
// Check event listeners are attached
```

### Issue: Form data not persisting
**Solution:**
```javascript
// Verify sessionStorage is available
// Check browser privacy settings
// Use console to debug: console.log(sessionStorage)
```

### Issue: Mobile responsive issues
**Solution:**
```html
<!-- Ensure viewport meta tag is present -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Test media queries at 768px breakpoint -->
@media (max-width: 768px) { }
```

---

## Performance Metrics to Monitor

- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Total Blocking Time (TBT):** < 200ms

---

## Future Enhancement Ideas

1. **Machine Learning Integration**
   - Real NLP for text analysis
   - ML model for pattern detection
   - Continuous model training

2. **User Features**
   - User accounts with history
   - Saved analyses
   - Email notifications
   - Export reports

3. **Database**
   - Store job analyses
   - Track scam patterns
   - User feedback integration

4. **API**
   - REST API for third-party integration
   - Browser extension
   - Mobile app SDK

5. **Analytics**
   - Track most common scam patterns
   - Generate reports
   - Heatmaps of scam industries

6. **Community**
   - User reviews
   - Scam reporting
   - Company verification badges

---

## Support & Resources

- **GitHub Issues:** For bug reports
- **Documentation:** See README.md
- **Browser Compatibility:** Can use https://caniuse.com
- **CSS Reference:** https://developer.mozilla.org/en-US/docs/Web/CSS
- **JavaScript Guide:** https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## Version History

- **v1.0** (2026) - Initial release
  - Landing page with hero and features
  - Job analysis dashboard
  - Simulated AI analysis
  - Results page with visualizations
  - Responsive mobile design
  - Safety tips and guidelines

---

**Last Updated:** 2026
**Status:** Production Ready
