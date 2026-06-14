import react from '@quanta/config/eslint/react';

// `next-env.d.ts` y `.next/` los genera Next.js (no se commitean); fuera del lint.
export default [...react, { ignores: ['next-env.d.ts', '.next/**'] }];
