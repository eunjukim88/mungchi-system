declare module "downloadjs" {
  export default function download(data: string | Blob, filename?: string, mimeType?: string): void
}
