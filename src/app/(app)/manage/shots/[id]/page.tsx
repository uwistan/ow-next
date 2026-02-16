import ShotEditor from '@/components/manage/editors/ShotEditor';

export default async function EditShotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShotEditor shotId={id} />;
}
