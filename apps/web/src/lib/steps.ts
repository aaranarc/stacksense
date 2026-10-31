// Plain data (no 'use client') so server pages can read it too.
export const STEPS = [
  { n: 1, title: 'Read & See', href: '/incidents' },
  { n: 2, title: 'Safety Gate', href: '/incidents' },
  { n: 3, title: 'Ask the Right Check', href: '/building' },
  { n: 4, title: 'Second Opinion', href: '/building' },
  { n: 5, title: 'Job Sheet', href: '/job-sheet' },
  { n: 6, title: 'Repair → Dry → Paint', href: '/repairs' },
  { n: 7, title: 'Predict & Prevent', href: '/predict' },
] as const;

/** Where each page's "Next" link goes, walking steps 1→7 in order. */
export const NEXT: Record<string, { label: string; href: string }> = {
  '/': { label: '1 Read & See', href: '/incidents' },
  '/incidents': { label: '3 Ask the Right Check', href: '/building' },
  '/building': { label: '5 Job Sheet', href: '/job-sheet' },
  '/job-sheet': { label: '6 Repair → Dry → Paint', href: '/repairs' },
  '/repairs': { label: '7 Predict & Prevent', href: '/predict' },
  '/predict': { label: 'Judge Mode', href: '/judge' },
  '/judge': { label: 'Dashboard', href: '/' },
  '/settings': { label: 'Dashboard', href: '/' },
};

/** Old single-page anchors → the page that now holds that section. */
export const HASH_ROUTES: Record<string, string> = {
  dashboard: '/', activity: '/', read: '/incidents', safety: '/incidents', building: '/building', odds: '/building', check: '/building',
  opinion: '/building', jobsheet: '/job-sheet', 'job-sheet': '/job-sheet', repair: '/repairs', repairs: '/repairs', predict: '/predict', judge: '/judge', settings: '/settings',
};
