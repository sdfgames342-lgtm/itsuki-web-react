#!/usr/bin/env bash
set -euo pipefail
cd ~/itsuki-web-react

echo "── 1. App.tsx ──"
cat src/App.tsx

echo; echo "── 2. main.tsx ──"
cat src/main.tsx

echo; echo "── 3. layouts/ ──"
ls src/layouts/
for f in src/layouts/*.tsx; do echo "── $f ──"; cat "$f"; done

echo; echo "── 4. pages/ ──"
ls src/pages/
for f in src/pages/*.tsx; do echo "── $f (head -40) ──"; head -40 "$f"; done

echo; echo "── 5. hooks/ ──"
ls src/hooks/
for f in src/hooks/*.ts; do echo "── $f ──"; cat "$f"; done

echo; echo "── 6. lib/ ──"
ls src/lib/
for f in src/lib/*.ts; do echo "── $f (head -30) ──"; head -30 "$f"; done

echo; echo "── 7. router/ ──"
ls src/router/
for f in src/router/*.tsx src/router/*.ts 2>/dev/null; do echo "── $f ──"; cat "$f"; done

echo; echo "── 8. components/ ──"
ls src/components/

echo; echo "── 9. supabase client ──"
grep -rn "createClient\|supabase" src/lib src/ 2>/dev/null | grep -v node_modules | head -20

echo; echo "── 10. vite.config + tsconfig ──"
cat vite.config.ts 2>/dev/null
cat tsconfig.json 2>/dev/null

echo; echo "── 11. .env (nombres, sin valores) ──"
ls -la .env* 2>/dev/null
for f in .env .env.local .env.example; do
  [ -f "$f" ] && echo "── $f ──" && sed 's/=.*/=***/' "$f"
done
