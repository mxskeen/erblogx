'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, TypingAnimation } from '../../components/ui/Terminal';

// Lines to display in the startup terminal
const STARTUP_LINES = [
  '✔ Preflight checks.',
  '✔ Verifying framework. Found React.',
  '✔ Validating Tailwind CSS.',
  '✔ Validating import alias.',
  '✔ Writing components.json.',
  '✔ Checking registry.',
  '✔ Updating tailwind.config.ts',
  '✔ Updating app/globals.css',
  '✔ Installing dependencies.',
  'Welcome to ErBlogX - created by maskeen',
];

export default function StartupTerminal({ timeout = 4000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not already shown in this session
    if (typeof window !== 'undefined' && !sessionStorage.getItem('startupTerminalShown')) {
      setVisible(true);
      sessionStorage.setItem('startupTerminalShown', '1');
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setVisible(false), timeout);
    return () => clearTimeout(id);
  }, [timeout, visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Terminal className="border border-white/20">
        {STARTUP_LINES.map((line, i) => (
          <TypingAnimation key={i} delay={i * 250} duration={50} as="div">
            {line}
          </TypingAnimation>
        ))}
      </Terminal>
    </div>
  );
} 