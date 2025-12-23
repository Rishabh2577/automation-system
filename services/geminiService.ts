
import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { ProductImage, AspectRatio } from "../types";

export const generateProductVideo = async (
  images: ProductImage[],
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void
): Promise<string> => {
  // Constraints: multiple reference images require 'veo-3.1-generate-preview', 720p, and 16:9 aspect ratio.
  // If user selected 9:16, we default to single-image mode to avoid model errors.
  const canUseMultiRef = images.length > 1 && aspectRatio === '16:9';
  const model = canUseMultiRef ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
  
  const prompt = `Advanced 3D product reconstruction and cinematic showcase. 
    TASK: Convert provided product images into a high-fidelity 3D representation.
    SCENE: Remove all original backgrounds. Place the product in a minimal, high-end studio environment with a subtle dark gradient background.
    LIGHTING: Soft, cinematic studio lighting with physically accurate reflections and shadows. 
    MATERIALS: Render with full PBR (Physically Based Rendering) realism - accurately representing metal, glass, plastic, or fabric.
    CAMERA: Start with a slow hero reveal. Perform a smooth, stable 360-degree orbit around the product. Highlight key angles including front, side, and top.
    STYLE: Premium commercial aesthetic, clean, modern, and professional. 100% geometric consistency. No text, no watermarks, no props.
    ASPECT RATIO: ${aspectRatio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}.`;

  onProgress("Initializing 3D Reconstruction Engine...");

  let operation;

  // Create instance right before the first API call to ensure the latest API key is used
  const aiInit = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (canUseMultiRef) {
    // Multi-reference mode (up to 3 images allowed for 'veo-3.1-generate-preview')
    const referenceImages = images.slice(0, 3).map(img => ({
      image: {
        imageBytes: img.data.split(',')[1],
        mimeType: img.mimeType,
      },
      referenceType: VideoGenerationReferenceType.ASSET,
    }));

    operation = await aiInit.models.generateVideos({
      model,
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p', 
        aspectRatio: '16:9', // Enforced for multi-reference
        referenceImages
      }
    });
  } else {
    // Single-reference mode
    operation = await aiInit.models.generateVideos({
      model,
      prompt,
      image: {
        imageBytes: images[0].data.split(',')[1],
        mimeType: images[0].mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio
      }
    });
  }

  const loadingMessages = [
    "Analyzing multi-angle geometry...",
    "Reconstructing volumetric product model...",
    "Cleaning edges and isolating subject...",
    "Simulating studio lighting environments...",
    "Applying PBR material properties...",
    "Rendering cinematic 360° path...",
    "Perfecting surface micro-details...",
    "Final high-fidelity output encoding..."
  ];

  let messageIndex = 0;
  while (!operation.done) {
    onProgress(loadingMessages[messageIndex % loadingMessages.length]);
    messageIndex++;
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
      // Create fresh instance before polling to ensure the most up-to-date API key is used
      const aiPoll = new GoogleGenAI({ apiKey: process.env.API_KEY });
      operation = await aiPoll.operations.getVideosOperation({ operation: operation });
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
         throw new Error("API_KEY_RESET_REQUIRED");
      }
      throw err;
    }
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation completed but no output was found.");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};