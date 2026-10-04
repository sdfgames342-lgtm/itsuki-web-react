import { useState } from 'react';
import { StickyHeader } from '../components/StickyHeader';
import { LedgerCard } from '../components/LedgerCard';
import { CulturalFooter } from '../components/CulturalFooter';
import { ItalianLayout } from '../layouts/ItalianLayout';
import { PHRASES, EASTER_EGGS, pickRandom, type PhraseKey } from '../lib/phrases';

export function HomePage() {
  const [output, setOutput] = useState('⟐ ESCANEANDO ENTE BIOLÓGICO... ⟐');

  const handleAction = (key: string, telegram?: boolean) => {
    if (telegram) {
      window.location.href = 'https://t.me/ItsukiNakanoUserBot';
      return;
    }
    const list = PHRASES[key as PhraseKey] ?? PHRASES.dictamen;
    setOutput(pickRandom(list));
  };

  const handleEasterEgg = () => {
    setOutput(`🥚 EASTER EGG → ${pickRandom(EASTER_EGGS)}`);
  };

  return (
    <ItalianLayout
      showHeader={<StickyHeader onAction={handleAction} onEasterEgg={handleEasterEgg} />}
      showFooter={<CulturalFooter />}
    >
      <LedgerCard output={output} />
    </ItalianLayout>
  );
}
