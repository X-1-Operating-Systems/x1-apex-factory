import React from 'react';
import { HeroBlock, StatsBlock, FeaturesBlock, ShowcaseBlock, TextBlock } from '@/components/studio/CoreBlocks';
import { GalleryBlock, PricingBlock, FaqBlock, CtaBlock, ContactBlock, FooterBlock } from '@/components/studio/ExtrasBlocks';
import { BLOCK_LIBRARY, surfaceTheme } from '@/components/studio/blockTheme';

const LABELS = Object.fromEntries(BLOCK_LIBRARY.map((b) => [b.type, b.label]));

function renderBlock(block, tokens) {
  const shared = {
    props: block.props || {},
    accent: tokens.accent,
    surface: tokens.surface,
    font: tokens.headlineFont,
  };
  switch (block.type) {
    case 'hero':
      return <HeroBlock {...shared} onPick={() => {}} />;
    case 'stats':
      return <StatsBlock {...shared} />;
    case 'features':
      return <FeaturesBlock {...shared} />;
    case 'showcase':
      return <ShowcaseBlock {...shared} />;
    case 'text':
      return <TextBlock {...shared} />;
    case 'gallery':
      return <GalleryBlock {...shared} />;
    case 'pricing':
      return <PricingBlock {...shared} />;
    case 'faq':
      return <FaqBlock {...shared} />;
    case 'cta':
      return <CtaBlock {...shared} />;
    case 'contact':
      return <ContactBlock {...shared} />;
    case 'footer':
      return <FooterBlock {...shared} />;
    default:
      return null;
  }
}

export default function PageCanvas({ blocks = [], tokens, selectedId, onSelect, showSelection = true }) {
  const th = surfaceTheme(tokens.surface);

  if (!blocks.length) {
    return (
      <div
        className="grid h-full place-items-center px-8 text-center"
        style={{ background: th.bg, minHeight: 320 }}
      >
        <div>
          <p className="display-title text-2xl" style={{ color: th.fg }}>An empty page</p>
          <p className="mt-2 text-sm" style={{ color: th.muted }}>
            Ask the studio agent to compose this page, or add a block from the inspector.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ containerType: 'inline-size', background: th.bg }}>
      {blocks.map((block) => {
        const selected = showSelection && selectedId === block.id;
        return (
          <div
            key={block.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(block.id);
            }}
            className="relative transition-shadow"
            style={{ boxShadow: selected ? `inset 0 0 0 2px ${tokens.accent}` : 'none' }}
          >
            {renderBlock(block, tokens)}
            {selected && (
              <span
                className="pointer-events-none absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
                style={{ background: tokens.accent }}
              >
                {LABELS[block.type] || block.type}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}