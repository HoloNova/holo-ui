import React, { useState } from 'react';
import { motion } from 'framer-motion';

const text = "Rewamp UI";

const charVariants = {
  hidden: (i) => ({
    opacity: 0,
    y: (i % 2 === 0 ? -1 : 1) * (30 + Math.random() * 40),
    rotateZ: (i % 2 === 0 ? -1 : 1) * (5 + Math.random() * 10),
    filter: 'blur(8px)',
  }),
  visible: (i) => ({
    opacity: 1, y: 0, rotateZ: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.06, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  })
};

export default function SplitTextReveal() {
  const [key, setKey] = useState(0);
  const characters = text.split('');

  return (
    <div 
        onClick={() => setKey(k => k + 1)}
        className="flex justify-center relative z-10 cursor-pointer select-none group"
      >
        <div key={key} className="flex justify-center transition-transform duration-200 group-hover:scale-[1.02]">
          {characters.map((char, i) => (
            <motion.span 
              key={i} 
              custom={i} 
              variants={charVariants} 
              initial="hidden" 
              animate="visible"
              className="text-[52px] sm:text-[80px] font-extrabold tracking-tight leading-none inline-block text-neutral-900 dark:text-[#E4DDF0]"
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </div>
      </div>
  );
}

export { SplitTextReveal };
