import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

function TypewriterEffect({ text, speed = 50, className, style }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <span className={className} style={style}>
      {displayed}
      <span className="text-[#9C8EB8] dark:text-[#D4CBE5]" style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}>|</span>
    </span>
  );
}

export default function TypewriterText() {
  const [key, setKey] = useState(0);
  return (
    <div 
        onClick={() => setKey(k => k + 1)}
        className="text-center max-w-xl cursor-pointer select-none group"
      >
        <div key={key} className="text-[32px] sm:text-[44px] font-bold leading-tight tracking-tight text-neutral-900 dark:text-[#f0ede8] transition-transform duration-200 group-hover:scale-[1.01]">
          <TypewriterEffect text="Building the future of design." speed={65} />
        </div>
      </div>
  );
}

export { TypewriterText };
