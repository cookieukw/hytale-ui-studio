export const isTauri = () => {
  return typeof window !== 'undefined' && window !== undefined && (window as any).__TAURI_INTERNALS__ !== undefined;
};
