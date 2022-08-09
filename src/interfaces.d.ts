type BlobMode = 'url' | 'file';

interface BlobModeEventDetail {
  value: BlobMode;
}

interface FFmpegPayload {
  code: number;
}
