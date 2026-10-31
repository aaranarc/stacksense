// Test double for next/navigation: an in-memory URL so pages, links and the shell can navigate in jsdom.
import { useMemo, useSyncExternalStore } from 'react';
let url = '/';
const subs = new Set<() => void>();
export function navigate(to: string) { url = to.startsWith('/') ? to : `/${to}`; subs.forEach(f => f()); }
export function currentUrl() { return url; }
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const useUrl = () => useSyncExternalStore(subscribe, () => url, () => url);
export const usePathname = () => useUrl().split('?')[0]!;
export function useSearchParams() { const q = useUrl().split('?')[1] ?? ''; return useMemo(() => new URLSearchParams(q), [q]); }
const router = { push: navigate, replace: navigate, back() {}, forward() {}, refresh() {}, prefetch() {} };
export const useRouter = () => router;
export const useParams = () => ({});
