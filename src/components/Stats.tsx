import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 99, suffix: "+", label: "Animaux gardés", icon: "paw" },
  { value: 5, suffix: ".0", label: "Note Rover", icon: "star" },
  { value: 100, suffix: "%", label: "Clients satisfaits", icon: "heart" },
  { value: 7, suffix: "j/7", label: "Disponibilité", icon: "clock" },
];

const StatIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons: Record<string, React.ReactNode> = {
    paw: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.5 14.5c0 1.38-1.12 2.5-2.5 2.5S3.5 15.88 3.5 14.5 4.62 12 6 12s2.5 1.12 2.5 2.5zm3.5-3c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zM12 17c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5zm-6.5-5.5c0-1.38-1.12-2.5-2.5-2.5S.5 10.12.5 11.5 1.62 14 3 14s2.5-1.12 2.5-2.5zm15 0c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5zM12 5c1.38 0 2.5-1.12 2.5-2.5S13.38 0 12 0 9.5 1.12 9.5 2.5 10.62 5 12 5z" />
      </svg>
    ),
    star: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    heart: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    ),
    clock: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

const AnimatedNumber: React.FC<{ value: number; suffix: string; triggered: boolean }> = ({
  value,
  suffix,
  triggered,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!triggered) return;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [triggered, value]);

  return (
    <span className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
};

const Stats: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      onEnter: () => setTriggered(true),
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-blue-500 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center text-white group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                <StatIcon type={stat.icon} />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} triggered={triggered} />
              </div>
              <div className="text-blue-100 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
