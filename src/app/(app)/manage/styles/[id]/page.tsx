import StyleEditor from '@/components/manage/editors/StyleEditor';

export default async function EditStylePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StyleEditor styleId={id} />;
}
