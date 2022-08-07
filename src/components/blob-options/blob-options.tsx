import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'blob-options',
  styleUrl: 'blob-options.scss'
})
export class BlobOptions {

  render() {
    return (
      <Host>
        <ion-accordion-group>
          <ion-accordion>
            <ion-item lines='none' color='primary' slot='header'>
              <ion-icon name='construct-outline' slot='start' />
              <ion-label>Paramètres avancés</ion-label>
            </ion-item>
            <ion-list class='ion-padding' slot='content'>
              <div class='blob-options-content'>
                <ion-item lines='full' fill='outline' color='tertiary'>
                  <ion-label position='stacked'>FPS</ion-label>
                  <ion-input name='option-fps' type='number' value={25} min={1} />
                </ion-item>
              </div>
            </ion-list>
          </ion-accordion>
        </ion-accordion-group>
      </Host>
    );
  }

}
