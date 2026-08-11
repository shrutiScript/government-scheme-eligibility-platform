import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export function VerticalPanelSlideWrapper({
  basePanel,
  overlayPanel,
  heightVh = 300,
  className = '',
}) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  const yShift = useTransform(
    smoothProgress,
    [0, 0.35, 0.7, 1],
    ['100%', '100%', '0%', '0%']
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full z-30 ${className}`}
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden z-10">
        <div className="w-full h-full relative origin-center">
          {/* Panel 1 */}
          <div className="absolute inset-0 w-full h-full z-10">
            {typeof basePanel === 'function' ? basePanel(smoothProgress) : basePanel}
          </div>

          {/* Panel 2 (Slides UP vertically from bottom) */}
          <motion.div
            className="absolute inset-0 w-full h-full z-20"
            style={{ y: yShift }}
          >
            {typeof overlayPanel === 'function' ? overlayPanel(smoothProgress) : overlayPanel}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default VerticalPanelSlideWrapper;
