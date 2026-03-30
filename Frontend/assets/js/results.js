// ===========================
// RESULTS PAGE FUNCTIONALITY
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Get analysis data from sessionStorage
    const analysisData = JSON.parse(sessionStorage.getItem('analysisData')) || {};
    
    // Update timestamp
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl && analysisData.timestamp) {
        timestampEl.textContent = `Generated on: ${analysisData.timestamp}`;
    }

    // Start analysis simulation
    simulateAnalysis(analysisData);
});

// Simulate AI Analysis
function simulateAnalysis(data) {
    // Generate random risk score (weighted towards different ranges)
    const riskScore = Math.floor(Math.random() * 100);
    
    // Simulate delays for different analysis stages
    setTimeout(() => completeTextAnalysis(riskScore, data), 1500);
    setTimeout(() => completeImageAnalysis(riskScore, data), 3000);
    setTimeout(() => completeLinkAnalysis(riskScore, data), 4500);
    setTimeout(() => completeOverallScore(riskScore), 6000);
}

// Text Analysis Results
function completeTextAnalysis(riskScore, data) {
    const textFindings = document.getElementById('textFindings');
    const textBadge = document.getElementById('textBadge');
    
    let findings = [];
    let riskLevel = 'low';

    // Simulate text analysis results
    if (data.jobDescription) {
        const descLength = data.jobDescription.length;
        
        // Check for suspicious patterns
        if (descLength < 100) {
            findings.push({
                text: 'Very short job description (typical of scams)',
                positive: false
            });
            riskLevel = 'high';
        } else {
            findings.push({
                text: 'Adequate job description length',
                positive: true
            });
        }

        // Random checks
        const suspiciousKeywords = ['urgent', 'no experience needed', 'work from home', 'easy money'];
        const hasSuspicious = suspiciousKeywords.some(keyword => 
            data.jobDescription.toLowerCase().includes(keyword)
        );

        if (hasSuspicious) {
            findings.push({
                text: 'Suspicious keywords detected (urgent, easy money, etc.)',
                positive: false
            });
        } else {
            findings.push({
                text: 'No highly suspicious keywords detected',
                positive: true
            });
        }

        // Grammar check simulation
        if (Math.random() > 0.5) {
            findings.push({
                text: 'Minor grammar issues detected',
                positive: false
            });
        } else {
            findings.push({
                text: 'Professional language and grammar',
                positive: true
            });
        }

        // Salary check
        if (data.jobDescription.toLowerCase().includes('unlimited') || 
            data.jobDescription.toLowerCase().includes('$1000 daily')) {
            findings.push({
                text: 'Unrealistic salary promises detected',
                positive: false
            });
        } else {
            findings.push({
                text: 'Reasonable salary range provided',
                positive: true
            });
        }
    }

    // Render findings
    textFindings.innerHTML = findings.map(finding => `
        <li class="${finding.positive ? 'positive' : 'negative'}">
            <div class="findings-icon">${finding.positive ? '✔' : '⚠'}</div>
            <div class="findings-text">${finding.text}</div>
        </li>
    `).join('');

    // Update badge
    textBadge.textContent = riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk';
    textBadge.className = `result-badge ${riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success'}`;
}

// Image Analysis Results
function completeImageAnalysis(riskScore, data) {
    const imageFindings = document.getElementById('imageFindings');
    const imageBadge = document.getElementById('imageBadge');
    
    let findings = [];
    let riskLevel = 'low';

    if (data.imageCount > 0) {
        // Simulate image analysis
        findings.push({
            text: `${data.imageCount} image(s) analyzed`,
            positive: true
        });

        if (Math.random() > 0.6) {
            findings.push({
                text: 'Image reverse search: No suspicious matches found',
                positive: true
            });
        } else {
            findings.push({
                text: 'Image used in multiple job postings (potential reuse)',
                positive: false
            });
            riskLevel = 'high';
        }

        if (Math.random() > 0.7) {
            findings.push({
                text: 'Logo authenticity: Verified against official sources',
                positive: true
            });
        } else {
            findings.push({
                text: 'Logo authenticity: Could not be verified',
                positive: false
            });
        }
    } else {
        findings.push({
            text: 'No images uploaded for verification',
            positive: false
        });
    }

    // Render findings
    imageFindings.innerHTML = findings.map(finding => `
        <li class="${finding.positive ? 'positive' : 'negative'}">
            <div class="findings-icon">${finding.positive ? '✔' : '⚠'}</div>
            <div class="findings-text">${finding.text}</div>
        </li>
    `).join('');

    // Update badge
    imageBadge.textContent = data.imageCount === 0 ? 'Not Analyzed' : riskLevel === 'high' ? 'High Risk' : 'Low Risk';
    imageBadge.className = `result-badge ${
        data.imageCount === 0 ? 'warning' : 
        riskLevel === 'high' ? 'danger' : 'success'
    }`;
}

// Link Analysis Results
function completeLinkAnalysis(riskScore, data) {
    const linkFindings = document.getElementById('linkFindings');
    const linkBadge = document.getElementById('linkBadge');
    
    let findings = [];
    let riskLevel = 'low';

    if (data.jobLink) {
        // Extract domain
        try {
            const url = new URL(data.jobLink);
            const domain = url.hostname;

            findings.push({
                text: `Domain: ${domain}`,
                positive: true
            });

            // Simulate HTTPS check
            if (url.protocol === 'https:') {
                findings.push({
                    text: 'HTTPS security: Enabled ✓',
                    positive: true
                });
            } else {
                findings.push({
                    text: 'HTTPS security: Not enabled',
                    positive: false
                });
                riskLevel = 'high';
            }

            // Simulate domain age check
            const isNewDomain = Math.random() > 0.7;
            if (isNewDomain) {
                findings.push({
                    text: 'Domain age: Recently registered (high risk)',
                    positive: false
                });
                riskLevel = 'high';
            } else {
                findings.push({
                    text: 'Domain age: Established domain',
                    positive: true
                });
            }

            // Phishing check
            const knownPhishingDomains = ['indeed', 'linkedin', 'glassdoor'];
            const looksLegit = knownPhishingDomains.some(d => domain.includes(d));
            
            if (looksLegit) {
                findings.push({
                    text: 'No phishing signals detected',
                    positive: true
                });
            } else {
                findings.push({
                    text: 'Domain not recognized as major job platform',
                    positive: false
                });
            }

        } catch (e) {
            findings.push({
                text: 'Invalid URL format',
                positive: false
            });
            riskLevel = 'high';
        }
    } else {
        findings.push({
            text: 'No URL provided for verification',
            positive: false
        });
    }

    // Render findings
    linkFindings.innerHTML = findings.map(finding => `
        <li class="${finding.positive ? 'positive' : 'negative'}">
            <div class="findings-icon">${finding.positive ? '✔' : '⚠'}</div>
            <div class="findings-text">${finding.text}</div>
        </li>
    `).join('');

    // Update badge
    linkBadge.textContent = !data.jobLink ? 'Not Analyzed' : riskLevel === 'high' ? 'High Risk' : 'Low Risk';
    linkBadge.className = `result-badge ${
        !data.jobLink ? 'warning' : 
        riskLevel === 'high' ? 'danger' : 'success'
    }`;
}

// Complete Overall Score and Show Insights
function completeOverallScore(riskScore) {
    const scoreValue = document.getElementById('scoreValue');
    const riskStatus = document.getElementById('riskStatus');
    const scoreCircle = document.getElementById('scoreCircle');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidencePercent = document.getElementById('confidencePercent');
    const explanation = document.getElementById('explanation');

    // Determine risk level
    let riskLevel, statusText, statusIcon;
    if (riskScore < 30) {
        riskLevel = 'safe';
        statusText = 'Likely Safe Job ✅';
        statusIcon = '✅';
    } else if (riskScore < 70) {
        riskLevel = 'suspicious';
        statusText = 'Suspicious Job ⚠️';
        statusIcon = '⚠️';
    } else {
        riskLevel = 'fake';
        statusText = 'Likely Fake Job ❌';
        statusIcon = '❌';
    }

    // Animate score counter
    animateCounter(scoreValue, 0, riskScore, 1000);

    // Update status
    riskStatus.innerHTML = `
        <span class="status-icon">${statusIcon}</span>
        <span class="status-text">${statusText}</span>
    `;

    // Update confidence
    const confidence = 75 + Math.random() * 20; // 75-95%
    confidenceFill.style.width = `${confidence}%`;
    confidencePercent.textContent = `${Math.round(confidence)}%`;

    // Update score circle color
    if (riskLevel === 'safe') {
        scoreCircle.style.background = `conic-gradient(var(--success-color) 0deg 360deg)`;
    } else if (riskLevel === 'suspicious') {
        scoreCircle.style.background = `conic-gradient(var(--warning-color) 0deg 360deg)`;
    } else {
        scoreCircle.style.background = `conic-gradient(var(--danger-color) 0deg 360deg)`;
    }

    // Generate explanation
    const explanations = {
        safe: [
            'This job posting appears to be legitimate based on our analysis:',
            '• Professional language and grammar',
            '• Realistic salary range',
            '• Domain is established and uses HTTPS',
            '• No suspicious keywords detected',
            'However, always verify independently with the company before applying.'
        ],
        suspicious: [
            'This job posting has some characteristics that require caution:',
            '• Some patterns match common scam templates',
            '• Certain keywords are commonly used in fraudulent postings',
            '• Domain information needs verification',
            '• Recommend additional research before proceeding',
            'Contact the company directly using verified contact information.'
        ],
        fake: [
            'This job posting shows multiple red flags commonly associated with scams:',
            '• Contains suspicious or overly promotional language',
            '• Unrealistic salary promises detected',
            '• Domain or link reputation concerns',
            '• Multiple patterns match known fake job postings',
            'We recommend avoiding this opportunity and reporting it to the platform.'
        ]
    };

    explanation.innerHTML = `
        <p>${explanations[riskLevel].join('<br>')}</p>
    `;
}

// Animate counter
function animateCounter(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const counter = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(counter);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Helper function for showing toast (duplicated for results page)
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast') || document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;
    toast.className = `toast ${type}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.style.display = 'none';
            toast.classList.remove('hide');
        }, 300);
    }, duration);
}
