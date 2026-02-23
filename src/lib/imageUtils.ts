const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.7;
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
