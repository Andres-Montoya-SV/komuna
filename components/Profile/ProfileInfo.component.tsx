'use client';

import { User } from '@/types/auth.types';

interface ProfileInfoProps {
  user: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card bg-white border-2 border-primary/10 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-primary mb-4">Profile Information</h2>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Full Name</span>
            </label>
            <p className="text-base-content">{user.name}</p>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Email</span>
            </label>
            <p className="text-base-content">{user.email}</p>
          </div>

          {user.phone && (
            <div>
              <label className="label">
                <span className="label-text font-semibold">Phone</span>
              </label>
              <p className="text-base-content">{user.phone}</p>
            </div>
          )}

          {user.address && (
            <div>
              <label className="label">
                <span className="label-text font-semibold">Address</span>
              </label>
              <p className="text-base-content">{user.address}</p>
            </div>
          )}

          <div>
            <label className="label">
              <span className="label-text font-semibold">Member Since</span>
            </label>
            <p className="text-base-content">{formatDate(user.createdAt)}</p>
          </div>

          {user.role === 'seller' && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-primary mb-2">Seller Account</h3>
              <p className="text-sm text-base-content/70">
                Manage your store, add products, and track sales from your seller dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
