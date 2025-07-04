'use client';


// ------------------------------------------------------------------

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';


export const AnimatedSpan = ({ children, delay = 0, className }) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: delay / 1000, duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.span>
);


export const TypingAnimation = ({
  children,
  delay = 0,
  duration = 100,
  as: Component = 'span',
  className,
}) => {
  const [displayed, setDisplayed] = useState('');
  const textRef = useRef('');

 
  useEffect(() => {
    if (typeof children === 'string') {
      textRef.current = children;
    } else if (Array.isArray(children)) {
      textRef.current = children.join('');
    } else {
      textRef.current = String(children);
    }
  }, [children]);

  useEffect(() => {
    let intervalId;
    const timeoutId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        setDisplayed(textRef.current.slice(0, i + 1));
        i += 1;
        if (i >= textRef.current.length) {
          clearInterval(intervalId);
        }
      }, duration);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      intervalId && clearInterval(intervalId);
    };
  }, [delay, duration, children]);

  return <Component className={className}>{displayed}</Component>;
};

export const Terminal = React.forwardRef(function Terminal(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'w-[90vw] max-w-2xl rounded-lg bg-black text-white shadow-lg ring-1 ring-white/10',
        className,
      )}
      {...props}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </div>
      {/* Command output */}
      <pre className="font-mono text-xs sm:text-sm leading-relaxed px-4 pb-4 whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
});

export default Terminal; 