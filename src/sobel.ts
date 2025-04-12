import { getImageDataFactory, ImageDataLike, KernelSize, OutputFormat } from './types';

/**
 * Converts ImageData to grayscale, applies Sobel kernels, returns new ImageData
 * 
 * This class performs edge detection using the Sobel operator.
 * It processes a given ImageData object to extract horizontal and vertical gradients,
 * then outputs a new ImageData with edge intensities encoded as grayscale values.
 * 
 * This is a TypeScript implementation with enhancements including:
 * - Variable kernel sizes (3x3, 5x5)
 * - Multiple output formats (magnitude, x, y, direction)
 * 
 * Current Maintainer/Developer: @catorch
 * 
 * This work builds upon the original JavaScript version by Miguel Mota
 * (https://github.com/miguelmota/sobel, MIT License).
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
    private kernelSize: KernelSize;
  
    // Sobel kernel for detecting horizontal edges
    private static kernelX3 = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
  
    // Sobel kernel for detecting vertical edges
    private static kernelY3 = [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1],
    ];
  
    // Add standard 5x5 Sobel kernels
    private static kernelX5 = [
        [-1, -2, 0, 2, 1],
        [-4, -8, 0, 8, 4],
        [-6,-12, 0,12, 6],
        [-4, -8, 0, 8, 4],
        [-1, -2, 0, 2, 1]
    ];
    private static kernelY5 = [
        [-1, -4, -6, -4, -1],
        [-2, -8,-12, -8, -2],
        [ 0,  0,  0,  0,  0],
        [ 2,  8, 12,  8,  2],
        [ 1,  4,  6,  4,  1]
    ];
  
    /**
     * Constructor stores image dimensions, kernel size, and computes grayscale version
     * @param imageData - original image data (browser ImageData or Node.js buffer)
     * @param kernelSize - size of the Sobel kernel (3 or 5, defaults to 3)
     */
    constructor(private imageData: ImageDataLike, kernelSize: KernelSize = 3) {
      this.width = imageData.width;
      this.height = imageData.height;
      this.kernelSize = kernelSize;
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
     * Applies Sobel filter using the specified kernel size and output format
     * @param format - Output format ('magnitude', 'x', 'y', or 'direction')
     * @returns ImageData with edge intensities
     */
    public apply(format: OutputFormat = 'magnitude'): ImageDataLike {
      const output = new Uint8ClampedArray(this.width * this.height * 4);
      const kernelRadius = Math.floor(this.kernelSize / 2);
  
      // Select appropriate kernels based on size
      const kernelX = this.kernelSize === 3 ? Sobel.kernelX3 : Sobel.kernelX5;
      const kernelY = this.kernelSize === 3 ? Sobel.kernelY3 : Sobel.kernelY5;
  
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          let gx = 0;
          let gy = 0;
  
          // Adjust loop based on kernelRadius
          for (let ky = -kernelRadius; ky <= kernelRadius; ky++) {
            for (let kx = -kernelRadius; kx <= kernelRadius; kx++) {
              const px = x + kx;
              const py = y + ky;
  
              // Adjust kernel index based on radius
              const weightX = kernelX[ky + kernelRadius][kx + kernelRadius];
              const weightY = kernelY[ky + kernelRadius][kx + kernelRadius];
  
              const value = this.pixelAt(this.grayscaleData, px, py);
  
              gx += value * weightX;
              gy += value * weightY;
            }
          }
  
          // Compute the output value based on the selected format
          let value: number;
          switch (format) {
              case 'x':
                  value = Math.abs(gx);
                  break;
              case 'y':
                  value = Math.abs(gy);
                  break;
              case 'direction':
                  const angle = Math.atan2(gy, gx); // Angle in radians [-PI, PI]
                  value = ((angle + Math.PI) / (2 * Math.PI)) * 255; // Map to [0, 255]
                  break;
              case 'magnitude':
              default:
                  value = Math.sqrt(gx * gx + gy * gy);
                  break;
          }
  
          // Write the result as grayscale pixel in output
          const index = (y * this.width + x) * 4;
          output[index] = output[index + 1] = output[index + 2] = value;
          output[index + 3] = 255; // Alpha remains opaque
        }
      }
  
      // Create new ImageData object using the appropriate factory
      return Sobel.imageDataFactory.create(output, this.width, this.height);
    }
  }
  