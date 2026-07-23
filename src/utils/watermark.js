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

      const size = Math.round(Math.min(w, h) * 0.30);
      const radius = size / 2;
      const margin = Math.max(14, Math.round(w * 0.03));
      const cx = w - size / 2 - margin;
      const cy = h - size / 2 - margin;
      const s = size / 300;

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

      const blue = 'rgba(91, 141, 255, 0.55)';
      const darkBlue = 'rgba(91, 141, 255, 0.75)';
      const textClr = 'rgba(255,255,255,0.92)';
      const mutedClr = 'rgba(255,255,255,0.50)';
      const borderClr = 'rgba(91, 141, 255, 0.40)';

      const titleSize = Math.round(17 * s);
      const metaSize = Math.round(10 * s);
      const checkSize = Math.round(34 * s);
      const lineH = Math.round(metaSize * 1.7);
      const lw = Math.max(2, Math.round(2.2 * s));
      const innerPad = Math.round(20 * s);

      ctx.save();
      ctx.translate(cx, cy);

      // --- Shadow ---
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.30)';
      ctx.shadowBlur = Math.round(14 * s);
      ctx.shadowOffsetX = Math.round(2 * s);
      ctx.shadowOffsetY = Math.round(3 * s);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.01)';
      ctx.fill();
      ctx.restore();

      // --- Frosted glass fill with blue tint ---
      const bx = Math.round(cx - radius);
      const by = Math.round(cy - radius);
      const bsize = Math.round(size);
      const region = ctx.getImageData(bx, by, bsize, bsize);
      const blurred = boxBlur(ctx, region, Math.round(10 * s));
      ctx.putImageData(blurred, bx, by);

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, 'rgba(91, 141, 255, 0.08)');
      grad.addColorStop(0.7, 'rgba(91, 141, 255, 0.12)');
      grad.addColorStop(1, 'rgba(167, 139, 250, 0.18)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // --- Outer border ring ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
      ctx.strokeStyle = borderClr;
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.restore();

      // --- Inner border ring ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius - lw - Math.round(5 * s), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(91, 141, 255, 0.20)';
      ctx.lineWidth = Math.max(0.5, Math.round(0.8 * s));
      ctx.stroke();
      ctx.restore();

      // --- Dot ring ---
      const dotR = Math.max(1.2, Math.round(1.2 * s));
      const dotCount = 28;
      const dotCircleR = radius - lw - Math.round(3 * s);
      ctx.save();
      ctx.fillStyle = 'rgba(91, 141, 255, 0.25)';
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dotCircleR, Math.sin(angle) * dotCircleR, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- Header ---
      const headerY = -radius + innerPad + Math.round(10 * s);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = `800 ${titleSize}px -apple-system, system-ui, sans-serif`;
      ctx.fillStyle = textClr;
      ctx.fillText('CERTIFIED', 0, headerY);

      ctx.font = `600 ${Math.round(9 * s)}px -apple-system, system-ui, sans-serif`;
      ctx.fillStyle = mutedClr;
      ctx.fillText('ATTENDANCE PROOF', 0, headerY + Math.round(16 * s));

      ctx.restore();

      // --- Divider ---
      const divY = headerY + Math.round(26 * s);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-Math.round(55 * s), divY);
      ctx.lineTo(Math.round(55 * s), divY);
      ctx.strokeStyle = 'rgba(91, 141, 255, 0.20)';
      ctx.lineWidth = Math.max(0.5, Math.round(0.8 * s));
      ctx.stroke();
      ctx.restore();

      // --- Checkmark ---
      const checkY = divY + Math.round(10 * s) + checkSize / 2;
      ctx.save();
      ctx.translate(0, checkY);
      drawCheckCircleStamp(ctx, checkSize, s, blue, darkBlue);
      ctx.restore();

      // --- Metadata ---
      const metaStartY = checkY + checkSize / 2 + Math.round(12 * s);
      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.font = `${metaSize}px -apple-system, system-ui, sans-serif`;

      for (let i = 0; i < metaItems.length; i++) {
        const item = metaItems[i];
        const y = metaStartY + i * lineH;
        ctx.textAlign = 'right';
        ctx.fillStyle = mutedClr;
        ctx.fillText(item.label, Math.round(-8 * s), y + lineH / 2);
        ctx.textAlign = 'left';
        ctx.fillStyle = textClr;
        ctx.fillText(item.value, Math.round(8 * s), y + lineH / 2);
      }
      ctx.restore();

      ctx.restore();
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = imageDataUrl;
  });
}

function drawCheckCircleStamp(ctx, size, s, accentClr, strongClr) {
  const r = size / 2;
  const lw = Math.max(1.5, Math.round(1.8 * s));
  ctx.save();
  ctx.strokeStyle = strongClr || 'rgba(91, 141, 255, 0.75)';
  ctx.fillStyle = 'rgba(91, 141, 255, 0.10)';
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
