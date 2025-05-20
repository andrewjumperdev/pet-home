import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode;
  autoplayInterval?: number;
}

export const Carousel: React.FC<CarouselProps> = ({ children, autoplayInterval = 4000 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const startAutoPlay = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (hoverRef.current) return;
        const width = container.clientWidth;
        const next = container.scrollLeft + width;
        container.scrollTo({ left: next >= container.scrollWidth ? 0 : next, behavior: "smooth" });
      }, autoplayInterval);
    };

    container.addEventListener("mouseenter", () => (hoverRef.current = true));
    container.addEventListener("mouseleave", () => (hoverRef.current = false));

    startAutoPlay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoplayInterval]);

  const scroll = (dir: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const shift = container.clientWidth;
    const newPos = dir === "left" ? container.scrollLeft - shift : container.scrollLeft + shift;
    container.scrollTo({ left: newPos, behavior: "smooth" });
  };

  return (
    <div className="relative w-full overflow-hidden scrollbar-hide scrollbar-none">
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide scrollbar-none px-4 sm:px-0"
      >
        {React.Children.map(children, (child) => (
          <div className="snap-start flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 rounded-2xl overflow-hidden">
            {child}
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll("left")}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
};
