import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const visibleImages = images.slice(0, 4);
    const hiddenCount = images.length - 4;

    return (
        <>
            {/* Grid Layout */}
            <div className="grid gap-2 grid-cols-2">
                {visibleImages.map((img, idx) => (
                    <div
                        key={idx}
                        className="relative cursor-pointer overflow-hidden rounded-lg bg-neutral-100 aspect-video"
                        onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(idx);
                        }}
                    >
                        <img
                            src={img}
                            alt={`Image ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                        />

                        {/* Overlay for +N */}
                        {idx === 3 && hiddenCount > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-bold text-white transition-opacity hover:bg-black/60">
                                +{hiddenCount}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox Dialog */}
            <div onClick={(e) => e.stopPropagation()}>
                <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                    <DialogContent showCloseButton={false} className="max-w-4xl border-none bg-black/90 p-0 text-white md:h-[85vh] h-[60vh] flex flex-col items-center justify-center overflow-hidden">
                        <DialogTitle className="sr-only">Xem ảnh chi tiết</DialogTitle>
                        {/* Close Button - handled manually */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxOpen(false);
                            }}
                            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 hover:bg-black/70"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Main Image */}
                        <div className="relative flex h-full w-full items-center justify-center p-4">
                            <img
                                src={images[currentIndex]}
                                alt={`Full view ${currentIndex + 1}`}
                                className="max-h-full max-w-full object-contain"
                            />

                            {/* Navigation */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 hover:bg-black/70"
                                    >
                                        <ChevronLeft className="h-8 w-8" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 hover:bg-black/70"
                                    >
                                        <ChevronRight className="h-8 w-8" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
