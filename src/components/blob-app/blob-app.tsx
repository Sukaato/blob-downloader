import { toastController } from '@ionic/core';
import { Component, h, Host, Listen, State, Watch } from '@stencil/core';
import { invoke } from '@tauri-apps/api';
import { downloadDir } from '@tauri-apps/api/path';
import { Command } from '@tauri-apps/api/shell';
import { appWindow } from '@tauri-apps/api/window';

@Component({
  tag: 'blob-app',
  styleUrl: 'blob-app.scss'
})
export class BlobApp implements ComponentInterface {
  private form!: HTMLFormElement;

  @State() isFullscreen: boolean;
  @State() mode: BlobMode = 'url';

  @Watch('isFullscreen')
  async onScreenModeChange(current: boolean): Promise<void> {
    await appWindow.setFullscreen(current);
  }

  async componentWillLoad(): Promise<void> {
    this.isFullscreen = await appWindow.isFullscreen();
  @Listen('blobModeSelect')
  onModeChangge(ev: CustomEvent<BlobModeEventDetail>): void {
    this.mode = ev.detail.value;
  }
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

  private async onPressButton(): Promise<void> {
    const data = new FormData(this.form);
    const options: FFMPEGOptions = {
      url: ''
    }
  
    if (this.isUrlMode) {
      const url = data.get('url') as string;
      if (!url) return;
      options.url = url;
    }

    console.log(options);


    const toast = await toastController.create({
      message: 'Téléchargement en cours ...',
      color: 'secondary',
      position: 'top',
      duration: 5000
    });
    await toast.present();
  }

  private get isUrlMode(): boolean {
    return this.mode === 'url';
  }

  render() {
    return (
      <Host>
        <ion-app>
          <header class='ion-justify-content-between' >
            <div class='info ion-align-items-center'>
            <ion-img src='/assets/icon/icon.png' id='app-logo' />
            <ion-text>
              <h1 id='app-title' class='ion-no-margin'>Blob downloader</h1>
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
                    <ion-icon name='reader-outline' slot='end'/>
                  </ion-button>
                </div>
                <form ref={ref => this.form = ref}>
                  {this.isUrlMode && <blob-mode-url />}
                  <blob-options />
                </form>
              </div>
            </ion-content>
          </main>
          <footer class='ion-justify-content-center ion-align-items-center'>
            <ion-button type='submit' color='tertiary' onClick={() => this.download()}>Télécharger</ion-button>
        </footer>
      </Host>
    );
  }

}
