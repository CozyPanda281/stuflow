import { format } from 'date-fns';

export function addWatermark(imageDataUrl, dateStr, subject = '—', period = '—') {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 1600;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let w = img.width, h = img.height;
      if (Math.max(w, h) > MAX_DIM) {
        const s = MAX_DIM / Math.max(w, h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const margin = Math.max(12, Math.round(w * 0.025));
      const badgeW = Math.max(160, Math.min(280, Math.round(w * 0.18)));
      const s = badgeW / 220;

      const radius = Math.round(18 * s);
      const pad = Math.round(14 * s);
      const borderW = Math.max(1, Math.round(1 * s));

      const iconSize = Math.round(18 * s);
      const titleSize = Math.round(15 * s);
      const metaSize = Math.round(11 * s);
      const rowGap = Math.round(3 * s);
      const labelValueGap = Math.round(8 * s);
      const lineH = Math.round(metaSize * 1.6);

      const d = new Date(dateStr + 'T00:00:00');
      const dateValue = format(d, 'dd MMM yyyy');
      const timeValue = format(new Date(), 'hh:mm a');
      const periodValue = typeof period === 'number' ? ordinal(period) : period;

      const lines = [
        { label: 'Date', value: dateValue },
        { label: 'Time', value: timeValue },
        { label: 'Subject', value: subject },
        { label: 'Period', value: periodValue },
      ];

      ctx.font = `${metaSize}px -apple-system, system-ui, sans-serif`;
      let maxLabelW = 0;
      for (const l of lines) {
        maxLabelW = Math.max(maxLabelW, ctx.measureText(l.label).width);
      }

      const titleRowH = Math.max(iconSize, titleSize) + 2;
      const contentH = titleRowH + rowGap + lines.length * lineH;
      const badgeH = Math.round(pad * 2 + contentH);

      const badgeX = w - badgeW - margin;
      const badgeY = h - badgeH - margin;

      // Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = Math.round(12 * s);
      ctx.shadowOffsetY = Math.round(3 * s);
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, radius);
      ctx.fillStyle = 'rgba(0,0,0,0.01)';
      ctx.fill();
      ctx.restore();

      // Frosted glass background
      const region = ctx.getImageData(badgeX, badgeY, badgeW, badgeH);
      const blurred = boxBlur(ctx, region, Math.round(6 * s));
      ctx.putImageData(blurred, badgeX, badgeY);

      // White overlay
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, radius);
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.fill();

      // Border
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, radius);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = borderW;
      ctx.stroke();

      // Content layout
      const cx = badgeX + pad;
      let cy = badgeY + pad;

      // Circle check icon
      drawCheckCircle(ctx, cx, cy + titleRowH / 2, iconSize, s);

      // Title
      ctx.font = `600 ${titleSize}px -apple-system, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText('Attendance Verified', cx + iconSize + Math.round(8 * s), cy + titleRowH / 2);

      cy += titleRowH + rowGap;

      // Metadata rows
      ctx.font = `${metaSize}px -apple-system, system-ui, sans-serif`;
      ctx.textBaseline = 'middle';
      for (const l of lines) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(l.label, cx, cy + lineH / 2);
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.fillText(l.value, cx + maxLabelW + labelValueGap, cy + lineH / 2);
        cy += lineH;
      }

      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = imageDataUrl;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCheckCircle(ctx, cx, cy, size, s) {
  const r = size / 2;
  const lw = Math.max(1.5, Math.round(1.5 * s));
  ctx.save();
  ctx.translate(cx + r, cy);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-r * 0.25, r * 0.05);
  ctx.lineTo(-r * 0.05, r * 0.22);
  ctx.lineTo(r * 0.32, -r * 0.15);
  ctx.stroke();

  ctx.restore();
}

function boxBlur(ctx, imageData, radius) {
  const w = imageData.width, h = imageData.height;
  const r = Math.max(1, Math.min(Math.floor(radius), 8));
  const src = new Uint8ClampedArray(imageData.data);
  const tmp = new Uint8ClampedArray(src);
  const out = new Uint8ClampedArray(src);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < w) {
          const idx = (y * w + nx) * 4;
          rSum += src[idx]; gSum += src[idx + 1]; bSum += src[idx + 2];
          count++;
        }
      }
      const idx = (y * w + x) * 4;
      tmp[idx] = rSum / count; tmp[idx + 1] = gSum / count;
      tmp[idx + 2] = bSum / count; tmp[idx + 3] = src[idx + 3];
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < h) {
          const idx = (ny * w + x) * 4;
          rSum += tmp[idx]; gSum += tmp[idx + 1]; bSum += tmp[idx + 2];
          count++;
        }
      }
      const idx = (y * w + x) * 4;
      out[idx] = rSum / count; out[idx + 1] = gSum / count;
      out[idx + 2] = bSum / count;
    }
  }

  const result = ctx.createImageData(w, h);
  result.data.set(out);
  return result;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
