import { useState, useEffect, useRef } from 'react';

const AnimatedGridItem = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { 
        threshold: 0.01, 
        rootMargin: "0px 0px -60px 0px" 
      }
    );
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.215,0.610,0.355,1.000)] transform ${
        inView
          ? "opacity-100 translate-y-0 scale-100 filter blur-0"
          : "opacity-0 translate-y-8 scale-[0.98] filter blur-[1px]"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedGridItem;
