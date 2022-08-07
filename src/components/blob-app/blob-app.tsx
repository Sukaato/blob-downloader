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
export class BlobApp {
  private form!: HTMLFormElement;

  @State() isFullscreen: boolean;
  @State() mode: BlobMode = 'url';

  @Watch('isFullscreen')
  async onScreenModeChange(current: boolean): Promise<void> {
    await appWindow.setFullscreen(current);
  }

  async componentWillLoad(): Promise<void> {
    this.isFullscreen = await appWindow.isFullscreen();
  }

  @Listen('mousedown')
  async onGrab(ev: Event): Promise<void> {
    const target = ev.target as HTMLElement;
    if (target.nodeName !== 'HEADER') return;

    await appWindow.startDragging();
  }

  private async onReduce(): Promise<void> {
    await invoke('command_reduce');
  }

  private onToggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  private async onClose(): Promise<void> {
    await invoke('command_close');
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
    await invoke('command_ffmpeg', {
      args: [
        '-y',
        `-i`,
        options.url,
        '-c:v',
        'h264_nvenc',
        '-b:v',
        '2.6M',
        '-filter:v',
        'fps=25',
        `${await downloadDir()}test.mp4`,
      ]
    });
    // const args = [
    //   '-y',
    //   `-i`,
    //   options.url,
    //   '-c:v',
    //   'h264_nvenc',
    //   '-b:v',
    //   '2.6M',
    //   '-filter:v',
    //   'fps=25',
    //   `${await downloadDir()}test.mp4`,
    // ];

    // const ffmpeg = Command.sidecar(`bin/ffmpeg`, `-y -i ${options.url} -c:v h264_nvenc -b:v 2.6M -filter:v fps=25 ${await downloadDir()}test.mp4`);
    // ffmpeg.stdout.on('data', console.log);
    // const output = await ffmpeg.execute().catch(console.log);
    // console.log(output);
  }

  private get isUrlMode(): boolean {
    return this.mode === 'url';
  }

  render() {
    return (
      <Host>
        <header class='ion-justify-content-between' >
          <div class='info ion-align-items-center'>
            <ion-img src='/assets/icon/icon.png' id='app-logo' />
            <ion-text>
              <h1 id='app-title' class='ion-no-margin'>Blob downloader</h1>
            </ion-text>
          </div>
          <div class='actions ion-justify-content-between ion-align-items-center'>
            <ion-button fill='clear' class='action ion-no-margin' onClick={() => this.onReduce()}>
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
              <div>
                <blob-mode-switch />
              </div>
              <form ref={ref => this.form = ref}>
                {this.isUrlMode && <blob-mode-url />}
                <blob-options />
              </form>
            </div>
          </ion-content>
        </main>
        <footer class='ion-justify-content-center ion-align-items-center'>
          <ion-button type='submit' color='tertiary' onClick={() => this.onPressButton()}>Télécharger</ion-button>
        </footer>
      </Host>
    );
  }

}
