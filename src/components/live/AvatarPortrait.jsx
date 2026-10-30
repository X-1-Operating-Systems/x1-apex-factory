import React from 'react';
import { Image } from '@/components/ui/image';

// The workspace's own LiveAvatar persona artwork. LiveAvatar's avatar list is empty on this
// account, so the studio shows the persona it actually runs rather than a nameless select.
export const EDEN_SKYE_PORTRAIT =
  'https://media.base44.com/images/public/6ae48ede6fd67187c24e94cd/51ca0aed5_EDEN_SKYE_LIVEAVATAR_CHEST_VISIBLE_1920x1080.png';

export default function AvatarPortrait({ name = 'Eden Skye', note, className = '' }) {
  return (
    <figure className={`overflow-hidden rounded-md border border-border bg-secondary ${className}`}>
      <Image
        src={EDEN_SKYE_PORTRAIT}
        alt={`${name} avatar`}
        className="block aspect-video w-full"
        fittingType="fill"
        focalPointY={0.35}
      />
      <figcaption className="flex items-center justify-between gap-2 px-2 py-1.5">
        <span className="truncate text-[11px] font-medium">{name}</span>
        {note && <span className="shrink-0 text-[10px] text-muted-foreground">{note}</span>}
      </figcaption>
    </figure>
  );
}