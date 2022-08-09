import { Component, h, Host, State } from '@stencil/core';

@Component({
  tag: 'blob-options',
  styleUrl: 'blob-options.scss'
})
export class BlobOptions {
  @State() show: boolean;

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
        {this.show && (
          <ion-card>
            <ion-card-content>
              <div class='blob-options-content'>
                <ion-item fill='outline' lines='full' color='tertiary'>
                  <ion-label position='stacked'>Nom du fichier de sorti</ion-label>
                  <ion-input name='outputName' type='text' />
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
                  <ion-input name='codec' type='text' value='h264_nvenc' readonly />
                </ion-item>
              </div>
            </ion-card-content>
          </ion-card>
        )}
      </Host>
    );
  }
}
