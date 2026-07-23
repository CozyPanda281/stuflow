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
      const margin = Math.max(16, Math.round(w * 0.03));
      const cx = w - size / 2 - margin;
      const cy = h - size / 2 - margin;
      const s = size / 300;

      const d = new Date(dateStr + 'T00:00:00');
      const dateValue = format(d, 'dd MMM yyyy');
      const timeValue = format(new Date(), 'hh:mm a');
      const periodValue = typeof period === 'number' ? ordinal(period) : period;

      const heroSize = Math.round(32 * s);
      const metaLabelSz = Math.round(10 * s);
      const metaValSz = Math.round(11 * s);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-2 * Math.PI / 180);

      // --- Hero: ATTENDED ---
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 italic ${heroSize}px Georgia, 'Times New Roman', serif`;

      const grad = ctx.createLinearGradient(0, -heroSize * 0.5, 0, heroSize * 0.5);
      grad.addColorStop(0, '#4ade80');
      grad.addColorStop(0.45, '#22c55e');
      grad.addColorStop(1, '#15803d');

      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = Math.round(5 * s);
      ctx.shadowOffsetX = Math.round(2 * s);
      ctx.shadowOffsetY = Math.round(2 * s);
      ctx.fillStyle = grad;
      ctx.fillText('ATTENDED', 0, -Math.round(4 * s));
      ctx.restore();

      // --- Top row: DATE / TIME ---
      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = `700 ${metaLabelSz}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.50)';

      const topY = -Math.round(82 * s);
      ctx.fillText('D A T E', -Math.round(70 * s), topY);
      ctx.fillText('T I M E', Math.round(70 * s), topY);

      ctx.font = `700 ${metaValSz}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = 'rgba(22, 163, 74, 0.88)';
      const topValY = topY + Math.round(16 * s);
      ctx.fillText(dateValue, -Math.round(70 * s), topValY);
      ctx.fillText(timeValue, Math.round(70 * s), topValY);
      ctx.restore();

      // --- Bottom row: SUBJECT / PERIOD ---
      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = `700 ${metaLabelSz}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.50)';

      const botY = Math.round(82 * s);
      ctx.fillText('S U B J E C T', -Math.round(70 * s), botY);
      ctx.fillText('P E R I O D', Math.round(70 * s), botY);

      ctx.font = `700 ${metaValSz}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = 'rgba(22, 163, 74, 0.88)';
      const botValY = botY + Math.round(16 * s);
      ctx.fillText(subject, -Math.round(70 * s), botValY);
      ctx.fillText(periodValue, Math.round(70 * s), botValY);
      ctx.restore();

      // --- Ink stamp texture noise ---
      const absX = Math.round(cx - size / 2);
      const absY = Math.round(cy - size / 2);
      const stampData = ctx.getImageData(absX, absY, Math.round(size), Math.round(size));
      for (let i = 3; i < stampData.data.length; i += 4) {
        if (stampData.data[i] > 0) {
          const noise = 0.82 + Math.random() * 0.36;
          stampData.data[i] = Math.round(Math.min(255, stampData.data[i] * noise));
        }
      }
      ctx.putImageData(stampData, absX, absY);

      ctx.restore();
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = imageDataUrl;
  });
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
