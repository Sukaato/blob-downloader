import { Component, h, Host, State } from '@stencil/core';
import { dialog } from '@tauri-apps/api';
import {} from '@tauri-apps/api/dialog';
import { downloadDir, sep } from '@tauri-apps/api/path';

@Component({
  tag: 'blob-options',
  styleUrl: 'blob-options.scss'
})
export class BlobOptions {
  private exts = ['mp4', 'avi', 'mkv', 'mov', 'flv'];
  private codecs = ['h264_nvenc'];

  @State() folderPath: string;
  @State() outputName: string;
  @State() ext: string = 'mp4';
  @State() show: boolean;

  async componentWillLoad(): Promise<void> {
    this.folderPath = await downloadDir();
  }

  private async getFolderPath() {
    const folderPath = (await dialog.open({
      directory: true,
      defaultPath: await downloadDir(),
      multiple: false
    })) as string;

    this.folderPath = folderPath.endsWith(sep) ? folderPath : folderPath + sep;
  }

  private setOutputName(name: string): void {
    this.outputName = name;
  }

  private setExtension(ext: string): void {
    this.ext = ext;
  }

  private toggle(): void {
    this.show = !this.show;
  }

  render() {
    return (
      <Host>
        <ion-item button lines='none' color='primary' slot='header'>
          <ion-icon name='construct-outline' slot='start' />
          <ion-label>Paramètres avancés</ion-label>
          <ion-toggle checked={this.show} color='tertiary' onIonChange={() => this.toggle()} slot='end' />
        </ion-item>
        <ion-card style={{ display: this.show ? 'block' : 'none' }}>
          <ion-card-content>
            <div class='blob-options-content'>
              <input type='hidden' name='path' value={this.folderPath} />
              <ion-button expand='block' color='tertiary' class='ion-no-margin' onClick={() => this.getFolderPath()}>
                sélectionner le répertoire
              </ion-button>

              <ion-item fill='outline' lines='full' color='tertiary'>
                <ion-label position='stacked'>Nom du fichier de sorti</ion-label>
                <ion-input name='name' type='text' onIonChange={ev => this.setOutputName(ev.detail.value)} />
              </ion-item>

              <ion-item fill='outline' lines='full' color='tertiary'>
                <ion-label position='stacked'>Extension de sorti</ion-label>
                <ion-select name='ext' interface='popover' placeholder='Extension' value={this.exts[0]} onIonChange={ev => this.setExtension(ev.detail.value)}>
                  {this.exts.map(ext => (
                    <ion-select-option key={ext} value={ext}>
                      {ext}
                    </ion-select-option>
                  ))}
                </ion-select>
              </ion-item>

              <ion-item fill='outline' lines='full' color='tertiary'>
                <ion-label position='stacked'>FPS</ion-label>
                <ion-input name='fps' type='number' value={25} min={25} />
              </ion-item>

              <ion-item fill='outline' lines='full' color='tertiary'>
                <ion-label position='stacked'>Bitrate</ion-label>
                <ion-input name='bitrate' type='text' value='2.6M' readonly />
              </ion-item>

              <ion-item fill='outline' lines='full' color='tertiary'>
                <ion-label position='stacked'>Codec</ion-label>
                <ion-select name='codec' interface='popover' placeholder='Codec' value={this.codecs[0]}>
                  {this.codecs.map(codec => (
                    <ion-select-option key={codec} value={codec}>
                      {codec}
                    </ion-select-option>
                  ))}
                </ion-select>
              </ion-item>
            </div>
          </ion-card-content>
        </ion-card>
        <ion-text>
          Emplacement final: "{this.folderPath}
          {this.outputName}.{this.ext}"
        </ion-text>
      </Host>
    );
  }
}
