// ===========================
// UTILITY FUNCTIONS
// ===========================

// Show toast notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.style.display = 'none';
            toast.classList.remove('hide');
        }, 300);
    }, duration);
}

// Validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Scroll to element
function scrollToDemo() {
    const element = document.getElementById('how-it-works') || document.querySelector('.features');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===========================
// DASHBOARD PAGE FUNCTIONALITY
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Character counter
    const jobDescription = document.getElementById('jobDescription');
    if (jobDescription) {
        jobDescription.addEventListener('input', function() {
            const charCount = this.value.length;
            const counter = document.getElementById('charCount');
            if (counter) {
                counter.textContent = charCount;
            }
            if (charCount > 5000) {
                this.value = this.value.substring(0, 5000);
            }
        });
    }

    // URL validation
    const jobLink = document.getElementById('jobLink');
    if (jobLink) {
        jobLink.addEventListener('input', function() {
            const validationIcon = document.getElementById('linkValidation');
            if (validationIcon) {
                if (this.value && isValidUrl(this.value)) {
                    validationIcon.textContent = '✓';
                    validationIcon.className = 'validation-icon valid';
                } else if (this.value) {
                    validationIcon.textContent = '✗';
                    validationIcon.className = 'validation-icon invalid';
                } else {
                    validationIcon.className = 'validation-icon';
                }
            }
        });
    }

    // Drop zone functionality
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');

    if (dropZone && imageInput) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop zone when dragging over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.classList.add('dragover');
        }

        function unhighlight(e) {
            dropZone.classList.remove('dragover');
        }

        // Handle dropped files
        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            imageInput.files = files;
            handleFiles(files);
        }

        // Handle file input change
        imageInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            imagePreview.innerHTML = '';
            let validCount = 0;

            for (let file of files) {
                if (file.type.startsWith('image/')) {
                    if (file.size <= 5 * 1024 * 1024) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const previewItem = document.createElement('div');
                            previewItem.className = 'preview-item';
                            previewItem.innerHTML = `
                                <img src="${e.target.result}" alt="Preview">
                                <button type="button" class="preview-remove">✕</button>
                            `;

                            const removeBtn = previewItem.querySelector('.preview-remove');
                            removeBtn.addEventListener('click', function() {
                                previewItem.remove();
                            });

                            imagePreview.appendChild(previewItem);
                        };
                        reader.readAsDataURL(file);
                        validCount++;
                    } else {
                        showToast('File size exceeds 5MB', 'warning');
                    }
                }
            }

            if (validCount > 0) {
                showToast(`${validCount} image(s) uploaded successfully`, 'success');
            }
        }
    }

    // Form submission
    const analyzeForm = document.getElementById('analyzeForm');
    if (analyzeForm) {
        analyzeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const jobDesc = document.getElementById('jobDescription').value.trim();
            const jobUrl = document.getElementById('jobLink').value.trim();
            const images = document.getElementById('imageInput').files.length;

            // Validate required fields
            if (!jobDesc && !jobUrl && images === 0) {
                showToast('Please provide at least job description or URL', 'warning');
                return;
            }

            if (jobUrl && !isValidUrl(jobUrl)) {
                showToast('Please enter a valid URL', 'error');
                return;
            }

            // Store data in sessionStorage for results page
            sessionStorage.setItem('analysisData', JSON.stringify({
                jobDescription: jobDesc,
                jobLink: jobUrl,
                imageCount: images,
                timestamp: new Date().toLocaleString()
            }));

            // Redirect to results page
            window.location.href = 'results.html';
        });
    }
});
