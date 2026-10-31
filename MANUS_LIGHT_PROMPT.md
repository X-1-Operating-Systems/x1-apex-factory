# Prompt: build the Manus-style light workspace (copy and send as-is)

Use this verbatim to have the home workspace rebuilt to the reference, and validated rather than
described. It is written to be self-invoking: paste it into a new turn.

---

Rebuild the home workspace (`src/pages/Dashboard.jsx`) to match the attached Manus reference
exactly, in **light mode only**. Nothing else, nothing more.

**Theme.** Light only. App background `#FFFFFF`, surfaces `#F3F4F6`, text `#111827`, secondary text
`#6B7280`, hairline borders around `#E5E7EB`. Keep the app's existing `index.css` tokens — do not
hardcode hex values in JSX, and do not add a second palette.

**Layout, top to bottom, inside the existing sidebar shell:**
1. **Top bar** — model picker on the left; on the right a plan chip, a bordered pill button, and an
   icon with a live count.
2. **Hero** — the app's monogram at hero scale with the wordmark beneath, centred, generous padding.
3. **Three action cards** in one row (stacking below `sm`): *Build* (blue icon), *Create* (amber
   icon), and a third card tagged `Studio only` with a neutral folder icon. Each is a light surface
   with a small tinted icon tile, a title with a hover arrow, and one muted line of copy.
4. **Media row** — three equal cards, each a thumbnail strip with a large faint icon over a light
   gradient, a one-word label and a muted caption.
5. **Command bar** — the existing composer, docked below the media row: rounded, generous padding,
   placeholder `Assign a task or type / for more`, attachments and template controls bottom-left,
   circular send arrow bottom-right.
6. One muted disclaimer line beneath it.

**Behaviour (must stay working, must not be invented):**
- The command bar still creates a real task through the existing engine and lands on that task.
- *Build* and *Create* drop their starting brief into the composer focused, ready to send.
- The `Studio only` card navigates to the files library.
- The three media cards navigate to video studio, websites and artifacts.
- The top-bar count reads a real task count; the plan pill navigates to the usage screen.
- Nothing is displayed that is not a real record or a real count. No invented credit totals, no dead
  buttons, no placeholder numbers.

**Scope limits.** Sidebar, routing, backend, entities and every other page stay untouched. Projects
and recent tasks are not part of this surface — they stay reachable from the sidebar.

**Validation before saying it is done:**
1. `npx vite build` exits 0 with no unresolved imports.
2. The page renders at the 868px tablet viewport with the cards three-across and no horizontal scroll.
3. Each of the six controls above is traced through the code path it triggers (task creation, seed
   prefill, four navigations) — not assumed.
4. No hardcoded hex, no dark-mode-only classes, no `manus` branding left in copy.
5. Report the build result and anything not done, in one paragraph.