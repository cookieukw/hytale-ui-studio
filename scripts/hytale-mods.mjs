#!/usr/bin/env node
/**
 * Carries .ui modifications across Hytale updates.
 *
 * Every update ships a pristine copy of Client/Data/Game/Interface and wipes
 * local edits. Copying old files back is not safe: the update may have changed
 * the same file. That already happened once — WorldTile.ui gained a new
 * `#HardcoreOverlay` element, and pasting the old version would have deleted
 * it. Removing an element the C# side looks up by ID crashes the client with
 * KeyNotFoundException.
 *
 * So this tool does a three-way merge instead of a copy:
 *
 *   base   the file as the game shipped it, before any edit
 *   mine   the file after your edits
 *   theirs the file as the new update ships it
 *
 * Clean merges are written out; real conflicts are left with markers for you
 * to resolve by hand.
 *
 * Nothing from Hypixel is committed: the store lives in .hytale-backup/, which
 * is gitignored.
 *
 * Usage:
 *   node scripts/hytale-mods.mjs init   <interfaceDir>   right after an update, before editing
 *   node scripts/hytale-mods.mjs status <interfaceDir>   list what you changed
 *   node scripts/hytale-mods.mjs save   <interfaceDir>   store your edits
 *   node scripts/hytale-mods.mjs apply  <interfaceDir>   merge them onto a fresh install
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  mkdirSync,
  existsSync,
  rmSync,
  cpSync,
} from "fs";
import { join, dirname, relative, resolve } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { tmpdir } from "os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STORE = join(ROOT, ".hytale-backup", "mods");
const BASE = join(STORE, "base");
const MINE = join(STORE, "mine");

const listUi = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? listUi(p) : p.endsWith(".ui") ? [p] : [];
  });

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

function write(p, content) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

/** Files that differ between the live install and the recorded baseline. */
function changedFiles(interfaceDir) {
  return listUi(interfaceDir)
    .map((abs) => relative(interfaceDir, abs))
    .filter((rel) => {
      const base = read(join(BASE, rel));
      return base !== null && base !== read(join(interfaceDir, rel));
    });
}

function requireBaseline() {
  if (!existsSync(BASE)) {
    console.error("No baseline recorded yet. Run `init` first.");
    process.exit(1);
  }
}

function cmdInit(dir) {
  if (existsSync(BASE)) rmSync(BASE, { recursive: true });
  mkdirSync(BASE, { recursive: true });
  let n = 0;
  for (const abs of listUi(dir)) {
    write(join(BASE, relative(dir, abs)), readFileSync(abs, "utf8"));
    n++;
  }
  console.log(`Baseline recorded: ${n} .ui files.`);
  console.log("Edit freely, then run `save`.");
}

function cmdStatus(dir) {
  requireBaseline();
  const changed = changedFiles(dir);
  if (!changed.length) return console.log("No differences from the baseline.");
  console.log(`${changed.length} modified file(s):`);
  changed.forEach((f) => console.log("  " + f));
}

function cmdSave(dir) {
  requireBaseline();
  const changed = changedFiles(dir);
  if (existsSync(MINE)) rmSync(MINE, { recursive: true });
  for (const rel of changed) {
    write(join(MINE, rel), readFileSync(join(dir, rel), "utf8"));
  }
  console.log(`Saved ${changed.length} modified file(s) to ${relative(ROOT, MINE)}.`);
}

function cmdApply(dir) {
  requireBaseline();
  if (!existsSync(MINE)) {
    console.error("Nothing saved yet. Run `save` first.");
    process.exit(1);
  }

  const mods = listUi(MINE).map((abs) => relative(MINE, abs));
  const clean = [];
  const conflicted = [];
  const identical = [];
  const missing = [];

  for (const rel of mods) {
    const target = join(dir, rel);
    if (!existsSync(target)) {
      missing.push(rel);
      continue;
    }

    const mine = read(join(MINE, rel));
    const base = read(join(BASE, rel));
    const theirs = read(target);

    if (theirs === mine) {
      identical.push(rel);
      continue;
    }

    // Upstream did not touch this file: a straight copy is safe.
    if (theirs === base) {
      write(target, mine);
      clean.push(rel + "  (upstream unchanged)");
      continue;
    }

    // Both sides changed it — three-way merge.
    const tmp = join(tmpdir(), `hymods-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(tmp, { recursive: true });
    const fMine = join(tmp, "mine");
    const fBase = join(tmp, "base");
    const fTheirs = join(tmp, "theirs");
    writeFileSync(fMine, mine);
    writeFileSync(fBase, base);
    writeFileSync(fTheirs, theirs);

    let merged;
    let ok = true;
    try {
      merged = execFileSync(
        "git",
        ["merge-file", "-p", "-L", "yours", "-L", "original", "-L", "update", fMine, fBase, fTheirs],
        { encoding: "utf8" },
      );
    } catch (e) {
      // Non-zero exit means conflicts; stdout still holds the merged text.
      merged = e.stdout ?? "";
      ok = false;
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }

    write(target, merged);
    (ok ? clean : conflicted).push(rel + (ok ? "  (merged with update)" : ""));
  }

  const report = (label, list) => {
    if (!list.length) return;
    console.log(`\n${label}: ${list.length}`);
    list.forEach((f) => console.log("  " + f));
  };

  report("Applied", clean);
  report("Already up to date", identical);
  report("CONFLICTS — resolve the <<<<<<< markers by hand", conflicted);
  report("Not found in this install (file was removed upstream?)", missing);

  console.log(
    conflicted.length
      ? `\n${conflicted.length} file(s) need manual review, then re-run the linter.`
      : "\nAll modifications applied. Run scripts/ui-lint.mjs before launching.",
  );
}

const [cmd, dir] = process.argv.slice(2);
if (!cmd || !dir) {
  console.log(
    [
      "Usage:",
      "  node scripts/hytale-mods.mjs init   <interfaceDir>   snapshot a pristine install",
      "  node scripts/hytale-mods.mjs status <interfaceDir>   list what you changed",
      "  node scripts/hytale-mods.mjs save   <interfaceDir>   store your edits",
      "  node scripts/hytale-mods.mjs apply  <interfaceDir>   merge them onto a fresh install",
    ].join("\n"),
  );
  process.exit(1);
}

const target = resolve(dir);
if (!existsSync(target)) {
  console.error(`Directory not found: ${target}`);
  process.exit(1);
}

const commands = { init: cmdInit, status: cmdStatus, save: cmdSave, apply: cmdApply };
const fn = commands[cmd];
if (!fn) {
  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}
fn(target);
