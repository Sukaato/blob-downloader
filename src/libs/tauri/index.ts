export function isTauriApp(): boolean {
  return !!window.__TAURI_METADATA__;
}
