declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    type?: string;
    quality?: number;
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
  }

  export function toDataURL(
    text: string | Buffer | Array<{ data: string | Buffer; mode?: string }>,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;

  export function toDataURL(
    text: string | Buffer | Array<{ data: string | Buffer; mode?: string }>,
    callback: (error: Error | null, url: string) => void
  ): void;

  export function toString(
    text: string | Buffer | Array<{ data: string | Buffer; mode?: string }>,
    options?: any
  ): Promise<string>;
}
