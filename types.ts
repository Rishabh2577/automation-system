
export type AspectRatio = '16:9' | '9:16';

export interface ProductImage {
  id: string;
  data: string; // base64
  mimeType: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GenerationState {
  status: GenerationStatus;
  progressMessage: string;
  videoUrl?: string;
  error?: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fixed: added readonly modifier to match the existing global environment declaration of aistudio
    readonly aistudio: AIStudio;
  }
}
