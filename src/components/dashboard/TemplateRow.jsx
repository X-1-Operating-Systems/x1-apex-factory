import React from 'react';
import { Link } from 'react-router-dom';
import PageCanvas from '@/components/studio/PageCanvas';

export default function TemplateRow({ templates, onOpen }) {
  if (!templates.length) return null;

  return (
    <div className="mt-10">
      <p className="mb-3 text-[12.5px] text-muted-foreground">Start from a template</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {templates.slice(0, 4).map((t) => (
          <button key={t.id} type="button" onClick={() => onOpen(t.id)} className="group text-left">
            <div className="overflow-hidden rounded-lg border border-border bg-card transition-colors group-hover:border-foreground/25">
              <div className="pointer-events-none h-[104px] overflow-hidden">
                <PageCanvas
                  blocks={t.blocks || []}
                  tokens={{
                    accent: t.accent || '#b4532a',
                    surface: t.surface || 'light',
                    headlineFont: t.headline_font || 'serif',
                  }}
                  showSelection={false}
                />
              </div>
            </div>
            <p className="mt-1.5 truncate text-[11.5px] font-medium">{t.name}</p>
            <p className="truncate text-[10.5px] text-muted-foreground">{t.category.replace('_', ' ')}</p>
          </button>
        ))}
      </div>
      <Link to="/templates" className="mt-3 inline-block text-[11.5px] text-muted-foreground hover:text-foreground">
        View all templates
      </Link>
    </div>
  );
}