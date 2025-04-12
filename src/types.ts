/**
 * Defines a type for the supported output formats of the Sobel operator.
 */
export type OutputFormat = 'magnitude' | 'x' | 'y' | 'direction';

/**
 * Defines the supported kernel sizes for the Sobel operator.
 */
export type KernelSize = 3 | 5;

/**
 * Platform-agnostic interface for image data
 * Compatible with both browser's ImageData and Node.js buffers
 */
export interface ImageDataLike {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  colorSpace?: string; // Optional to support older browsers
}

/**
 * Factory interface for creating ImageData objects
 */
export interface ImageDataFactory {
  create(data: Uint8ClampedArray, width: number, height: number): ImageDataLike;
}

/**
 * Browser-specific ImageData factory
 */
export class BrowserImageDataFactory implements ImageDataFactory {
  create(data: Uint8ClampedArray, width: number, height: number): ImageDataLike {
    // In browser environment, use the native ImageData constructor
    if (typeof ImageData !== 'undefined') {
      return new ImageData(data, width, height);
    }
    throw new Error('ImageData is not supported in this environment');
  }
}

/**
 * Node.js-specific ImageData factory
 */
export class NodeImageDataFactory implements ImageDataFactory {
  create(data: Uint8ClampedArray, width: number, height: number): ImageDataLike {
    // In Node.js, return a simple object that matches the interface
    return {
      data,
      width,
      height,
      colorSpace: 'srgb'
    };
  }
}

/**
 * Get the appropriate ImageData factory for the current environment
 */
export function getImageDataFactory(): ImageDataFactory {
  if (typeof ImageData !== 'undefined') {
    return new BrowserImageDataFactory();
  }
  return new NodeImageDataFactory();
} 