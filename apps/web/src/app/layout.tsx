import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' });
export const metadata: Metadata = { title:'StackSense', description:'Find the probable source. Send the right trade.' };
export default function RootLayout({children}: {children:React.ReactNode}) { return <html lang="en" className={inter.variable}><body>{children}</body></html>; }
