import { setupConfig } from '@ionic/core';
import { setupTauri } from '@libs/tauri/config';
import { LogicalSize } from '@tauri-apps/api/window';

export default async (): Promise<void> => {
  /**
   * The code to be executed should be placed within a default function that is
   * exported by the global script. Ensure all of the code in the global script
   * is wrapped in the function() that is exported.
   */
  setupConfig({
    mode: 'md'
  });

  await setupTauri({
    size: new LogicalSize(1200, 700),
    decoration: false
  });
};
