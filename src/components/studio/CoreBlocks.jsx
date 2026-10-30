import React from 'react';
import { Image } from '@/components/ui/image';
import { ArrowUpRight, Check } from 'lucide-react';
import { FONTS, PAD, GAP, t, surfaceTheme } from '@/components/studio/blockTheme';

function Cta({ label, variant, accent, onPick }) {
  if (!label) return null;
  const primary = variant !== 'ghost';
  return (
    <button
      type="button"
      onClick={onPick}
      className="inline-flex items-center gap-2 rounded-full transition-transform duration-300 hover:-translate-y-0.5"
      style={{
        fontFamily: FONTS.sans,
        fontSize: 'clamp(0.75rem, 1.05cqw, 0.86rem)',
        fontWeight: 600,
        letterSpacing: '0.01em',
        padding: 'clamp(10px, 1.5cqw, 14px) clamp(18px, 2.6cqw, 28px)',
        background: primary ? accent : 'transparent',
        color: primary ? '#fff' : undefined,
        border: primary ? '1px solid transparent' : `1px solid ${'rgba(255,255,255,0.35)'}`,
      }}
    >
      {label}
      <ArrowUpRight size={15} strokeWidth={2.2} />
    </button>
  );
}

export function HeroBlock({ props, accent, surface, font, onPick }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `${PAD} ${PAD} clamp(30px, 5cqw, 64px)` }}>
      <div className="flex flex-wrap items-end" style={{ gap: GAP }}>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          {props.eyebrow && (
            <p style={{ ...t.eyebrow, color: accent, marginBottom: 'clamp(12px, 2cqw, 22px)' }}>{props.eyebrow}</p>
          )}
          <h1 style={{ ...t.h1, fontFamily: FONTS[font] || FONTS.serif, color: th.fg }}>{props.title}</h1>
          {props.subtitle && (
            <p style={{ ...t.lead, color: th.muted, marginTop: 'clamp(14px, 2.2cqw, 26px)', maxWidth: '46ch' }}>
              {props.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 'clamp(20px, 3cqw, 34px)' }}>
            <Cta label={props.primaryCta} accent={accent} onPick={onPick} />
            {props.secondaryCta && (
              <button
                type="button"
                onClick={onPick}
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 'clamp(0.75rem, 1.05cqw, 0.86rem)',
                  fontWeight: 500,
                  color: th.fg,
                  borderBottom: `1px solid ${th.line}`,
                  paddingBottom: 2,
                }}
              >
                {props.secondaryCta}
              </button>
            )}
          </div>
        </div>
        {props.image && (
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <Image
              src={props.image}
              alt={props.imageAlt || props.title}
              className="w-full rounded-[6px]"
              style={{ aspectRatio: '4 / 5', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function StatsBlock({ props, accent, surface }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `0 ${PAD} clamp(24px, 4cqw, 48px)` }}>
      <div
        className="flex flex-wrap"
        style={{ gap: 'clamp(16px, 3cqw, 40px)', borderTop: `1px solid ${th.line}`, paddingTop: 'clamp(18px, 2.6cqw, 30px)' }}
      >
        {(props.items || []).map((item, i) => (
          <div key={i} style={{ flex: '1 1 130px' }}>
            <p style={{ ...t.h2, fontFamily: FONTS.serif, color: th.fg, fontSize: 'clamp(1.3rem, 2.6cqw, 2rem)' }}>
              {item.value}
            </p>
            <p style={{ ...t.small, color: th.muted, marginTop: 6 }}>{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturesBlock({ props, accent, surface, font }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `clamp(24px, 4cqw, 56px) ${PAD}`, background: th.soft }}>
      <div style={{ maxWidth: '58ch' }}>
        {props.eyebrow && <p style={{ ...t.eyebrow, color: accent, marginBottom: 12 }}>{props.eyebrow}</p>}
        <h2 style={{ ...t.h2, fontFamily: FONTS[font] || FONTS.serif, color: th.fg }}>{props.title}</h2>
      </div>
      <div
        className="grid"
        style={{ gap: 'clamp(16px, 2.4cqw, 32px)', marginTop: 'clamp(20px, 3.4cqw, 44px)', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}
      >
        {(props.items || []).map((item, i) => (
          <div key={i} style={{ borderTop: `1px solid ${th.line}`, paddingTop: 'clamp(12px, 1.6cqw, 18px)' }}>
            <h3 style={{ ...t.h3, color: th.fg }}>{item.title}</h3>
            <p style={{ ...t.body, color: th.muted, marginTop: 8 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ShowcaseBlock({ props, accent, surface, font }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `${PAD}` }}>
      <div className="flex flex-wrap items-center" style={{ gap: GAP }}>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          {props.image && (
            <Image src={props.image} alt={props.imageAlt || props.title} className="w-full rounded-[6px]" style={{ aspectRatio: '16 / 11', height: 'auto' }} />
          )}
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <h2 style={{ ...t.h2, fontFamily: FONTS[font] || FONTS.serif, color: th.fg }}>{props.title}</h2>
          {props.body && <p style={{ ...t.body, color: th.muted, marginTop: 14 }}>{props.body}</p>}
          <ul style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            {(props.bullets || []).map((b, i) => (
              <li key={i} className="flex items-start gap-2.5" style={{ ...t.body, color: th.fg }}>
                <Check size={16} style={{ color: accent, marginTop: 3, flexShrink: 0 }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function TextBlock({ props, surface, font }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `clamp(24px, 4cqw, 56px) ${PAD}` }}>
      <div style={{ maxWidth: '62ch' }}>
        {props.title && <h2 style={{ ...t.h2, fontFamily: FONTS[font] || FONTS.serif, color: th.fg }}>{props.title}</h2>}
        <p style={{ ...t.body, color: th.muted, marginTop: 14, whiteSpace: 'pre-line' }}>{props.body}</p>
      </div>
    </section>
  );
}