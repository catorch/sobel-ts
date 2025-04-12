import { ImageDataLike, getImageDataFactory } from './types';

/**
 * Converts ImageData to grayscale, applies Sobel kernels, returns new ImageData
 * 
 * This class performs edge detection using the Sobel operator.
 * It processes a given ImageData object to extract horizontal and vertical gradients,
 * then outputs a new ImageData with edge intensities encoded as grayscale values.
 * 
 * Based on: https://github.com/miguelmota/sobel
 * Original Author: Miguel Mota (MIT License)
 * Rewritten in TypeScript with improvements by @catorch
 * 
 */
export class Sobel {
    // Dimensions of the input image
    private width: number;
    private height: number;
    // Stores the grayscale-converted image data
    private grayscaleData: Uint8ClampedArray;
    // ImageData factory for the current environment
    private static imageDataFactory = getImageDataFactory();
  
    // Sobel kernel for detecting horizontal edges
    private static kernelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
  
    // Sobel kernel for detecting vertical edges
    private static kernelY = [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1],
    ];
  
    /**
     * Constructor stores image dimensions and computes grayscale version of input
     * @param imageData - original image data (browser ImageData or Node.js buffer)
     */
    constructor(private imageData: ImageDataLike) {
      this.width = imageData.width;
      this.height = imageData.height;
      this.grayscaleData = this.convertToGrayscale(imageData);
    }
  
    /**
     * Safely retrieves the value of a specific pixel channel in an image array
     * @param data - image pixel array
     * @param x - horizontal coordinate
     * @param y - vertical coordinate
     * @param channel - 0=R, 1=G, 2=B, 3=A (default 0)
     * @returns pixel channel value (0 if out of bounds)
     */
    private pixelAt(data: Uint8ClampedArray, x: number, y: number, channel: number = 0): number {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
      return data[(y * this.width + x) * 4 + channel];
    }
  
    /**
     * Converts RGBA input to grayscale (preserves alpha as 255)
     * @param imageData - original image data
     * @returns new Uint8ClampedArray of grayscale RGBA pixels
     */
    private convertToGrayscale(imageData: ImageDataLike): Uint8ClampedArray {
      const gray = new Uint8ClampedArray(this.width * this.height * 4);
      const src = imageData.data;
  
      for (let i = 0; i < src.length; i += 4) {
        // Average of R, G, B channels
        const avg = (src[i] + src[i + 1] + src[i + 2]) / 3;
        gray[i] = gray[i + 1] = gray[i + 2] = avg; // Set R, G, B to avg
        gray[i + 3] = 255; // Alpha remains fully opaque
      }
  
      return gray;
    }
  
    /**
     * Applies Sobel filter to grayscale image and returns edge-detected ImageData
     * @returns ImageData with edge intensities in grayscale
     */
    public apply(): ImageDataLike {
      const output = new Uint8ClampedArray(this.width * this.height * 4);
  
      // Iterate over each pixel in the image
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          let gx = 0; // gradient in X direction
          let gy = 0; // gradient in Y direction
  
          // Apply convolution with both Sobel kernels (3x3)
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const px = x + kx;
              const py = y + ky;
  
              const weightX = Sobel.kernelX[ky + 1][kx + 1];
              const weightY = Sobel.kernelY[ky + 1][kx + 1];
  
              const value = this.pixelAt(this.grayscaleData, px, py);
  
              gx += value * weightX;
              gy += value * weightY;
            }
          }
  
          // Compute gradient magnitude (edge strength)
          const magnitude = Math.sqrt(gx * gx + gy * gy);
  
          // Write the result as grayscale pixel in output
          const index = (y * this.width + x) * 4;
          output[index] = output[index + 1] = output[index + 2] = magnitude;
          output[index + 3] = 255; // Alpha remains opaque
        }
      }
  
      // Create new ImageData object using the appropriate factory
      return Sobel.imageDataFactory.create(output, this.width, this.height);
    }
  }
  