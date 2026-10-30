import React, { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';

export default function StepFrame({ frameUri }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!frameUri) return null;

  const toggle = async () => {
    if (url) {
      setUrl(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: frameUri, expires_in: 600 });
      setUrl(signed_url);
    } catch (err) {
      setError(err?.message || 'The frame could not be opened.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-0.5">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[9.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {loading ? <Loader2 size={9} className="animate-spin" /> : <ImageIcon size={9} />}
        {url ? 'Hide frame' : 'Frame'}
      </button>
      {error && <p className="mt-1 text-[9.5px] text-destructive">{error}</p>}
      {url && (
        <Image
          src={url}
          alt="The page as it looked at this step"
          fittingType="fit"
          className="mt-1 h-[150px] w-full rounded-md border border-border bg-secondary/40"
        />
      )}
    </div>
  );
}