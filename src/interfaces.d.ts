type BlobMode = 'url' | 'file';

interface BlobModeEventDetail {
  value: BlobMode;
}

interface FFMPEGOptions {
  url: string;
}