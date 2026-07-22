import { format } from 'date-fns';

export function addWatermark(imageDataUrl, dateStr) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0);

      const d = new Date(dateStr + 'T00:00:00');
      const dayName = format(d, 'EEEE');
      const dateFormatted = format(d, 'dd MMM yyyy');
      const timeNow = format(new Date(), 'HH:mm:ss');
      const watermarkText = `${dayName}  ${dateFormatted}  ${timeNow}`;

      const fontSize = Math.max(14, Math.round(canvas.width / 30));
      ctx.font = `bold ${fontSize}px -apple-system, system-ui, sans-serif`;

      const padding = 12;
      const textWidth = ctx.measureText(watermarkText).width;
      const barHeight = fontSize + padding * 2;

      const barX = 0;
      const barY = canvas.height - barHeight;
      const barW = canvas.width;
      const barH = barHeight;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(barX, barY, barW, barH);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(watermarkText, canvas.width / 2, barY + barH / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = imageDataUrl;
  });
}
