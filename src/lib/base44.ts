// Local stand-in for the base44 platform SDK. There is no connected base44
// backend in this environment, so UploadFile persists the file as a base64
// data URL (survives reload via localStorage) instead of a throwaway
// blob: URL, matching the real integration's contract of returning a
// durable file_url. No parsing (Excel/PDF/PPT content extraction) happens
// anywhere in this app — files of those types are stored and shown as
// metadata (name, type) only, ready for a future parsing integration.

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // ~8MB, safe under typical localStorage quotas

export class UploadTooLargeError extends Error {
  constructor() {
    super("That file is too large to store locally. File must be under 8MB.");
    this.name = "UploadTooLargeError";
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export const base44 = {
  integrations: {
    Core: {
      async UploadFile({ file }: { file: File }): Promise<{ file_url: string }> {
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new UploadTooLargeError();
        }
        const file_url = await fileToDataUrl(file);
        return { file_url };
      },
    },
  },
};
