# blob-mode-switch



<!-- Auto Generated Below -->


## Events

| Event            | Description | Type                               |
| ---------------- | ----------- | ---------------------------------- |
| `blobModeSelect` |             | `CustomEvent<BlobModeEventDetail>` |


## Dependencies

### Used by

 - [blob-app](../blob-app)

### Depends on

- ion-radio-group
- ion-item
- ion-label
- ion-radio

### Graph
```mermaid
graph TD;
  blob-mode-switch --> ion-radio-group
  blob-mode-switch --> ion-item
  blob-mode-switch --> ion-label
  blob-mode-switch --> ion-radio
  ion-item --> ion-icon
  ion-item --> ion-ripple-effect
  ion-item --> ion-note
  blob-app --> blob-mode-switch
  style blob-mode-switch fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
