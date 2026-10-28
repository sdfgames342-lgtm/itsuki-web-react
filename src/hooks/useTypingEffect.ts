import { useEffect, useState } from 'react';

export function useTypingEffect(text: string, speed = 20): string {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    if (!text) return;

    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);

    return () => window.clearInterval(id);
  }, [text, speed]);

  return displayed;
}
