import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  DEFAULT_SETTINGS,
  clampSettings,
  defaultState,
  normaliseState,
  applyAppraisal,
  applyStimulus,
  buildPrompt,
  deriveMood,
  trimReply,
  STIMULI,
  DELTA_SCHEMA,
} from '../../shared/emotion.ts';

const HISTORY_CAP = 60;

// Eden's emotional core: one profile per operator holding her full settings surface, the live
// state vector, and the turns she remembers. Everything here is hers — the appraisal moves her
// state, the state colours what she says.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ ok: false, error: 'Eden’s mind is admin-only.' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === 'string' ? body.action : 'state';

    const page = await base44.entities.EmotionProfile.filter({}, { sort: '-created_date', limit: 1 });
    let profile = (page.items || [])[0] || null;
    if (!profile) {
      profile = await base44.entities.EmotionProfile.create({
        display_name: DEFAULT_SETTINGS.display_name,
        settings: DEFAULT_SETTINGS,
        state: defaultState(DEFAULT_SETTINGS),
        turns: 0,
        history: [],
        note: 'Emotional core',
      });
    }

    let settings = clampSettings(profile.settings || {});
    let state = profile.settings ? normaliseState(profile.state, settings) : defaultState(settings);
    const history = Array.isArray(profile.history) ? profile.history : [];

    const view = () => ({
      ok: true,
      profile_id: profile.id,
      display_name: settings.display_name,
      settings,
      state,
      mood: deriveMood(state, settings),
      turns: Number(profile.turns) || 0,
      history: history.slice(-24),
      stimuli: Object.keys(STIMULI),
    });

    if (action === 'state') {
      return Response.json({ ...view(), defaults: DEFAULT_SETTINGS });
    }

    if (action === 'save') {
      const next = clampSettings(body.settings);
      settings = next;
      const patch = { settings: next, display_name: next.display_name };
      if (body.reset_state === true) {
        state = defaultState(next);
        patch.state = state;
        patch.turns = 0;
        patch.history = [];
      }
      profile = await base44.entities.EmotionProfile.update(profile.id, patch);
      return Response.json({ ...view(), ok: true });
    }

    if (action === 'reset') {
      state = defaultState(settings);
      profile = await base44.entities.EmotionProfile.update(profile.id, {
        state,
        turns: 0,
        history: [],
        note: 'Emotional core reset',
      });
      return Response.json({ ...view(), ok: true, reset: true });
    }

    if (action === 'stimulus') {
      const label = String(body.label || '').trim();
      const result = applyStimulus(state, label, body.intensity, settings);
      if (!result.applied) {
        return Response.json({ ok: false, error: `Unknown stimulus "${label}".` }, { status: 400 });
      }
      state = result.state;
      profile = await base44.entities.EmotionProfile.update(profile.id, { state });
      return Response.json({ ...view(), ok: true, stimulated: label });
    }

    if (action !== 'respond') {
      return Response.json({ ok: false, error: `Unknown action "${action}".` }, { status: 400 });
    }

    const text = String(body.text || '').trim().slice(0, 2000);
    if (!text) {
      return Response.json({
        ...view(),
        ok: true,
        idle: true,
        reply: settings.idle_prompt || settings.greeting,
      });
    }

    if (settings.turn_limit > 0 && (Number(profile.turns) || 0) >= settings.turn_limit) {
      return Response.json({ ok: false, error: `Her turn limit of ${settings.turn_limit} is reached.` }, { status: 400 });
    }

    const mood = deriveMood(state, settings);
    const prompt = buildPrompt({ settings, state, mood, history, text });
    const useWeb = settings.web_context === true;
    const model = useWeb
      ? 'gemini_3_8_flash'
      : settings.model && settings.model !== 'automatic'
        ? settings.model
        : undefined;

    const ask = (chosen) =>
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        ...(chosen ? { model: chosen } : {}),
        ...(useWeb ? { add_context_from_internet: true } : {}),
        response_json_schema: DELTA_SCHEMA,
      });

    let raw;
    try {
      raw = await ask(model);
    } catch (error) {
      if (!model) throw error;
      // An explicit model the account cannot reach should not take her mind down with it.
      raw = await ask(undefined);
    }

    const appraisal = raw && typeof raw === 'object' ? raw : { reply: String(raw || '') };
    const reply = trimReply(appraisal.reply, settings);
    if (!reply) return Response.json({ ok: false, error: 'She returned nothing.' }, { status: 502 });

    state = applyAppraisal(state, appraisal.deltas, settings);
    const nextMood = deriveMood(state, settings);
    const turns = (Number(profile.turns) || 0) + 1;

    const nextHistory = settings.log_turns
      ? [
          ...history,
          { at: new Date().toISOString(), role: 'user', text },
          {
            at: new Date().toISOString(),
            role: 'eden',
            text: reply,
            mood: nextMood,
            valence: state.valence,
            arousal: state.arousal,
            dominance: state.dominance,
          },
        ].slice(-HISTORY_CAP)
      : history;

    profile = await base44.entities.EmotionProfile.update(profile.id, {
      ...(settings.persist_state ? { state } : {}),
      turns,
      ...(settings.log_turns ? { history: nextHistory } : {}),
    });

    return Response.json({
      ...view(),
      ok: true,
      mood: nextMood,
      her_word: typeof appraisal.mood === 'string' ? appraisal.mood : '',
      inner: settings.show_reasoning && typeof appraisal.inner === 'string' ? appraisal.inner : '',
      reply,
      appraisal: appraisal.deltas || {},
      delivery: {
        voice_id: settings.voice_id,
        style: settings.delivery_style,
        speed: settings.speed,
        pitch: settings.pitch,
        energy: settings.delivery_energy,
        speak: settings.speech_enabled === true,
      },
      turns,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || 'Her mind failed.' }, { status: 500 });
  }
}