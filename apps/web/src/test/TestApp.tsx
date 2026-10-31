// Renders the dashboard layout + the page for the current in-memory URL (mock next/navigation and next/link first).
import { usePathname } from 'next/navigation';
import DashboardLayout from '../app/(dash)/layout';
import Dashboard from '../app/(dash)/page';
import Incidents from '../app/(dash)/incidents/page';
import Building from '../app/(dash)/building/page';
import JobSheet from '../app/(dash)/job-sheet/page';
import Repairs from '../app/(dash)/repairs/page';
import Predict from '../app/(dash)/predict/page';
import Judge from '../app/(dash)/judge/page';
import Settings from '../app/(dash)/settings/page';
export const ROUTES = { '/': Dashboard, '/incidents': Incidents, '/building': Building, '/job-sheet': JobSheet, '/repairs': Repairs, '/predict': Predict, '/judge': Judge, '/settings': Settings } as const;
function CurrentPage() { const Page = ROUTES[usePathname() as keyof typeof ROUTES] ?? Dashboard; return <Page />; }
export function TestApp() { return <DashboardLayout><CurrentPage /></DashboardLayout>; }
