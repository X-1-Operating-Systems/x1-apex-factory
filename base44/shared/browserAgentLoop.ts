import { PAGE_ACTIONS, hostRequest } from "./browserHost.ts";

/** Actions the reasoning loop may take. Screenshots and page reads are context, not steps. */
const LOOP_ACTIONS = PAGE_ACTIONS.filter((name) => !["screenshot", "url", "wait"].includes(name));

const MAX_STEPS = 30;
const STEP_BUDGET = 3;
const HISTORY_WINDOW = 8;

function clip(value, size) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return text.length <= size ? text : `${text.slice(0, size)}…`;
}

async function sessionFor(base44, run, contextId) {
  if (run.session_id) {
    const existing = await hostRequest("sessions.get", { session_id: run.session_id });
    if (existing.ok && existing.data && existing.data.status === "RUNNING") return run.session_id;
  }
  const created = await hostRequest("sessions.create", {
    timeout_seconds: 600,
    keep_alive: true,
    context_id: contextId || undefined,
  });
  if (!created.ok) throw new Error(created.error || "The browser host refused to open a session.");
  return String(created.data.id);
}

function decidePrompt(run, agent, snapshot, history, errorNote) {
  const page = snapshot || {};
  const fields = Array.isArray(page.fields) && page.fields.length
    ? page.fields.map((field) => `  - ${field.selector} [${field.type}]${field.name ? ` name=${field.name}` : ""}${field.placeholder ? ` placeholder="${field.placeholder}"` : ""}`).join("\n")
    : "  (none visible)";
  const buttons = Array.isArray(page.buttons) && page.buttons.length
    ? page.buttons.slice(0, 25).map((button) => `  - "${button.text}"${button.selector ? ` (${button.selector})` : ""}`).join("\n")
    : "  (none visible)";
  const trail = history.length
    ? history.map((step, index) => `${index + 1}. ${step.kind}: ${clip(step.text, 160)}`).join("\n")
    : "(nothing yet)";

  return `You are a browser operator working a real Chromium page through a tool API. You take exactly one step at a time and you never claim an action you did not take.

TASK
${run.task}

${agent?.system_prompt ? `AGENT INSTRUCTIONS\n${agent.system_prompt}\n` : ""}${
    errorNote ? `\nTHE PREVIOUS STEP FAILED: ${errorNote}\nAdjust and continue.\n` : ""
  }
CURRENT PAGE
url: ${page.url || "(blank)"}
title: ${page.title || "(none)"}
visible text (trimmed):
${clip(page.text || "(empty page)", 2200)}

form fields:
${fields}

clickable items:
${buttons}

STEPS SO FAR
${trail}

AVAILABLE ACTIONS
${LOOP_ACTIONS.join(", ")} — each with params: url (goto), selector or text (click, fill, type, select, wait_for, extract_text), value (fill, select), key (press), delta (scroll).

RULES
1. Choose one action and its params. Prefer a real selector from the lists above; when none exists, use click_text with the visible wording.
2. Set done=true only when the task is finished, with answer as a short plain-language result and urls as the pages that matter.
3. If the page is blank or a form is missing, call snapshot again or navigate somewhere useful — never invent a result.
4. Never repeat a step that just failed in the same way.`;
}

export async function advanceRun(base44, run, agent) {
  if (run.status !== "RUNNING") return run;

  const stepCount = Array.isArray(run.steps) ? run.steps.length : 0;
  if (stepCount >= MAX_STEPS) {
    return base44.entities.BrowserRun.update(run.id, {
      status: "STOPPED",
      error: `Stopped after ${MAX_STEPS} steps without finishing.`,
      ended_at: new Date().toISOString(),
    });
  }

  let record = run;
  let sessionId;
  try {
    sessionId = await sessionFor(base44, run);
  } catch (error) {
    return base44.entities.BrowserRun.update(run.id, {
      status: "FAILED",
      error: String(error.message).slice(0, 400),
      ended_at: new Date().toISOString(),
    });
  }

  let errorNote = null;
  for (let index = 0; index < STEP_BUDGET; index += 1) {
    const current = await base44.entities.BrowserRun.get(run.id);
    const steps = Array.isArray(current.steps) ? current.steps : [];
    const snapshotResponse = await hostRequest("sessions.act", { session_id: sessionId, page_action: "snapshot" });
    if (!snapshotResponse.ok) {
      return base44.entities.BrowserRun.update(run.id, {
        status: "FAILED",
        session_id: sessionId,
        error: snapshotResponse.error || "The page could not be read.",
        ended_at: new Date().toISOString(),
      });
    }

    const snapshot = (snapshotResponse.data && snapshotResponse.data.result) || {};
    const decision = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: decidePrompt(current, agent, snapshot, steps.slice(-HISTORY_WINDOW), errorNote),
      response_json_schema: {
        type: "object",
        properties: {
          thought: { type: "string" },
          action: { type: "string" },
          params: { type: "object" },
          done: { type: "boolean" },
          answer: { type: "string" },
          urls: { type: "array", items: { type: "string" } },
        },
        required: ["thought", "action", "params", "done", "answer", "urls"],
        additionalProperties: false,
      },
    });

    const at = new Date().toISOString();
    if (decision?.done) {
      const answer = String(decision.answer || "Done.").slice(0, 1500);
      return base44.entities.BrowserRun.update(run.id, {
        status: "COMPLETED",
        session_id: sessionId,
        output: { answer, urls: Array.isArray(decision.urls) ? decision.urls.slice(0, 10) : [] },
        urls: Array.isArray(decision.urls) ? decision.urls.slice(0, 10) : [],
        steps: [...steps, { at, kind: "done", text: answer }],
        ended_at: at,
      });
    }

    const action = String(decision?.action || "");
    const params = decision?.params && typeof decision.params === "object" ? decision.params : {};
    if (!LOOP_ACTIONS.includes(action)) {
      errorNote = `"${action}" is not an available action.`;
      record = await base44.entities.BrowserRun.update(run.id, {
        steps: [...steps, { at, kind: "error", text: errorNote }],
      });
      continue;
    }

    const ran = await hostRequest("sessions.act", { session_id: sessionId, page_action: action, ...params });
    const summary = `${action} ${clip(params, 160)}`;
    errorNote = ran.ok ? null : ran.error;
    record = await base44.entities.BrowserRun.update(run.id, {
      session_id: sessionId,
      steps: [
        ...steps,
        {
          at,
          kind: ran.ok ? action : "error",
          text: ran.ok ? `${decision.thought ? `${clip(decision.thought, 220)} — ` : ""}${summary}` : `${summary} failed: ${ran.error}`,
        },
      ],
    });
  }

  return record;
}