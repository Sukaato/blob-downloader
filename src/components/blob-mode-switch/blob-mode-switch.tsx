import { RadioGroupChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, h, Host, Listen } from '@stencil/core';

@Component({
  tag: 'blob-mode-switch',
  styleUrl: 'blob-mode-switch.scss'
})
export class BlobModeSwitch {
  @Event() blobModeSelect: EventEmitter<BlobModeEventDetail>;

  @Listen('ionChange')
  onChange(ev: CustomEvent<RadioGroupChangeEventDetail<BlobMode>>): void {
    console.log(ev.detail);

    this.blobModeSelect.emit({ value: ev.detail.value });
  }

  render() {
    return (
      <Host>
        <ion-radio-group value='url'>
          <ion-item lines='none'>
            <ion-label>URL</ion-label>
            <ion-radio value='url' slot='start' />
          </ion-item>
          <ion-item lines='none' disabled>
            <ion-label>Fichier</ion-label>
            <ion-radio value='file' slot='start' />
          </ion-item>
        </ion-radio-group>
      </Host>
    );
  }
}
