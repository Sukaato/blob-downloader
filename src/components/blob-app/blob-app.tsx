import { modalController, toastController } from '@ionic/core';
import { Component, ComponentInterface, h, Host, Listen, State, Watch } from '@stencil/core';
import { event, invoke } from '@tauri-apps/api';
import { UnlistenFn } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { BlobArgs } from 'src/shared';

@Component({
  tag: 'blob-app',
  styleUrl: 'blob-app.scss'
})
export class BlobApp implements ComponentInterface {
  private form!: HTMLFormElement;

  private $logs: UnlistenFn;
  private $logsEnd: UnlistenFn;

  @State() isFullscreen: boolean;
  @State() mode: BlobMode = 'url';
  @State() logs: string[] = [];

  @Watch('isFullscreen')
  async onScreenModeChange(current: boolean): Promise<void> {
    await appWindow.setFullscreen(current);
  }

  async componentWillLoad(): Promise<void> {
    this.isFullscreen = await appWindow.isFullscreen();

    this.$logs = await event.listen<string>('logs', event => {
      this.logs = [event.payload, ...this.logs];
    });
    this.$logsEnd = await event.listen<FFmpegPayload>('logs:end', async event => {
      if (event.payload.code === 0) {
        const toast = await toastController.create({
          message: 'Téléchargement terminé',
          color: 'success',
          position: 'top',
          duration: 5000
        });
        await toast.present();
      } else {
        const toast = await toastController.create({
          message: 'Erreur lors du téléchargement',
          color: 'danger',
          position: 'top',
          duration: 5000
        });
        await toast.present();
      }
    });
  }

  disconnectedCallback(): void {
    this.$logs();
    this.$logsEnd();
  }

  @Listen('blobModeSelect')
  onModeChangge(ev: CustomEvent<BlobModeEventDetail>): void {
    this.mode = ev.detail.value;
  }

  @Listen('mousedown')
  async onGrab(ev: Event): Promise<void> {
    const target = ev.target as HTMLElement;
    if (target.nodeName !== 'HEADER') return;

    await appWindow.startDragging();
  }

  private async onMinimize(): Promise<void> {
    appWindow.minimize();
  }

  private onToggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  private async onClose(): Promise<void> {
    appWindow.close();
  }

  private async download(): Promise<void> {
    const data = new FormData(this.form);
    console.log(
      BlobArgs.builder()
        .setDownloadUrl(data.get('url') as string)
        .setOutputPath(data.get('path') as string)
        .setOutputName(data.get('name') as string)
        .setExtension(data.get('ext') as string)
        .setFps(parseInt(data.get('fps').toString()))
        .setBitRate(data.get('bitrate') as string)
        .setCodec(data.get('codec') as string)
        .toJson()
    );

    const args = await BlobArgs.builder()
      .setDownloadUrl(data.get('url') as string)
      .setOutputPath(data.get('path') as string)
      .setOutputName(data.get('name') as string)
      .setExtension(data.get('ext') as string)
      .setFps(parseInt(data.get('fps').toString()))
      .setBitRate(data.get('bitrate') as string)
      .setCodec(data.get('codec') as string)
      .build();
    await invoke('command_ffmpeg', { args }).catch(err => {
      this.logs = [err, ...this.logs];
    });

    const toast = await toastController.create({
      message: 'Téléchargement en cours ...',
      color: 'secondary',
      position: 'top',
      duration: 5000
    });
    await toast.present();
  }

  async clearLogs(): Promise<void> {
    this.logs = [];
  }

  async closeModal(): Promise<void> {
    const modal = await modalController.getTop();
    await modal.dismiss();
  }

  private get isUrlMode(): boolean {
    return this.mode === 'url';
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
                  Blob downloader
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
                <div class='app-content__header ion-justify-content-between ion-align-items-center'>
                  <blob-mode-switch />
                  <ion-button fill='clear' color='tertiary' id='logs-button' class='ion-no-margin' title='Logs'>
                    <ion-label>Logs</ion-label>
                    <ion-icon name='reader-outline' slot='end' />
                  </ion-button>
                </div>
                <form ref={ref => (this.form = ref)}>
                  {this.isUrlMode && <blob-mode-url />}
                  <blob-options />
                </form>
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
                      <p>{log}</p>
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
