type BlobMode = 'url' | 'file';

interface BlobModeEventDetail {
  value: BlobMode;
}

interface LogPayload {
  message: string;
  level: "INFO" | "ERROR";
}

interface FFmpegPayload {
  code: number;
  signal: number;
}
