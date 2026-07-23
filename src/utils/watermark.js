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
      const labelW = Math.round(w * 0.13);
      const rowH = Math.round(Math.min(w, h) * 0.034);
      const headerSz = Math.round(rowH * 1.55);
      const detailSz = Math.round(rowH * 0.8);
      const innerPad = Math.round(rowH * 0.8);
      const panelW = labelW + Math.round(w * 0.18) + innerPad * 2;
      const rows = 5;
      const panelH = headerSz + rows * rowH + innerPad * 2;
      const panelX = w - pad - panelW;
      const panelY = h - pad - panelH;
      const r = Math.round(rowH * 0.5);

      // --- Panel background ---
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(panelX + r, panelY);
      ctx.lineTo(panelX + panelW - r, panelY);
      ctx.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + r);
      ctx.lineTo(panelX + panelW, panelY + panelH - r);
      ctx.quadraticCurveTo(panelX + panelW, panelY + panelH, panelX + panelW - r, panelY + panelH);
      ctx.lineTo(panelX + r, panelY + panelH);
      ctx.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - r);
      ctx.lineTo(panelX, panelY + r);
      ctx.quadraticCurveTo(panelX, panelY, panelX + r, panelY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
      ctx.fill();
      ctx.restore();

      // --- Green accent bar ---
      ctx.save();
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(panelX + Math.round(rowH * 0.3), panelY + Math.round(rowH * 0.4), Math.round(rowH * 0.2), panelH - Math.round(rowH * 0.8));
      ctx.restore();

      // --- Content ---
      const contentX = panelX + innerPad + Math.round(rowH * 0.5);
      let y = panelY + innerPad;

      ctx.save();
      ctx.textBaseline = 'middle';

      // ATTENDED header
      ctx.textAlign = 'left';
      ctx.font = `900 ${headerSz}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = '#22c55e';
      ctx.fillText('ATTENDED', contentX, y + headerSz / 2);
      y += headerSz + Math.round(rowH * 0.4);

      // Divider
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(contentX, y);
      ctx.lineTo(panelX + panelW - innerPad, y);
      ctx.stroke();
      ctx.restore();
      y += Math.round(rowH * 0.6);

      // Detail rows
      const detail = [
        ['Date', dateValue],
        ['Time', timeValue],
        ['Subject', subject],
        ['Period', periodValue],
      ];

      for (const [l, v] of detail) {
        ctx.textAlign = 'left';
        ctx.font = `500 ${detailSz}px Georgia, 'Times New Roman', serif`;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.50)';
        ctx.fillText(l, contentX, y + detailSz / 2);

        ctx.font = `700 ${detailSz}px Georgia, 'Times New Roman', serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.fillText(v, contentX + labelW, y + detailSz / 2);

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
