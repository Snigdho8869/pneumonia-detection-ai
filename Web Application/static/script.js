document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const predictBtn = document.getElementById('predictBtn');
    const uploadForm = document.getElementById('uploadForm');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const initialMessage = document.getElementById('initialMessage');
    const results = document.getElementById('results');
    const predictionResult = document.getElementById('predictionResult');
    const resultImage = document.getElementById('resultImage');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('active');
    }
    
    function unhighlight() {
        dropArea.classList.remove('active');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            imageInput.files = files;
            handleFiles(files);
        }
    }
    
    dropArea.addEventListener('click', () => {
        imageInput.click();
    });
    
    imageInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFiles(this.files);
            predictBtn.disabled = false;
            predictBtn.textContent = 'Analyze Image';
        }
    });
    
    function handleFiles(files) {
        const file = files[0];
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                predictBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select an image file (JPG, PNG)');
        }
    }
    
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!imageInput.files.length) return;
        
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        
        predictBtn.disabled = true;
        predictBtn.textContent = 'Analyzing...';
        progressBar.classList.remove('hidden');
        progress.style.width = '0%';
        
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            showResults(data);
        })
        .catch(error => {
            alert('Error: ' + error.message);
            console.error('Error:', error);
        })
        .finally(() => {
            progressBar.classList.add('hidden');
        });
    });
    
    function showResults(data) {
        initialMessage.classList.add('hidden');
        results.classList.remove('hidden');
        
        predictionResult.textContent = data.prediction;
        predictionResult.className = 'prediction ' + 
            (data.prediction === 'NORMAL' ? 'normal' : 'pneumonia');
        
        resultImage.src = data.image_url;
        resultImage.style.display = 'block';
    }
});