import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'StackSense', description:'Find the probable source. Send the right trade.' };
export default function RootLayout({children}: {children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
