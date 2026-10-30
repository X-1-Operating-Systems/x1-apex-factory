import React from 'react';
import { Image } from '@/components/ui/image';

export default function AvatarPicker({ groups = [], value, onChange }) {
  if (!groups.length) {
    return <p className="text-[11px] text-muted-foreground">No avatars came back from HeyGen.</p>;
  }

  return (
    <div className="grid max-h-[210px] grid-cols-3 gap-1.5 overflow-y-auto scroll-thin sm:grid-cols-4">
      {groups.map((group) => {
        const active = value === group.id;
        return (
          <button
            key={group.id}
            type="button"
            onClick={() => onChange(group)}
            className={`overflow-hidden rounded-md border text-left transition-colors ${
              active ? 'border-foreground' : 'border-border hover:border-foreground/40'
            }`}
          >
            <Image
              src={group.preview_image_url}
              alt={group.name}
              className="h-[54px] w-full bg-secondary"
              fittingType="fill"
            />
            <span className="block truncate px-1.5 py-1 text-[10px]">{group.name}</span>
          </button>
        );
      })}
    </div>
  );
}