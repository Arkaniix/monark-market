import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ImagePlus,
  X,
  Upload,
  AlertCircle,
  RefreshCw,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  maxWidthPx?: number;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({
  images,
  onImagesChange,
  maxFiles = 5,
  maxSizeMB = 5,
  maxWidthPx = 1600,
  disabled = false,
}: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate unique ID
  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Resize image on client side
  const resizeImage = useCallback((file: File, maxWidth: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let { width, height } = img;
        
        // Only resize if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Failed to resize image"));
            }
          },
          file.type,
          0.85 // Quality for JPEG/WebP
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return "Format non supporté. Utilisez JPG, PNG ou WebP.";
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `Fichier trop volumineux (max ${maxSizeMB}MB)`;
      }
      return null;
    },
    [maxSizeMB]
  );

  // Process and add files
  const processFiles = useCallback(
    async (files: File[]) => {
      const remainingSlots = maxFiles - images.length;
      if (remainingSlots <= 0) {
        toast({
          title: "Limite atteinte",
          description: `Maximum ${maxFiles} photos autorisées`,
          variant: "destructive",
        });
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      const newImages: UploadedImage[] = [];

      for (const file of filesToProcess) {
        const error = validateFile(file);
        if (error) {
          toast({
            title: "Fichier invalide",
            description: error,
            variant: "destructive",
          });
          continue;
        }

        const id = generateId();
        const preview = URL.createObjectURL(file);

        // Add image with uploading status
        newImages.push({
          id,
          file,
          preview,
          status: "uploading",
          progress: 0,
        });
      }

      if (newImages.length === 0) return;

      // Add to state immediately with uploading status
      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);

      // Process each image (resize + simulate upload)
      for (const img of newImages) {
        try {
          // Resize image
          const resizedFile = await resizeImage(img.file, maxWidthPx);
          
          // Update preview with resized version
          const newPreview = URL.createObjectURL(resizedFile);
          URL.revokeObjectURL(img.preview);

          // Simulate upload progress (in real app, this would be actual upload)
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise((r) => setTimeout(r, 100));
            onImagesChange(
              updatedImages.map((i) =>
                i.id === img.id ? { ...i, progress, preview: newPreview, file: resizedFile } : i
              )
            );
          }

          // Mark as success
          onImagesChange(
            updatedImages.map((i) =>
              i.id === img.id
                ? { ...i, status: "success" as const, progress: 100, file: resizedFile, preview: newPreview }
                : i
            )
          );
        } catch (error) {
          // Mark as error
          onImagesChange(
            updatedImages.map((i) =>
              i.id === img.id
                ? { ...i, status: "error" as const, error: "Échec du traitement" }
                : i
            )
          );
        }
      }
    },
    [images, maxFiles, maxWidthPx, onImagesChange, resizeImage, toast, validateFile]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ACCEPTED_TYPES.includes(f.type)
    );
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Remove image
  const handleRemove = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img) {
      URL.revokeObjectURL(img.preview);
    }
    onImagesChange(images.filter((i) => i.id !== id));
  };

  // Retry failed upload
  const handleRetry = async (id: string) => {
    const img = images.find((i) => i.id === id);
    if (!img) return;

    let currentImages = images.map((i) =>
      i.id === id ? { ...i, status: "uploading" as const, progress: 0, error: undefined } : i
    );
    onImagesChange(currentImages);

    try {
      const resizedFile = await resizeImage(img.file, maxWidthPx);
      
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((r) => setTimeout(r, 100));
        currentImages = currentImages.map((i) => (i.id === id ? { ...i, progress } : i));
        onImagesChange(currentImages);
      }

      onImagesChange(
        currentImages.map((i) =>
          i.id === id ? { ...i, status: "success" as const, progress: 100, file: resizedFile } : i
        )
      );
    } catch (error) {
      onImagesChange(
        currentImages.map((i) =>
          i.id === id ? { ...i, status: "error" as const, error: "Échec du traitement" } : i
        )
      );
    }
  };

  const isMaxReached = images.length >= maxFiles;
  const hasUploadingImages = images.some((i) => i.status === "uploading");

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30"}
          ${disabled || isMaxReached ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
        `}
        onClick={() => !disabled && !isMaxReached && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isMaxReached}
        />

        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Camera className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">
            {isMaxReached
              ? `Maximum ${maxFiles} photos atteint`
              : "Glissez vos photos ici"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            JPG, PNG ou WebP • Max {maxSizeMB}MB par fichier
          </p>
          {!isMaxReached && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              Ajouter
            </Button>
          )}
        </div>
      </div>

      {/* Thumbnails Grid */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 sm:grid-cols-5 gap-2"
          >
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
              >
                {/* Image Preview */}
                <img
                  src={img.preview}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-opacity ${
                    img.status === "uploading" ? "opacity-50" : ""
                  }`}
                />

                {/* Upload Progress Overlay */}
                {img.status === "uploading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70">
                    <Upload className="h-5 w-5 text-primary animate-pulse mb-2" />
                    <Progress value={img.progress} className="w-3/4 h-1" />
                    <span className="text-xs mt-1">{img.progress}%</span>
                  </div>
                )}

                {/* Error Overlay */}
                {img.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive mb-1" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry(img.id);
                      }}
                      className="gap-1 text-xs h-6 px-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Réessayer
                    </Button>
                  </div>
                )}

                {/* Remove Button */}
                {img.status !== "uploading" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(img.id);
                    }}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count indicator */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {images.length} / {maxFiles} photo{images.length > 1 ? "s" : ""}
          {hasUploadingImages && " • Upload en cours..."}
        </p>
      )}
    </div>
  );
}
