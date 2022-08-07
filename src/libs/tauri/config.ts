import { invoke } from '@tauri-apps/api';
import { LogicalPosition, LogicalSize, PhysicalSize, getAll } from '@tauri-apps/api/window';
import { isTauriApp } from '.';

type Size = LogicalSize | PhysicalSize;
type Icon = string | Uint8Array;

interface TauriInit {
  /** The window title. */
  title?: string;

  /** Resizes the window. */
  size?: Size;

  /** Sets the window min size. If the `size` argument is not provided, the min size is unset. */
  minSize?: Size;

  /** Sets the window max size. If the `size` argument is undefined, the max size is unset. */
  maxSize?: Size;

  /**
   * Updates the window resizable flag.
   *
   * @default true
   */
  resizable?: boolean;

  /** Sets the window position. */
  position?: LogicalPosition;

  /**
   * Sets the window fullscreen state.
   *
   * @default false
   */
  fullscren?: boolean;

  /**
   * Show icon in taskbar
   *
   * @default true
   */
  taskbarIcon?: boolean;

  /**
   * Whether the window should always be on top of other windows.
   *
   * @default false
   */
  alwaysOnTop?: boolean;

  /**
   * Whether the window should have borders and bars.
   *
   * @default true
   */
  decoration?: boolean;

  /**
   * Centers the window.
   *
   * @default true
   */
  center?: boolean;

  /** Sets the window icon. */
  icon?: Icon;

  /**
   * Indicate if app has splashscreen
   * @default false
   */
  hasSplashscreen?: boolean;
}

export async function setupTauri(options: TauriInit, window?: string): Promise<void> {
  if (!isTauriApp()) return;

  const main = getAll().find(w => w.label === window || 'main');
  if (!main) return;

  options.title && main.setTitle(options.title);
  options.size && main.setSize(options.size);
  options.minSize && main.setMinSize(options.minSize);
  options.maxSize && main.setMaxSize(options.maxSize);
  options.position && main.setPosition(options.position);
  options.icon && main.setIcon(options.icon);

  options.fullscren ??= false;
  main.setFullscreen(options.fullscren);

  options.resizable ??= true;
  main.setResizable(options.resizable);

  options.center ??= true;
  options.center && main.center();

  options.taskbarIcon ??= true;
  main.setSkipTaskbar(!options.taskbarIcon);

  options.alwaysOnTop ??= false;
  main.setAlwaysOnTop(options.alwaysOnTop);

  options.decoration ??= true;
  main.setDecorations(options.decoration);

  options.hasSplashscreen ??= false;
  if (options.hasSplashscreen && main.label === 'main') await invoke('close_splashscreen');
}
