const MAX_WIDTH = 2048;
const JPEG_QUALITY = 0.92;
const MAX_IMAGES = 4;

export function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function processMultipleImages(
  files: FileList,
  existing: string[]
): Promise<string[]> {
  const slots = MAX_IMAGES - existing.length;
  if (slots <= 0) return existing;

  const toProcess = Array.from(files).slice(0, slots);
  const processed = await Promise.all(toProcess.map(processImage));
  return [...existing, ...processed];
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadAllImages(images: string[], prefix: string = "post") {
  images.forEach((img, i) => {
    setTimeout(() => {
      downloadImage(img, `${prefix}-image-${i + 1}.jpg`);
    }, i * 300); // stagger downloads to avoid browser blocking
  });
}

export interface WatermarkConfig {
  watermark_image_url: string;
  watermark_position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  watermark_opacity: number;
}

export function downloadImageWithWatermark(
  imageDataUrl: string,
  watermark: WatermarkConfig,
  filename: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const mainImg = new Image();
    mainImg.onload = () => {
      const wmImg = new Image();
      wmImg.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = mainImg.width;
        canvas.height = mainImg.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas context not available")); return; }

        ctx.drawImage(mainImg, 0, 0);

        // Watermark size: 20% of image width
        const wmWidth = Math.round(mainImg.width * 0.2);
        const wmHeight = Math.round(wmWidth * (wmImg.height / wmImg.width));
        const pad = Math.round(mainImg.width * 0.03);

        let x = pad, y = pad;
        switch (watermark.watermark_position) {
          case "top-right": x = mainImg.width - wmWidth - pad; break;
          case "bottom-left": y = mainImg.height - wmHeight - pad; break;
          case "bottom-right": x = mainImg.width - wmWidth - pad; y = mainImg.height - wmHeight - pad; break;
          case "center": x = (mainImg.width - wmWidth) / 2; y = (mainImg.height - wmHeight) / 2; break;
        }

        ctx.globalAlpha = watermark.watermark_opacity;
        ctx.drawImage(wmImg, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1;

        const result = canvas.toDataURL("image/jpeg", 0.92);
        downloadImage(result, filename);
        resolve();
      };
      wmImg.onerror = () => {
        // Fallback: download without watermark
        downloadImage(imageDataUrl, filename);
        resolve();
      };
      wmImg.src = watermark.watermark_image_url;
    };
    mainImg.onerror = () => reject(new Error("Failed to load image"));
    mainImg.src = imageDataUrl;
  });
}

export function downloadAllImagesWithWatermark(
  images: string[],
  watermark: WatermarkConfig,
  prefix: string = "post"
) {
  images.forEach((img, i) => {
    setTimeout(() => {
      downloadImageWithWatermark(img, watermark, `${prefix}-image-${i + 1}.jpg`);
    }, i * 400);
  });
}
