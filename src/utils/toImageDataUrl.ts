// Converts an uploaded image file into a resized, compressed base64 data
// URL, entirely in the browser — no upload endpoint or file storage
// needed. photo_url is a plain TEXT column, so a "data:image/jpeg;base64,..."
// string works exactly the same way a real image URL does everywhere it's
// used (<img src>), it's just self-contained. Resizing before encoding
// keeps the string small (a few hundred KB at most for a profile photo)
// instead of however large the original upload was.
export function toImageDataUrl(file: File, maxDimension = 400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file doesn\'t look like a valid image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not process the image.'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
