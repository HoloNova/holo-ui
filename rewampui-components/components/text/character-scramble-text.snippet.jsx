import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

function ScrambleText({ text, className, style, trigger }) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(null);

  const scramble = useCallback(() => {
    let iteration = 0;
    const totalFrames = text.length * 3;

    const run = () => {
      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (i < iteration / 3) return text[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      iteration++;
      if (iteration <= totalFrames) {
        frameRef.current = requestAnimationFrame(run);
      }
    };
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(run);
  }, [text]);

  useEffect(() => { scramble(); return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }; }, [trigger, scramble]);

  return <span className={className} style={style}>{display}</span>;
}

export default function CharacterScrambleText({ text = "PURRFORM DESIGN", className = "" }) {
  const [key, setKey] = useState(0);
  return (
    <div 
      onClick={() => setKey(k => k + 1)}
      className={`text-center relative z-10 cursor-pointer select-none group ${className}`}
    >
      <h2 className="text-[34px] sm:text-[50px] font-bold tracking-tight leading-none font-mono text-neutral-900 dark:text-[#E4DDF0] transition-transform duration-200 group-hover:scale-[1.01]">
        <ScrambleText text={text} trigger={key} />
      </h2>
    </div>
  );
}

export { CharacterScrambleText };
