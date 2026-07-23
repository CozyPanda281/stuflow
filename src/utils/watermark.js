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

      const size = Math.round(Math.min(w, h) * 0.32);
      const radius = size / 2;
      const margin = Math.max(14, Math.round(w * 0.03));
      const cx = w - size / 2 - margin;
      const cy = h - size / 2 - margin;
      const tilt = -7;
      const rad = tilt * Math.PI / 180;
      const s = size / 320;

      const d = new Date(dateStr + 'T00:00:00');
      const dateValue = format(d, 'dd MMM yyyy');
      const timeValue = format(new Date(), 'hh:mm a');
      const periodValue = typeof period === 'number' ? ordinal(period) : period;

      const metaItems = [
        { label: 'Date', value: dateValue },
        { label: 'Time', value: timeValue },
        { label: 'Subject', value: subject },
        { label: 'Period', value: periodValue },
      ];

      const titleSize = Math.round(16 * s);
      const metaSize = Math.round(10 * s);
      const checkSize = Math.round(32 * s);
      const lineH = Math.round(metaSize * 1.65);
      const lw = Math.max(1.5, Math.round(2 * s));
      const innerPad = Math.round(22 * s);
      const topSectionH = Math.round(38 * s);
      const checkAreaH = Math.round(36 * s);
      const metaAreaTop = innerPad + topSectionH + checkAreaH;
      const metaAreaH = metaItems.length * lineH;
      const totalH = metaAreaTop + metaAreaH + Math.round(16 * s);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rad);

      // --- Shadow ---
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = Math.round(16 * s);
      ctx.shadowOffsetX = Math.round(2 * s);
      ctx.shadowOffsetY = Math.round(4 * s);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.01)';
      ctx.fill();
      ctx.restore();

      // --- Frosted glass fill ---
      const bx = Math.round(cx - radius);
      const by = Math.round(cy - radius);
      const bsize = Math.round(size);
      const region = ctx.getImageData(bx, by, bsize, bsize);
      const blurred = boxBlur(ctx, region, Math.round(8 * s));
      ctx.putImageData(blurred, bx, by);

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.restore();

      // --- Outer circle border ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius - lw * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.40)';
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.restore();

      // --- Inner circle border ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius - lw * 0.5 - Math.round(6 * s), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.lineWidth = Math.max(0.5, Math.round(0.8 * s));
      ctx.stroke();
      ctx.restore();

      // --- Decorative dots around inner circle ---
      const dotRadius = Math.max(1.5, Math.round(1.5 * s));
      const dotCount = 24;
      const dotCircleR = radius - lw * 0.5 - Math.round(4 * s);
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        const dx = Math.cos(angle) * dotCircleR;
        const dy = Math.sin(angle) * dotCircleR;
        ctx.beginPath();
        ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- Top section: "CERTIFIED" with star ---
      const topY = -radius + innerPad;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Star
      const starSize = Math.round(11 * s);
      drawStar(ctx, 0, topY, starSize);
      ctx.restore();

      // CERTIFIED text
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${titleSize}px -apple-system, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText('CERTIFIED', 0, topY + Math.round(22 * s));
      ctx.restore();

      // Divider line
      const dividerY = topY + Math.round(34 * s);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-Math.round(50 * s), dividerY);
      ctx.lineTo(Math.round(50 * s), dividerY);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = Math.max(0.5, Math.round(0.8 * s));
      ctx.stroke();
      ctx.restore();

      // --- Center checkmark ---
      const checkY = dividerY + Math.round(6 * s) + checkSize / 2;
      ctx.save();
      ctx.translate(0, checkY);
      drawCheckCircleStamp(ctx, checkSize, s);
      ctx.restore();

      // --- Metadata rows ---
      const metaStartY = metaAreaTop - radius;
      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.font = `${metaSize}px -apple-system, system-ui, sans-serif`;

      for (let i = 0; i < metaItems.length; i++) {
        const item = metaItems[i];
        const y = metaStartY + i * lineH;
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(item.label, Math.round(-8 * s), y + lineH / 2);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.90)';
        ctx.fillText(item.value, Math.round(8 * s), y + lineH / 2);
      }
      ctx.restore();

      ctx.restore();
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = imageDataUrl;
  });
}

function drawStar(ctx, x, y, size) {
  const spikes = 5;
  const outerR = size / 2;
  const innerR = outerR * 0.4;
  const step = Math.PI / spikes;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCheckCircleStamp(ctx, size, s) {
  const r = size / 2;
  const lw = Math.max(1.5, Math.round(1.8 * s));
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.80)';
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-r * 0.28, r * 0.05);
  ctx.lineTo(-r * 0.07, r * 0.25);
  ctx.lineTo(r * 0.35, -r * 0.18);
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

export async function saveImageToGallery(dataUrl, subject = 'attendance', dateStr = '') {
  const date = dateStr ? dateStr.replace(/-/g, '') : format(new Date(), 'yyyyMMdd');
  const timestamp = format(new Date(), 'HHmmss');
  const filename = `Attendance_${subject.replace(/[^a-zA-Z0-9]/g, '_')}_${date}_${timestamp}.jpg`;

  const blob = await (await fetch(dataUrl)).blob();

  // Try File System Access API (Chromium) — lets user pick/create a folder
  try {
    if ('showDirectoryPicker' in window) {
      let dirHandle = sessionStorage.getItem('stuflow-dir-handle');
      let directory;

      if (dirHandle) {
        try {
          const stored = JSON.parse(dirHandle);
          const id = stored.id;
          const all = await navigator.storage.getDirectory();
          directory = await all.getDirectoryHandle(id);
        } catch {
          sessionStorage.removeItem('stuflow-dir-handle');
        }
      }

      if (!directory) {
        directory = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'pictures' });
        try {
          const perm = await directory.queryPermission({ mode: 'readwrite' });
          if (perm !== 'granted') {
            const result = await directory.requestPermission({ mode: 'readwrite' });
            if (result !== 'granted') throw new Error('permission denied');
          }
        } catch {}
      }

      let stuflowDir;
      try {
        stuflowDir = await directory.getDirectoryHandle('StuFlow', { create: true });
      } catch {
        stuflowDir = directory;
      }

      const fileHandle = await stuflowDir.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      // Store directory handle for next time
      try {
        const all = await navigator.storage.getDirectory();
        const id = `stuflow-${Date.now()}`;
        await all.getDirectoryHandle(id, { create: true });
        sessionStorage.setItem('stuflow-dir-handle', JSON.stringify({ id }));
      } catch {}

      return { success: true, method: 'filesystem', filename };
    }
  } catch (e) {
    if (e.name === 'AbortError' || e.message === 'permission denied') {
      // User cancelled or denied — fall through
    }
  }

  // Try navigator.share with file (mobile)
  try {
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/jpeg' })] })) {
      await navigator.share({
        title: 'Attendance Proof',
        text: `Attendance proof for ${subject}`,
        files: [new File([blob], filename, { type: 'image/jpeg' })],
      });
      return { success: true, method: 'share', filename };
    }
  } catch (e) {
    if (e.name !== 'AbortError') { /* ignore */ }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);

  return { success: true, method: 'download', filename };
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
