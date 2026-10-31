import { Suspense, type ReactNode } from 'react';
import { CaseProvider } from '../../components/case/CaseProvider';
import { AppShell } from '../../components/layout/AppShell';
/** One case store for all dashboard pages; /c/[token] and /print stay outside it. Suspense as before: the case is client-only. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<main className="panel"><h1>StackSense</h1><p role="status">Loading your case…</p></main>}>
    <CaseProvider><AppShell>{children}</AppShell></CaseProvider>
  </Suspense>;
}
