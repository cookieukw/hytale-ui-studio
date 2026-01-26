"use client";

import { useEffect } from "react";
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

export function DragDropPolyfill() {
  useEffect(() => {
    // Initialize the polyfill
    polyfill({
      dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
      forceApply: true,
    });

    // Cleanup is usually not necessary for this global polyfill as it attaches to window,
    // but React effects might run twice in dev mode.
    // The polyfill handles re-initialization gracefully.
  }, []);

  return null;
}
