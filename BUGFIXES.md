# Bug Fixes & Refactoring Log

A historical record of all bugs, redundancies, and code quality issues identified and fixed in this codebase.

---

## Session — 2026-05-26

### Rendering & Layout (`rendered-component.tsx`)

#### 🐛 BUG — Click events never bubbled to parent Button
**Severity:** High  
**File:** `components/editor/rendered-component.tsx`

`e.stopPropagation()` was called unconditionally at the top of `handleClick`, before the `isLockedInParent` guard. This meant that when clicking a child element locked inside a Button, the `stopPropagation` already fired — so the parent Button never received the click event. The fix moves `e.stopPropagation()` to after the `isLockedInParent` check, allowing locked children to correctly bubble clicks to their parent.

---

#### 🐛 BUG — Elements in `isCollapsingStackAbsolute` mode had no width
**Severity:** Medium  
**File:** `components/editor/rendered-component.tsx`

Elements inside a stacking layout that used absolute-style anchors received `position: "absolute"` but were excluded from the fallback `width: "100%"` rule by the guard `style.position !== "absolute"`. This caused such elements to render with zero width (collapsed). The fix adds an explicit `width: "auto"` fallback inside the `isCollapsingStackAbsolute` branch.

---

#### 🐛 BUG — Layout gap overridden by explicit `margin` property
**Severity:** Medium  
**File:** `components/editor/rendered-component.tsx`

The "gap via opposite-edge anchor" logic (which translates `anchor.bottom` in a `MiddleCenter` parent into `marginBottom`) ran before the explicit `margin` property block. When both were present on the same element, the `margin` block silently overwrote the layout gap, breaking the spacing. The fix reorders the sections so that gap runs last and takes precedence: **Padding → Margin → Gap**.

---

#### 🐛 BUG — `DropdownEntry` children filtered twice in the same render
**Severity:** Low  
**File:** `components/editor/rendered-component.tsx`

Inside the `Dropdown`/`DropdownBox` render case, the component's children were filtered for `DropdownEntry` twice: once to extract text labels (as `childOptions`), and again inside the JSX to build the rendered list. The fix introduces a single `dropdownEntries` variable filtered once, reused in both places.

---

### Code Generation & Parsing (`tree-utils.ts`, `hytale-parser.ts`)

#### 🐛 BUG — 8-digit hex colors (`#RRGGBBAA`) lost alpha on export
**Severity:** High  
**File:** `lib/tree-utils.ts`

`formatHytaleColor` only handled 3-digit (`#RGB`) and 6-digit (`#RRGGBB`) hex strings. When a color like `Background: #00000099` was parsed, it was stored as the string `"#00000099"`. On re-export via `componentsToCode`, `formatHytaleColor` passed through only 6 digits, silently dropping the alpha channel. The fix adds an 8-digit branch that passes `#RRGGBBAA` through as-is.

---

#### 🐛 BUG — Dropdown `Style` fell through to `textStyle` parsing
**Severity:** Medium  
**File:** `lib/hytale-parser.ts`

In the `Style` property handler, when a `Dropdown`/`DropdownBox` element was detected, its style was assigned to `dropdownStyle` but there was no `continue` statement. Execution fell through to the `textStyle` parsing block, causing Dropdown style properties to also pollute the element's `textStyle`. The fix adds a `continue` immediately after `dropdownStyle` is assigned.

---

#### 🔁 REDUNDANCY — `generateId()` defined in two separate files
**Files:** `lib/hytale-parser.ts`, `lib/tree-utils.ts`

Both files defined an identical `generateId()` function. The parser's local copy was removed and replaced with an import from `tree-utils`, making it the single source of truth.

---

#### 🔁 REDUNDANCY — Triple-duplicated comment block in parser
**File:** `lib/hytale-parser.ts`

Three consecutive identical comment lines (`// Dropdown Style Implementation` / `// Merge base text styles...`) were copy-pasted by accident. The duplicates were removed.

---

### State Management — Components (`lib/store/component-slice.ts`)

#### 🐛 BUG — `refreshDefinitions` mutated Zustand state directly
**Severity:** High  
**File:** `lib/store/component-slice.ts`

`refreshDefinitions` used `[...state.components]` (shallow copy) and then wrote directly to child object properties (`comp.alias = ...`). Since the shallow copy doesn't deep-clone nested objects, this mutated the live Zustand state outside of `set()`. React could not detect the change in nested components, causing silent UI desync. The fix rewrites the function using `.map()` to produce new immutable objects at every level, only creating new references when something actually changes.

---

### State Management — History (`lib/store/history-slice.ts`, `lib/hytale-types.ts`)

#### 🐛 BUG — Undo/Redo did not restore `imports`, only `components`
**Severity:** High  
**Files:** `lib/store/history-slice.ts`, `lib/hytale-types.ts`

The history stack stored only `HytaleComponent[]` arrays. When a user added an import statement and then pressed Undo, the components were correctly rolled back but the imports remained in the newer state — creating a silent inconsistency between the component tree and the import block.

The fix introduces a `HistoryEntry` interface:
```ts
interface HistoryEntry {
  components: HytaleComponent[];
  imports: string[];
}
```
`EditorState.history` is now `HistoryEntry[]`. `saveToHistory`, `undo`, and `redo` all operate on both fields together.

---

### State Management — Projects & Files (`lib/store/project-slice.ts`, `lib/store/file-slice.ts`)

#### 🐛 BUG — `duplicateProject` copied component IDs without regenerating them
**Severity:** High  
**File:** `lib/store/project-slice.ts`

`duplicateProject` used `...project` (shallow spread), sharing the same `files` array reference and all the same `HytaleComponent.id` values across both the original and the copy. Any `updateComponent` or `removeComponent` call that searched by ID could accidentally target components in the wrong project. The fix deep-clones all files with new IDs and runs `regenerateIds` on every component tree, while correctly remapping `activeFileId` to the new file.

---

#### 🐛 BUG — `duplicateFile` copied component IDs without regenerating them
**Severity:** Medium  
**File:** `lib/store/file-slice.ts`

Same issue as `duplicateProject`: the cloned file shared all `HytaleComponent.id` values with the original. Within the same project, `findComponentById` operations could resolve to the wrong file's component. The fix applies `regenerateIds` to every root component of the duplicated file.

---

#### 🐛 BUG — ZIP import resolved files in non-deterministic order
**Severity:** Medium  
**File:** `lib/store/project-slice.ts`

`importProject` used `zip.forEach` with an array of `Promise<void>` values collected via `.push()` inside async `.then()` callbacks. Because the promises resolved in unpredictable order, the final `files` array was shuffled relative to the original ZIP structure. The first file opened (`files[0]`) could be any file in the archive. The fix collects entries synchronously first, then resolves them with `Promise.all` on an ordered array — guaranteeing ZIP entry order is preserved.

---

#### 🐛 BUG — Session restored with empty editor on page reload
**Severity:** Critical  
**File:** `lib/editor-store.ts`

The Zustand `persist` middleware's `partialize` function saved `projects` (including all files and components) but did not persist `components`, `imports`, or `code` directly (since they are derived working state). On page reload, the store was hydrated with projects intact, but `state.components` remained `[]` — showing a blank editor even though the project data was present.

The fix adds an `onRehydrateStorage` callback that runs immediately after hydration:
```ts
onRehydrateStorage: () => (state) => {
  // Restore components, imports, history, and code from the active file
}
```
This repopulates all working state from the persisted project tree so the editor is immediately ready.

---

#### 🐛 BUG — History initializations across slices used wrong format
**Severity:** Medium  
**Files:** `lib/store/project-slice.ts`, `lib/store/file-slice.ts`

After introducing `HistoryEntry`, all locations that previously initialized history as `[[]]` or `[file.components]` were updated to `[{ components: [], imports: [] }]` and `[{ components: file.components, imports: file.imports }]` respectively. Affected operations: `createProject`, `switchProject`, `deleteProject`, `exitProject`, `importProject`, `createFile`, `switchFile`, `deleteFile`.

---

### Performance & Code Quality

#### ⚡ PERF — `componentsToCode` dynamic-imported inside `exportProject`
**File:** `lib/store/project-slice.ts`

`componentsToCode` was imported via `await import("../tree-utils")` inside `exportProject`. Since `tree-utils` is a synchronous utility already imported elsewhere in the bundle, the dynamic import added unnecessary microtask overhead on every export. Changed to a static import at the top of the file.

---

#### 🔁 REDUNDANCY — `isTauri()` dynamic-imported on every click in FileExplorer
**File:** `components/editor/file-explorer.tsx`

`isTauri` was dynamically imported inside the click handler for the "Import file" button, adding a module resolution round-trip on every user interaction. Since `tauri-utils` is a tiny, synchronous helper, it was moved to a static import at the top of the file.

---

#### 🔁 REDUNDANCY — `handleExportZip` was a one-line wrapper with no added value
**File:** `components/editor/toolbar.tsx`

```ts
const handleExportZip = () => {
  exportProject();
};
```
This function existed only to wrap a direct `exportProject()` call. The wrapper was removed and `exportProject` is now passed directly to `onClick`.

---

#### 🐛 BUG (pre-existing TS) — `disabled` prop typed incorrectly in `AnchorFields`
**File:** `components/editor/inspector/anchor-fields.tsx`

Four `DebouncedInput` components received `disabled={disabled || isStackLayout}` where both operands could evaluate to `"" | null | false | boolean`. The `disabled` prop expects `boolean | undefined`, so `null` and `""` were type errors. Fixed with `!!` coercion: `disabled={!!disabled || !!isStackLayout}`.
