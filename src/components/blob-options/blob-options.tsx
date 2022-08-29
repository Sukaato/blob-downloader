import { Component, h, Host, Method, State } from '@stencil/core';
import { dialog } from '@tauri-apps/api';
import { downloadDir, sep } from '@tauri-apps/api/path';
import { BlobArgs } from 'src/shared';
import { v4 as uuid } from 'uuid';

@Component({
  tag: 'blob-options',
  styleUrl: 'blob-options.scss'
})
export class BlobOptions {
  private form!: HTMLFormElement;
  private path!: HTMLIonInputElement;

  private exts = ['mp4', 'avi', 'mkv', 'mov', 'flv'];
  private codecs = ['h264_nvenc'];

  @State() folderPath: string;
  @State() outputName: string = uuid();
  @State() ext: string = 'mp4';
  @State() show: boolean;

  async componentWillLoad(): Promise<void> {
    this.folderPath = await downloadDir();
  }

  @Method()
  async getArgs(): Promise<string[]> {
    const data = new FormData(this.form);
    if (!data.get('url')) {
      throw new Error("L'emplacement du fichier n'est pas renseigné");
    }

    return BlobArgs.builder()
      .setDownloadUrl(data.get('url') as string)
      .setOutputPath(data.get('path') as string)
      .setOutputName(data.get('name') as string)
      .setExtension(data.get('ext') as string)
      .setFps(parseInt(data.get('fps').toString()))
      .setBitRate(data.get('bitrate') as string)
      .setCodec(data.get('codec') as string)
      .build();
  }

  private async selectFile() {
    const file = await dialog.open({
      defaultPath: await downloadDir(),
      multiple: false,
      filters: [{ name: 'm3u8', extensions: ['m3u8'] }]
    });
    this.path.value = file as string;
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
    this.outputName = name || uuid();
  }

  private setExtension(ext: string): void {
    this.ext = ext;
  }

  render() {
    return (
      <Host>
        <form ref={ref => (this.form = ref)}>
          <input type='hidden' name='path' value={this.folderPath} />

          <ion-item fill='outline' lines='full' color='tertiary'>
            <ion-label position='stacked'>Emplacement du fichier *</ion-label>
            <ion-input name='url' type='url' ref={el => (this.path = el)} required />
            <ion-icon name='folder-outline' slot='end' onClick={() => this.selectFile()} />
          </ion-item>

          <div class='blob-options-content ion-margin-vertical'>
            <ion-button expand='block' color='tertiary' class='ion-no-margin' onClick={() => this.getFolderPath()}>
              sélectionner l'emplacement de sorti
            </ion-button>

            <ion-item fill='outline' lines='full' color='tertiary'>
              <ion-label position='stacked'>Nom du fichier de sorti</ion-label>
              <ion-input name='name' type='text' required onIonChange={ev => this.setOutputName(ev.detail.value)} />
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
          </div>

          <ion-text>
            La vidéo sera enregistrer à l'emplacement: "{this.folderPath}
            <b>{this.outputName}</b>.{this.ext}"
          </ion-text>

          <ion-accordion-group expand='inset' class='ion-no-margin ion-margin-vertical'>
            <ion-accordion value='parameters'>
              <ion-item lines='none' slot='header'>
                <ion-icon name='construct-outline' slot='start' />
                <ion-label>Paramètres avancés</ion-label>
              </ion-item>

              <ion-list slot='content'>
                <div class='blob-options-content ion-padding'>
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
              </ion-list>
            </ion-accordion>
          </ion-accordion-group>
        </form>
      </Host>
    );
  }
}
