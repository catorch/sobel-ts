# sobel-ts

[![npm](https://img.shields.io/npm/v/sobel-ts)](https://www.npmjs.com/package/sobel-ts)
![license](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)

A TypeScript implementation of the Sobel edge detection algorithm for image processing. Works in both browser and Node.js environments.

## 🔍 [Live Demo](https://catorch.github.io/sobel-ts/)

Try the algorithm on your own images using our [interactive demo page](https://catorch.github.io/sobel-ts/).

## ✨ Features

- **Cross-platform**: Works in both browser and Node.js environments
- **Flexible output**: Multiple output formats (magnitude, x-gradient, y-gradient, direction)
- **Variable kernel sizes**: Choose between 3×3 and 5×5 Sobel operators
- **TypeScript-first**: Full type safety with TypeScript declarations
- **Zero dependencies**: Lightweight with no external runtime dependencies

## 📦 Installation

```bash
npm install sobel-ts
```

## 🚀 Quick Start

### Browser

```typescript
import { Sobel } from 'sobel-ts';

// Get an ImageData object from a canvas
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Create a Sobel filter instance (default kernel size is 3×3)
const sobel = new Sobel(imageData);

// Apply the filter and get an ImageData with edge detection
const edgeImageData = sobel.apply('magnitude'); 

// Draw the result on a canvas
ctx.putImageData(edgeImageData, 0, 0);
```

### Node.js

```typescript
import { Sobel } from 'sobel-ts';
import { createCanvas, loadImage } from 'canvas'; // Node canvas library

async function detectEdges(imagePath) {
  // Load the image
  const image = await loadImage(imagePath);
  
  // Create a canvas and draw the image
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  
  // Get the image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Apply Sobel edge detection with 5×5 kernel
  const sobel = new Sobel(imageData, 5);
  const edgeImageData = sobel.apply('magnitude');
  
  // Draw the result back to the canvas
  ctx.putImageData(edgeImageData, 0, 0);
  
  // Save the result
  const fs = require('fs');
  const out = fs.createWriteStream('edges.png');
  const stream = canvas.createPNGStream();
  stream.pipe(out);
}
```

## 📋 API Reference

### `Sobel` Class

The main class for applying the Sobel edge detection algorithm.

#### Constructor

```typescript
constructor(imageData: ImageDataLike, kernelSize: KernelSize = 3)
```

- `imageData`: An ImageData object (browser) or compatible object (Node.js)
- `kernelSize`: Kernel size for the Sobel operator (3 or 5)

#### Methods

##### `apply(format?: OutputFormat): ImageDataLike`

Applies the Sobel filter to the input image.

- `format`: Output format (default: 'magnitude')
  - `'magnitude'`: Overall edge strength (default)
  - `'x'`: Horizontal edges only
  - `'y'`: Vertical edges only
  - `'direction'`: Edge direction as hue values (0-255)

Returns a new ImageData object with the edge detection result.

## 🧪 Advanced Usage

### Adjusting Edge Sensitivity

You can multiply the result values to emphasize edges:

```typescript
const sobel = new Sobel(imageData);
const edges = sobel.apply('magnitude');

// Increase contrast of edges
const data = edges.data;
for (let i = 0; i < data.length; i += 4) {
  // Multiply by a factor (e.g., 1.5) and clamp to 255
  data[i] = Math.min(255, data[i] * 1.5);
  data[i+1] = Math.min(255, data[i+1] * 1.5);
  data[i+2] = Math.min(255, data[i+2] * 1.5);
}
```

### Visualizing Edge Directions

The `'direction'` output format maps edge directions to grayscale values (0-255):

```typescript
const sobel = new Sobel(imageData);
const edgeDirections = sobel.apply('direction');
```

## 🔄 How It Works

The Sobel operator calculates the gradient of image intensity at each pixel, giving the direction of the largest increase and the rate of change in that direction. This is used to detect edges in images.

1. The image is converted to grayscale
2. Two kernels (X and Y) are applied to detect horizontal and vertical gradients
3. The magnitude and/or direction of the gradient is calculated
4. The result is returned as an ImageData object

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

This work builds upon the original JavaScript implementation by Miguel Mota (https://github.com/miguelmota/sobel). 