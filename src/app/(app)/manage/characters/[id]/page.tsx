import CharacterEditor from '@/components/manage/editors/CharacterEditor';

export default async function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CharacterEditor characterId={id} />;
}
