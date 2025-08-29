import ProfileViewPage from '@/features/profile/components/profile-view-page';
import ProfileEditorDialog from '@/features/profile/components/profile-editor-dialog';

export const metadata = {
  title: 'Dashboard : Profile'
};

export default async function Page() {
  return (
    <div className='space-y-4'>
      <ProfileEditorDialog />
      <ProfileViewPage />
    </div>
  );
}
