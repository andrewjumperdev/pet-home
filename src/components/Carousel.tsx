import React, { useRef, useEffect } from "react";

interface CarouselProps {
  children: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (!container) return;

      // Scroll automático al siguiente ítem
      const scrollAmount = container.offsetWidth * 0.8; // depende del width de los ítems
      if (
        container.scrollLeft + container.offsetWidth >=
        container.scrollWidth
      ) {
        container.scrollTo({ left: 0, behavior: "smooth" }); // reinicia
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3000); // cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="snap-start shrink-0 w-[80%] sm:w-[60%] md:w-[40%] lg:w-[30%] xl:w-[25%]"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
