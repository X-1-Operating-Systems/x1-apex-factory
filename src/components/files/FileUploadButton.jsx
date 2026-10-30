import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Upload } from 'lucide-react';
import { registerFiles } from '@/lib/files';

export default function FileUploadButton({ onUploaded }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const add = async (event) => {
    const picked = Array.from(event.target.files || []).slice(0, 5);
    event.target.value = '';
    if (!picked.length) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of picked) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        uploaded.push({ name: file.name, file_uri, mime_type: file.type, size: file.size });
      }
      const created = await registerFiles(uploaded, { source: 'library' });
      if (onUploaded) onUploaded(created);
    } catch (err) {
      setError(err?.message || 'That file could not be uploaded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="glass-frost inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11.5px] font-medium disabled:opacity-50"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload
      </button>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
      <input ref={input} type="file" multiple onChange={add} className="hidden" aria-hidden="true" tabIndex={-1} />
    </div>
  );
}