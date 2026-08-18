import { NatiUiCropGeometry, NatiUiImagePickerOutputType, NatiUiImagePickerShape } from './image-picker.interfaces';

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image.'));
    image.src = src;
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function coverScale(naturalWidth: number, naturalHeight: number, viewportSize: number): number {
  return Math.max(viewportSize / naturalWidth, viewportSize / naturalHeight);
}

export function maxOffset(renderedSize: number, viewportSize: number): number {
  return Math.max(0, (renderedSize - viewportSize) / 2);
}

export function cropToDataUrl(
  image: HTMLImageElement,
  geometry: NatiUiCropGeometry,
  viewportSize: number,
  outputSize: number,
  shape: NatiUiImagePickerShape,
  outputType: NatiUiImagePickerOutputType,
  quality: number,
): string {
  const { scale, offsetX, offsetY } = geometry;
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  const left = viewportSize / 2 - renderedWidth / 2 + offsetX;
  const top = viewportSize / 2 - renderedHeight / 2 + offsetY;

  const sourceX = -left / scale;
  const sourceY = -top / scale;
  const sourceSize = viewportSize / scale;

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return image.src;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);

  return canvas.toDataURL(outputType, quality);
}
