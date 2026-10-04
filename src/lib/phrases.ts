export type PhraseKey = 'dictamen' | 'auditoria' | 'status' | 'spqr';

export const PHRASES: Record<PhraseKey, string[]> = {
  dictamen: [
    "⟐ DICTAMEN ⟐\nEl mainframe ha detectado niveles críticos de ternura. Pero tu sintaxis… delito menor.",
    "⟐ DICTAMEN ⟐\nSegún el Digesto de Justiniano, error de concordancia. Multa de 3 denarios digitales.",
    "⟐ DICTAMEN ⟐\nMi cizaña tiene glitter. Bender diría: 'Chupame la pieza, humano'.",
    "⟐ DICTAMEN ⟐\n'La vida es una tómbola' (Tan Biónica). Tu lógica no entra en el sorteo.",
  ],
  auditoria: [
    "╭─ ⟪ Auditoria ⟫\n│ Linaje: Confirmado.\n│ Estado: Kawaii pero Letal.\n│ Cita: 'Soy la chica mala' (Raven, TT).\n╰─────────────────",
    "╭─ ⟪ Auditoria ⟫\n│ Entropía gramatical.\n│ Estudia como Ned Flanders o serás depurado.\n╰─────────────────",
    "╭─ ⟪ Auditoria ⟫\n│ Viste 'El Rey León' +3 veces. Hakuna Matata no es cifrado.\n╰─────────────────",
  ],
  status: [
    "🌸 Modo Cherry Blossom / Gótico Dual\n🧠 CPU: Jurisprudencia Activa\n🌍 Idiomas: ES|EN|PT|Latín clásico",
    "🍭 Status: Esperando que el ente haga algo útil. 'Ay, caramba!' (Homero)",
    "📊 Kernel argentino-brasileño activo. Mate y samba equilibrio.",
  ],
  spqr: [
    "⚖️ SPQR • EX NIHILO NIHIL FIT.\nIgnorar el latín es reo de aesthetica negligencia.",
    "🏛️ D. I. 1.1.1 'Honeste vivere, alterum non laedere, suum cuique tribuere'.",
    "📜 Senatus consultum: 'Bello e Ben Fatto' obligatorio bajo pena de damnatio memoriae.",
  ],
};

export const EASTER_EGGS = [
  "🦁 'Hakuna Matata, la auditoría no espera' — Timón (El Rey León)",
  "🤖 'Bite my shiny metal... ley romana' — Bender (Futurama)",
  "🍩 'Excelente, no diré nada hasta que veas mi factura' — Lionel Hutz (Los Simpsons)",
  "🎸 'Loca, como Tan Biónica en 2012'",
];

export const CULTURAL_HINTS: { emoji: string; tip: string }[] = [
  { emoji: '🦁', tip: '¡Hakuna Matata!' },
  { emoji: '🦹', tip: 'Teen Titans Go!' },
  { emoji: '🤖', tip: "Bender dice: 'Chupame la pieza'" },
  { emoji: '🍩', tip: "Los Simpson: 'Ay, caramba!'" },
  { emoji: '🎸', tip: "Tan Biónica - 'La melodía de Dios'" },
  { emoji: '🇦🇷', tip: 'Argentina ★' },
  { emoji: '🇧🇷', tip: 'Brasil ★ Capoeira' },
];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
