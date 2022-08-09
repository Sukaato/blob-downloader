import { downloadDir } from '@tauri-apps/api/path';
import { v4 as uuid } from 'uuid';

export class BlobArgs {
  private downloadUrl: string;
  private codec: string;
  private bitrate: string;
  private fps: number;
  private outputName: string;

  static builder(): BlobArgs {
    return new BlobArgs();
  }

  setDownloadUrl(downloadUrl: string): BlobArgs {
    this.downloadUrl = downloadUrl;
    return this;
  }

  setCodec(codec: string): BlobArgs {
    this.codec = codec || 'h264_nvenc';
    return this;
  }

  setBitRate(bitrate: string): BlobArgs {
    this.bitrate = bitrate || '2.6M';
    return this;
  }

  setFps(fps: number): BlobArgs {
    this.fps = fps || 25;
    return this;
  }

  setOutputName(name: string): BlobArgs {
    this.outputName = name || uuid();
    return this;
  }


  async build(): Promise<string[]> {
    const args = [
      '-y',
      '-i',
      this.downloadUrl,
      '-c:v',
      this.codec,
      '-b:v',
      this.bitrate,
      '-filter:v',
      `fps=${this.fps}`,
      `${await downloadDir()}${this.outputName}.mp4`,
    ];

    return args;
  }
}