import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  modelName: string;
}

export function ImageGallery({ images, modelName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Si pas d'images, afficher placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-muted/50 rounded-xl flex flex-col items-center justify-center border border-border/50">
        <ImageOff className="h-12 w-12 text-muted-foreground/40 mb-2" />
        <span className="text-sm text-muted-foreground">Image non disponible</span>
      </div>
    );
  }
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <div className="space-y-3">
      {/* Image principale */}
      <div className="relative w-full aspect-[4/3] bg-muted/30 rounded-xl overflow-hidden border border-border/50 shadow-sm">
        <img 
          src={images[currentIndex]} 
          alt={`${modelName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />
        
        {/* Flèches de navigation (si plusieurs images) */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Indicateur de position */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      
      {/* Miniatures (si plusieurs images) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'border-primary ring-1 ring-primary/30' 
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={img} 
                alt={`${modelName} - Miniature ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Mention légale */}
      <div className="text-center">
        <span className="text-[10px] text-muted-foreground/60 italic">
          Image non contractuelle
        </span>
      </div>
    </div>
  );
}
