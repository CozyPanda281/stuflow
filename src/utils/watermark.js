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

      const d = new Date(dateStr + 'T00:00:00');
      const dateValue = format(d, 'dd MMM yyyy');
      const timeValue = format(new Date(), 'hh:mm a');
      const periodValue = typeof period === 'number' ? ordinal(period) : period;

      const pad = Math.round(w * 0.04);
      const rowH = Math.round(Math.min(w, h) * 0.035);
      const headerSz = Math.round(rowH * 1.5);
      const lineSz = Math.round(rowH * 0.75);
      let y = h - pad - rowH * 5;

      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';

      ctx.font = `800 ${headerSz}px system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
      ctx.fillText('ATTENDED', w - pad, y);
      y += rowH;

      const label = [
        ['Date', dateValue],
        ['Time', timeValue],
        ['Subject', subject],
        ['Period', periodValue],
      ];

      for (const [l, v] of label) {
        ctx.font = `600 ${lineSz}px system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.50)';
        ctx.fillText(l, w - pad - Math.round(w * 0.15), y);

        ctx.font = `700 ${lineSz}px system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(22, 163, 74, 0.90)';
        ctx.fillText(v, w - pad, y);

        y += rowH;
      }

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
