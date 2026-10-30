import React from 'react';
import { Check } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function AvatarPicker({ groups = [], value, onChange }) {
  if (!groups.length) {
    return <p className="text-[11px] text-muted-foreground">No avatars came back from HeyGen.</p>;
  }

  return (
    <div className="grid max-h-[340px] grid-cols-2 gap-2 overflow-y-auto scroll-thin pr-1 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
      {groups.map((group) => {
        const active = value === group.id;
        return (
          <button
            key={group.id}
            type="button"
            onClick={() => onChange(group)}
            aria-pressed={active}
            className={`relative overflow-hidden rounded-lg border text-left transition-colors ${
              active ? 'border-foreground ring-1 ring-foreground' : 'border-border hover:border-foreground/40'
            }`}
          >
            <Image
              src={group.preview_image_url}
              alt={group.name}
              className="block aspect-[3/4] w-full bg-secondary object-cover object-top"
              fittingType="fill"
              focalPointY={0.3}
            />
            <span className="block truncate px-1.5 py-1.5 text-[10.5px] leading-tight">{group.name}</span>
            {active && (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-foreground text-background">
                <Check size={9} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}