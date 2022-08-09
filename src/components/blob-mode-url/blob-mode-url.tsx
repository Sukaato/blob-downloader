import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'blob-mode-url',
  styleUrl: 'blob-mode-url.scss'
})
export class BlobModeUrl {
  render() {
    return (
      <Host>
        <ion-item fill='outline' lines='full' color='tertiary'>
          <ion-label position='stacked'>Url du fichier</ion-label>
          <ion-input name='url' type='url' required />
        </ion-item>
      </Host>
    );
  }
}
