import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ChromeBorderButton() {
    return (
        <div
                    className="relative rounded-full p-[1.5px] overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.1)]"
                    style={{ background: 'linear-gradient(135deg, #ffffff 0%, #d8d9dc 35%, #f4f4f5 55%, #c9cacd 80%, #ffffff 100%)' }}
                >
                    {/* traveling rainbow ring - only ever peeks through the thin border gap */}
                    <motion.span
                        className="absolute -inset-[45%] blur-[2px]"
                        style={{
                            background:
                                'conic-gradient(from 0deg, #0a0a0a, #ffffff, #8a8a8a, #ffffff, #1c1c1c, #dcdcdc, #e11d2e, #dcdcdc, #1c1c1c, #ffffff, #8a8a8a, #ffffff, #0a0a0a)',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    <button className="relative z-10 px-12 py-4 min-w-[220px] flex items-center justify-center rounded-full bg-white select-none">
                        <motion.span
                            className="relative z-10 text-[17px] font-semibold tracking-tight bg-clip-text text-transparent"
                            style={{
                                backgroundImage: 'linear-gradient(100deg, #2a2a2a 0%, #4a4a4a 20%, #1c1c1c 40%, #5c5c5c 55%, #232323 70%, #4a4a4a 85%, #2a2a2a 100%)',
                                backgroundSize: '250% 100%',
                            }}
                            animate={{ backgroundPosition: ['0% 50%', '250% 50%'] }}
                            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                        >
                            Rewamp UI
                        </motion.span>
                    </button>
                </div>
    );
}

export { ChromeBorderButton };
