'use client';
import { SectionTableList } from './section-table';
import { useSection } from '@/features/section/hook/use-section';

export default function SectionsListPage() {
  // Fetch sections data using the custom hook
  const { data } = useSection();
  const sections = data || [];

  return <SectionTableList data={sections} />;
}
