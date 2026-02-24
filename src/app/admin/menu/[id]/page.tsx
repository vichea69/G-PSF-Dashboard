import MenuDetailClient from '@/features/menu/components/MenuDetailClient';

type PageProps = { params: Promise<{ id: string }> };

export default async function MenuDetailPage(props: PageProps) {
  const params = await props.params;
  return <MenuDetailClient slug={params.id} />;
}
