import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadTabProps {
  imageFile: File | null;
  imagePreview: string | null;
  onImageChange: (file: File | null, preview: string | null) => void;
}

export function ImageUploadTab({ imageFile, imagePreview, onImageChange }: ImageUploadTabProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = () => {
    onImageChange(null, null);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Image principale du modèle</Label>
        
        {imagePreview ? (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-64 object-contain rounded-lg border bg-muted"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8
              flex flex-col items-center justify-center gap-4
              transition-colors cursor-pointer
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
            `}
          >
            <div className="p-4 rounded-full bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">Glissez une image ici</p>
              <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
            </div>
            <Input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleInputChange}
            />
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Formats acceptés : JPG, PNG, WebP. Taille max : 5 Mo
        </p>
      </div>

      <div className="grid gap-2">
        <Label>Ou entrer une URL d'image</Label>
        <Input 
          type="url"
          placeholder="https://example.com/image.jpg"
          onChange={(e) => {
            if (e.target.value) {
              onImageChange(null, e.target.value);
            }
          }}
        />
      </div>
    </div>
  );
}
