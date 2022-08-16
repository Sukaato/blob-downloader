import { downloadDir } from '@tauri-apps/api/path';
import { v4 as uuid } from 'uuid';

export class BlobArgs {
  private downloadUrl: string;
  private outputName: string;
  private ext: string;
  private codec: string;
  private bitrate: string;
  private fps: number;
  private path: string;

  static builder(): BlobArgs {
    return new BlobArgs();
  }

  setDownloadUrl(downloadUrl: string): BlobArgs {
    this.downloadUrl = downloadUrl;
    return this;
  }

  setCodec(codec: string): BlobArgs {
    this.codec = codec;
    return this;
  }

  setBitRate(bitrate: string): BlobArgs {
    this.bitrate = bitrate || '2.6M';
    return this;
  }

  setFps(fps: number): BlobArgs {
    this.fps = fps;
    return this;
  }

  setOutputPath(path: string): BlobArgs {
    this.path = path;
    return this;
  }

  setOutputName(name: string): BlobArgs {
    this.outputName = name;
    return this;
  }

  setExtension(ext: string): BlobArgs {
    this.ext = ext;
    return this;
  }

  private async prebuild(): Promise<void> {
    this.path ||= await downloadDir();
    this.outputName ||= uuid();
    this.ext ||= 'mp4';
    this.fps ||= 25;
    this.bitrate ||= '2.6M';
    this.codec ||= 'h264_nvenc';
  }

  async build(): Promise<string[]> {
    await this.prebuild();
    const output = `${this.path}${this.outputName}.${this.ext}`;
    const args = ['-y', '-i', this.downloadUrl, '-c:v', this.codec, '-b:v', this.bitrate, '-filter:v', `fps=${this.fps}`, output];

    console.log(this.toJson());
    return args;
  }

  private toJson(): Record<string, unknown> {
    return {
      downloadUrl: this.downloadUrl,
      outputName: this.outputName,
      ext: this.ext,
      codec: this.codec,
      bitrate: this.bitrate,
      fps: this.fps,
      path: this.path
    };
  }
}
