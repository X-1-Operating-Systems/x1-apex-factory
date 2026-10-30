import React from 'react';
import { Image } from '@/components/ui/image';
import { Mail, Phone } from 'lucide-react';
import { FONTS, PAD, GAP, t, surfaceTheme } from '@/components/studio/blockTheme';

export function GalleryBlock({ props, surface, font }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `clamp(24px, 4cqw, 56px) ${PAD}`, background: th.soft }}>
      <h2 style={{ ...t.h2, fontFamily: FONTS[font] || FONTS.serif, color: th.fg }}>{props.title}</h2>
      {props.body && <p style={{ ...t.body, color: th.muted, marginTop: 10, maxWidth: '54ch' }}>{props.body}</p>}
      <div
        className="grid"
        style={{ gap: 'clamp(10px, 1.6cqw, 20px)', marginTop: 'clamp(18px, 2.6cqw, 32px)', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}
      >
        {(props.images || []).map((src, i) => (
          <figure key={i} className="overflow-hidden rounded-[6px]" style={{ background: th.card }}>
            <Image src={src} alt={(props.captions || [])[i] || `${props.title} ${i + 1}`} className="w-full" style={{ aspectRatio: '4 / 3', height: 'auto' }} />
            {(props.captions || [])[i] && (
              <figcaption style={{ ...t.small, color: th.muted, padding: '10px 12px' }}>{props.captions[i]}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

export function PricingBlock({ props, accent, surface, font }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `${PAD}` }}>
      <h2 style={{ ...t.h2, fontFamily: FONTS[font] || FONTS.serif, color: th.fg }}>{props.title}</h2>
      {props.body && <p style={{ ...t.body, color: th.muted, marginTop: 10, maxWidth: '54ch' }}>{props.body}</p>}
      <div
        className="grid"
        style={{ gap: 'clamp(12px, 2cqw, 24px)', marginTop: 'clamp(18px, 3cqw, 36px)', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))' }}
      >
        {(props.plans || []).map((plan, i) => (
          <div
            key={i}
            className="flex flex-col rounded-[6px]"
            style={{
              padding: 'clamp(16px, 2.4cqw, 26px)',
              background: th.card,
              border: `1px solid ${i === 0 ? accent : th.line}`,
            }}
          >
            <p style={{ ...t.eyebrow, color: th.muted }}>{plan.name}</p>
            <p style={{ ...t.h2, fontFamily: FONTS.serif, color: th.fg, marginTop: 8, fontSize: 'clamp(1.3rem, 2.4cqw, 1.9rem)' }}>
              {plan.price}
              {plan.period && <span style={{ ...t.small, color: th.muted, marginLeft: 6 }}>{plan.period}</span>}
            </p>
            <ul style={{ marginTop: 14, display: 'grid', gap: 8, flex: 1 }}>
              {(plan.features || []).map((f, j) => (
                <li key={j} style={{ ...t.body, color: th.muted }}>{f}</li>
              ))}
            </ul>
            <button
              type="button"
              style={{
                marginTop: 18,
                fontFamily: FONTS.sans,
                fontSize: 'clamp(0.72rem, 1cqw, 0.82rem)',
                fontWeight: 600,
                padding: '10px 16px',
                borderRadius: 999,
                background: i === 0 ? accent : 'transparent',
                color: i === 0 ? '#fff' : th.fg,
                border: i === 0 ? '1px solid transparent' : `1px solid ${th.line}`,
              }}
            >
              {plan.cta || 'Enquire'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FaqBlock({ props, surface, font }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `clamp(24px, 4cqw, 56px) ${PAD}`, background: th.soft }}>
      <h2 style={{ ...t.h2, fontFamily: FONTS[font] || FONTS.serif, color: th.fg }}>{props.title}</h2>
      <div style={{ marginTop: 'clamp(14px, 2.4cqw, 26px)', maxWidth: '72ch' }}>
        {(props.items || []).map((item, i) => (
          <div key={i} style={{ borderTop: `1px solid ${th.line}`, padding: 'clamp(11px, 1.6cqw, 18px) 0' }}>
            <h3 style={{ ...t.h3, color: th.fg }}>{item.q}</h3>
            <p style={{ ...t.body, color: th.muted, marginTop: 7 }}>{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaBlock({ props, accent, surface, font }) {
  const th = surfaceTheme(surface);
  return (
    <section style={{ padding: `${PAD}` }}>
      <div className="rounded-[8px]" style={{ background: accent, padding: 'clamp(24px, 5cqw, 60px)', color: '#fff' }}>
        <h2 style={{ ...t.h2, fontFamily: FONTS[font] || FONTS.serif, maxWidth: '30ch' }}>{props.title}</h2>
        {props.body && <p style={{ ...t.lead, opacity: 0.86, marginTop: 12, maxWidth: '52ch' }}>{props.body}</p>}
        <div className="flex flex-wrap items-center" style={{ gap: 14, marginTop: 'clamp(18px, 3cqw, 30px)' }}>
          <span
            className="inline-flex items-center rounded-full"
            style={{
              background: '#fff',
              color: accent,
              fontFamily: FONTS.sans,
              fontSize: 'clamp(0.75rem, 1.05cqw, 0.86rem)',
              fontWeight: 700,
              padding: 'clamp(10px, 1.5cqw, 14px) clamp(18px, 2.6cqw, 28px)',
            }}
          >
            {props.cta || 'Get in touch'}
          </span>
          {props.note && <span style={{ ...t.small, opacity: 0.8 }}>{props.note}</span>}
        </div>
      </div>
    </section>
  );
}

export function ContactBlock({ props, accent, surface, font }) {
  const th = surfaceTheme(surface);
  const field = {
    width: '100%',
    background: th.card,
    border: `1px solid ${th.line}`,
    borderRadius: 4,
    padding: '11px 13px',
    fontFamily: FONTS.sans,
    fontSize: 'clamp(0.78rem, 1.05cqw, 0.88rem)',
    color: th.fg,
    outline: 'none',
  };
  return (
    <section style={{ padding: `${PAD}` }}>
      <div className="flex flex-wrap" style={{ gap: GAP }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <h2 style={{ ...t.h2, fontFamily: FONTS[font] || FONTS.serif, color: th.fg }}>{props.title}</h2>
          {props.body && <p style={{ ...t.body, color: th.muted, marginTop: 12, maxWidth: '42ch' }}>{props.body}</p>}
          <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
            {props.phone && (
              <p className="flex items-center gap-2" style={{ ...t.body, color: th.fg }}>
                <Phone size={15} style={{ color: accent }} /> {props.phone}
              </p>
            )}
            {props.email && (
              <p className="flex items-center gap-2" style={{ ...t.body, color: th.fg }}>
                <Mail size={15} style={{ color: accent }} /> {props.email}
              </p>
            )}
          </div>
        </div>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'grid', gap: 10, background: th.soft, padding: 'clamp(16px, 2.4cqw, 26px)', borderRadius: 6 }}
          >
            <input style={field} placeholder="Name" aria-label="Name" />
            <input style={field} placeholder="Email" aria-label="Email" />
            <textarea
              style={{ ...field, minHeight: 92, resize: 'vertical' }}
              placeholder={props.placeholder || 'What do you need?'}
              aria-label="Message"
            />
            <button
              type="submit"
              style={{
                background: accent,
                color: '#fff',
                borderRadius: 999,
                padding: '11px 18px',
                fontFamily: FONTS.sans,
                fontSize: 'clamp(0.74rem, 1.02cqw, 0.84rem)',
                fontWeight: 600,
              }}
            >
              {props.cta || 'Send enquiry'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function FooterBlock({ props, surface }) {
  const th = surfaceTheme(surface);
  return (
    <footer style={{ padding: `clamp(16px, 2.6cqw, 30px) ${PAD}`, background: th.bg, borderTop: `1px solid ${th.line}` }}>
      <div className="flex flex-wrap items-center justify-between" style={{ gap: 12 }}>
        <p style={{ ...t.small, color: th.fg, fontFamily: FONTS.serif, fontSize: 'clamp(0.8rem, 1.1cqw, 0.92rem)' }}>
          {props.brand}
        </p>
        <div className="flex flex-wrap" style={{ gap: 16 }}>
          {(props.links || []).map((link, i) => (
            <span key={i} style={{ ...t.small, color: th.muted }}>{link}</span>
          ))}
        </div>
      </div>
      <p style={{ ...t.small, color: th.muted, marginTop: 10, fontSize: 'clamp(0.62rem, 0.85cqw, 0.72rem)' }}>{props.note}</p>
    </footer>
  );
}