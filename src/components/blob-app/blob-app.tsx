import { modalController, toastController } from '@ionic/core';
import { Component, ComponentInterface, h, Host, Listen, State, Watch } from '@stencil/core';
import { app, invoke } from '@tauri-apps/api';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';

@Component({
  tag: 'blob-app',
  styleUrl: 'blob-app.scss'
})
export class BlobApp implements ComponentInterface {
  private options!: HTMLBlobOptionsElement;

  private version: string;

  private $logs: UnlistenFn;
  private $logsEnd: UnlistenFn;

  @State() isFullscreen: boolean;
  @State() logs: LogPayload[] = [];

  @Watch('isFullscreen')
  async onScreenModeChange(current: boolean): Promise<void> {
    await appWindow.setFullscreen(current);
  }

  async componentWillLoad(): Promise<void> {
    this.isFullscreen = await appWindow.isFullscreen();
    this.version = await app.getVersion();

    this.$logs = await listen<LogPayload>('logs', event => {
      if (event.payload.message.includes('@')) this.logs = [event.payload, ...this.logs];
    });
    this.$logsEnd = await listen<FFmpegPayload>('logs:end', async event => {
      if (event.payload.code === 0) {
        const toast = await toastController.create({
          message: 'Téléchargement terminé',
          color: 'success',
          position: 'top',
          duration: 5000
        });
        await toast.present();
        this.logs = [{ level: 'INFO', message: 'Téléchargement terminé' }, ...this.logs];
      } else {
        const toast = await toastController.create({
          message: 'Erreur lors du téléchargement',
          color: 'danger',
          position: 'top',
          duration: 5000
        });
        await toast.present();
        this.logs = [{ level: 'ERROR', message: 'Erreur lors du téléchargement' }];
      }
    });
  }

  disconnectedCallback(): void {
    this.$logs();
    this.$logsEnd();
  }

  @Listen('mousedown')
  async onGrab(ev: Event): Promise<void> {
    const target = ev.target as HTMLElement;
    if (target.nodeName !== 'HEADER') return;

    await appWindow.startDragging();
  }

  private async onMinimize(): Promise<void> {
    await appWindow.minimize();
  }

  private onToggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  private async onClose(): Promise<void> {
    await appWindow.close();
  }

  private async download(): Promise<void> {
    const args = await this.options.getArgs().catch(async (err: Error) => {
      const toast = await toastController.create({
        message: err.message,
        color: 'danger',
        position: 'top',
        duration: 5000
      });
      await toast.present();
    });
    if (!args) return;

    await invoke('command_ffmpeg', { args })
      .then(() =>
        toastController.create({
          message: 'Téléchargement en cours ...',
          color: 'secondary',
          position: 'top',
          duration: 5000
        })
      )
      .then(toast => toast.present())
      .catch(err => {
        this.logs = [err, ...this.logs];
      });
  }

  private clearLogs(): void {
    this.logs = [];
  }

  async closeModal(): Promise<void> {
    await modalController.getTop().then(modal => modal.dismiss());
  }

  render() {
    return (
      <Host>
        <ion-app>
          <header class='ion-justify-content-between'>
            <div class='info ion-align-items-center'>
              <ion-img src='/assets/icon/icon.png' id='app-logo' />
              <ion-text>
                <h1 id='app-title' class='ion-no-margin'>
                  Blob downloader <span>{this.version}</span>
                </h1>
              </ion-text>
            </div>
            <div class='actions ion-justify-content-between ion-align-items-center'>
              <ion-button fill='clear' class='action ion-no-margin' onClick={() => this.onMinimize()}>
                <ion-icon name='remove-outline' slot='icon-only' />
              </ion-button>
              <ion-button fill='clear' class='action ion-no-margin' onClick={() => this.onToggleFullscreen()}>
                <ion-icon name={this.isFullscreen ? 'contract-outline' : 'expand-outline'} slot='icon-only' />
              </ion-button>
              <ion-button fill='clear' class='action ion-no-margin' onClick={() => this.onClose()}>
                <ion-icon name='close-outline' slot='icon-only' />
              </ion-button>
            </div>
          </header>

          <main>
            <ion-content color='primary' class='ion-padding'>
              <div class='app-content'>
                <div class='app-content__header ion-justify-content-end ion-align-items-center'>
                  <ion-button fill='clear' color='tertiary' id='logs-button' class='ion-no-margin' title='Logs'>
                    <ion-label>Logs</ion-label>
                    <ion-icon name='reader-outline' slot='end' />
                  </ion-button>
                </div>
                <blob-options ref={ref => (this.options = ref)} />
              </div>
            </ion-content>
          </main>

          <footer class='ion-justify-content-center ion-align-items-center'>
            <ion-button type='submit' color='tertiary' onClick={() => this.download()}>
              Télécharger
            </ion-button>
          </footer>

          <ion-modal trigger='logs-button'>
            <ion-content>
              <div class='logs-content'>
                <header class='ion-justify-content-between ion-align-items-center'>
                  <ion-text color='light'>Logs</ion-text>
                  <div class='actions'>
                    <ion-button fill='clear' class='action ion-no-margin' onClick={() => this.clearLogs()}>
                      <ion-icon name='trash-outline' slot='icon-only' />
                    </ion-button>
                    <ion-button fill='clear' class='action ion-no-margin' onClick={() => this.closeModal()}>
                      <ion-icon name='close-outline' slot='icon-only' />
                    </ion-button>
                  </div>
                </header>
                <div>
                  {this.logs.map(log => (
                    <ion-text>
                      <p class='ion-no-margin'>
                        [{log.level}] : {log.message}
                      </p>
                    </ion-text>
                  ))}
                </div>
              </div>
            </ion-content>
          </ion-modal>
        </ion-app>
      </Host>
    );
  }
}
