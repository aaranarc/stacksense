import type { Metadata } from 'next';
import { SettingsPanel } from '../../../components/sections';
import { NextLink } from '../../../components/layout/Steps';
export const metadata: Metadata = { title: 'Settings · StackSense' };
export default function SettingsPage() {
  return <><div className="page-grid one narrow"><SettingsPanel /></div><NextLink from="/settings" /></>;
}
