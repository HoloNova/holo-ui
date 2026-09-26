import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * PerspectiveFlipDeck
 * Exact recreation of Recording 2026-09-15 154736.mp4:
 * 3D isometric perspective fanned card deck.
 * When cycling, the front card physically swings open to the right
 * around its right vertical hinge (from -22deg to 85deg) revealing
 * the next card which smoothly slides forward with spring physics.
 * Pure image cards or neutral CSS placeholders.
 */
export function PerspectiveFlipDeck({
  items = null,
  autoPlay = true,
  interval = 2800,
  cardWidth = 260,
  cardHeight = 160,
  className = '',
}) {
  // Neutral placeholder items when caller provides no images
  const defaultCards = [
    { id: '1', title: 'Deck 01' },
    { id: '2', title: 'Deck 02' },
    { id: '3', title: 'Deck 03' },
    { id: '4', title: 'Deck 04' },
    { id: '5', title: 'Deck 05' },
  ];

  const cardList = Array.isArray(items) ? items : defaultCards;
  const numCards = cardList.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(900);
  const containerRef = useRef(null);

  // Measure the component's own container (not window.innerWidth) so sizing
  // reacts continuously to the actual available width - including when a side
  // panel shrinks the stage without the window itself resizing.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Continuous scale (not discrete breakpoints) so the fanned deck always
  // fit the real container width, whatever caused it to shrink. The base
  // deck size is kept compact (see cardWidth/cardHeight defaults above) so
  // it comfortably fits even the narrowed stage when a side panel is open.
  const REFERENCE_WIDTH = 380;
  const geomScale = Math.min(1, Math.max(0.5, containerWidth / REFERENCE_WIDTH));
  const isMobile = containerWidth < 480;
  const effWidth = Math.round(cardWidth * geomScale);
  const effHeight = Math.round(cardHeight * geomScale);
  const effStepX = Math.round(45 * geomScale);
  const effBaseX = Math.round(15 * geomScale);

  // Trigger the 3D swinging flip
  const triggerFlip = () => {
    if (isFlipping || numCards <= 1) return;
    setIsFlipping(true);

    setTimeout(() => {
      setActiveIndex((prev) => (numCards > 0 ? (prev + 1) % numCards : 0));
      setIsFlipping(false);
    }, 650);
  };

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay || isPaused || numCards <= 1) return;
    const timer = setInterval(() => {
      triggerFlip();
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, isFlipping, interval, numCards]);

  if (numCards === 0) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full max-w-full h-[280px] sm:h-[340px] md:h-[380px] overflow-hidden select-none flex items-center justify-center rounded-2xl ${className}`}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full max-w-full h-[280px] sm:h-[340px] md:h-[380px] overflow-hidden select-none flex items-center justify-center rounded-2xl ${className}`}
    >
      {/* 3D Isometric Deck Stage */}
      <div
        className="relative flex items-center justify-center cursor-pointer max-w-full"
        style={{
          perspective: 1400,
          perspectiveOrigin: '50% 50%',
          width: effWidth,
          height: effHeight,
        }}
        onClick={triggerFlip}
      >
        {cardList.map((card, idx) => {
          // Relative position slot from current activeIndex
          const slot = (idx - activeIndex + numCards) % numCards;
          const isFront = slot === 0;

          let targetX = effBaseX - slot * effStepX;
          let targetY = 0 - slot * (isMobile ? 5 : 8);
          let targetScale = 1 - slot * 0.035;
          let targetRotY = 0;
          let targetRotX = 0;
          let targetRotZ = 0;
          let targetOpacity = slot > 2 ? 0 : 1 - slot * 0.06;
          let zIndex = 30 - slot * 5;

          // When flip is in progress:
          if (isFlipping) {
            if (isFront) {
              targetRotY = 90;
              targetRotX = 0;
              targetRotZ = 0;
              targetOpacity = 0;
              targetScale = 0.98;
              zIndex = 40;
            } else if (slot <= 3) {
              const nextSlot = slot - 1;
              targetX = effBaseX - nextSlot * effStepX;
              targetY = 0 - nextSlot * (isMobile ? 5 : 8);
              targetScale = 1 - nextSlot * 0.035;
              targetOpacity = nextSlot > 2 ? 0 : 1 - nextSlot * 0.06;
              zIndex = 30 - nextSlot * 5;
            }
          }

          return (
            <motion.div
              key={card.id || idx}
              initial={false}
              animate={{
                x: targetX,
                y: targetY,
                scale: targetScale,
                opacity: targetOpacity,
                rotateY: targetRotY,
                rotateX: targetRotX,
                rotateZ: targetRotZ,
              }}
              transition={{
                duration: isFront && isFlipping ? 0.6 : 0.52,
                ease: isFront && isFlipping ? [0.35, 0.85, 0.45, 1] : [0.34, 1.3, 0.64, 1],
              }}
              style={{
                width: effWidth,
                height: effHeight,
                position: 'absolute',
                zIndex,
                transformOrigin: 'right center',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Card Surface */}
              <div
                className="w-full h-full rounded-[18px] sm:rounded-[24px] overflow-hidden transition-all duration-300"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  boxShadow:
                    slot === 0 && !isFlipping
                      ? '0 32px 64px -12px rgba(0, 0, 0, 0.52), 0 10px 22px -6px rgba(0, 0, 0, 0.32)'
                      : '0 18px 36px -10px rgba(0, 0, 0, 0.38)',
                }}
              >
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.alt || card.title || `Card ${card.id || idx + 1}`}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 text-neutral-200"
                    aria-label={card.title || `Card ${card.id || idx + 1}`}
                  >
                    <span className="text-xs font-mono tracking-widest uppercase text-neutral-400 mb-1">
                      {card.id || `0${idx + 1}`}
                    </span>
                    <span className="text-sm font-medium tracking-tight text-neutral-200">
                      {card.title || `Card ${idx + 1}`}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PerspectiveFlipDeck;
