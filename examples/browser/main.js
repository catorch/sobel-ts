import pugImageUrl from 'url:./public/pug.png';
import { Sobel } from '../../src/sobel';

document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const originalCanvas = document.getElementById('originalCanvas');
    const sobelCanvas = document.getElementById('sobelCanvas');
    const processButton = document.getElementById('processButton');
    const outputFormat = document.getElementById('outputFormat');
    const scaleSlider = document.getElementById('scale');
    const scaleValue = document.getElementById('scaleValue');
    const fileName = document.getElementById('fileName');
    const dropZone = document.getElementById('dropZone');
    const originalPlaceholder = document.getElementById('originalPlaceholder');
    const edgePlaceholder = document.getElementById('edgePlaceholder');
    const processingIndicator = document.getElementById('processingIndicator');
    const downloadOriginal = document.getElementById('downloadOriginal');
    const downloadEdges = document.getElementById('downloadEdges');
    const kernelSizeSelect = document.getElementById('kernelSize');
    
    let currentImage = null;
    
    // Update scale value display
    scaleSlider.addEventListener('input', () => {
        scaleValue.textContent = scaleSlider.value;
    });
    
    // File input handling
    imageUpload.addEventListener('change', handleFileSelect);
    
    // Drag and drop handling
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            imageUpload.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });
    
    processButton.addEventListener('click', processImage);
    
    downloadOriginal.addEventListener('click', () => {
        downloadCanvas(originalCanvas, 'original-image.png');
    });
    
    downloadEdges.addEventListener('click', () => {
        downloadCanvas(sobelCanvas, 'edge-detection.png');
    });
    
    function handleFileSelect() {
        const file = imageUpload.files[0];
        
        if (file && file.type.match('image.*')) {
            fileName.textContent = file.name;
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Display original image
                    originalCanvas.width = img.width;
                    originalCanvas.height = img.height;
                    const ctxOriginal = originalCanvas.getContext('2d');
                    ctxOriginal.drawImage(img, 0, 0);
                    
                    // Show canvas, hide placeholder
                    originalCanvas.classList.remove('hidden');
                    originalPlaceholder.classList.add('hidden');
                    
                    // Enable process button
                    processButton.disabled = false;
                    downloadOriginal.disabled = false;
                    
                    // Store current image
                    currentImage = img;
                };
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    function processImage() {
        if (!currentImage) return;
        
        // Hide edge canvas and show loading indicator
        sobelCanvas.classList.add('hidden');
        edgePlaceholder.classList.add('hidden');
        processingIndicator.classList.remove('hidden');
        downloadEdges.disabled = true;
        
        // Get options, including kernel size
        const options = {
            outputFormat: outputFormat.value,
            kernelSize: parseInt(kernelSizeSelect.value, 10),
            scale: parseFloat(scaleSlider.value)
        };
        
        // Process the image using our Sobel library
        applySobelFilter(currentImage, sobelCanvas, options);
        
        // Hide loading indicator, show result
        processingIndicator.classList.add('hidden');
        sobelCanvas.classList.remove('hidden');
        downloadEdges.disabled = false;
    }
    
    function applySobelFilter(image, canvas, options) {
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        
        // Draw original image
        ctx.drawImage(image, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Apply Sobel edge detection with selected output format
        const sobel = new Sobel(imageData, options.kernelSize);
        const edgeImageData = sobel.apply(options.outputFormat);
        
        // Apply scale factor
        const data = edgeImageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * options.scale);
            data[i + 1] = Math.min(255, data[i + 1] * options.scale);
            data[i + 2] = Math.min(255, data[i + 2] * options.scale);
        }
        
        // Put processed data back
        ctx.putImageData(edgeImageData, 0, 0);
    }
    
    function downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Load the default pug image
    const defaultImg = new Image();
    defaultImg.onload = () => {
        originalCanvas.width = defaultImg.width;
        originalCanvas.height = defaultImg.height;
        const ctxOriginal = originalCanvas.getContext('2d');
        ctxOriginal.drawImage(defaultImg, 0, 0);
        
        originalCanvas.classList.remove('hidden');
        originalPlaceholder.classList.add('hidden');
        processButton.disabled = false;
        downloadOriginal.disabled = false;
        
        currentImage = defaultImg;
    };
    defaultImg.src = pugImageUrl;
}); 