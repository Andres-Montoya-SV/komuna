'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth.types';
import ProfileHeader from '@/components/Profile/ProfileHeader.component';
import ProfileInfo from '@/components/Profile/ProfileInfo.component';
import ProfileActions from '@/components/Profile/ProfileActions.component';
import DeleteAccountModal from '@/components/Profile/DeleteAccountModal.component';
import { deleteAccount } from '@/utils/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // In a real app, fetch user from API or context
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await deleteAccount(user.id);
      localStorage.removeItem('user');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ProfileHeader user={user} />

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2">
              <ProfileInfo user={user} />
            </div>

            <div className="md:col-span-1">
              <ProfileActions
                user={user}
                onEditStore={() => router.push('/store/manage')}
                onViewStore={() => router.push(`/store/${user.id}`)}
                onDeleteAccount={() => setShowDeleteModal(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
