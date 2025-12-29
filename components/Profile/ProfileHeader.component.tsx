'use client';

import { User } from '@/types/auth.types';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="card bg-white border-2 border-primary/10 shadow-lg">
      <div className="card-body">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-primary mb-2">{user.name}</h1>
            <p className="text-base-content/70 mb-4">{user.email}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className={`badge badge-lg ${
                user.role === 'seller' ? 'badge-primary' : 
                user.role === 'admin' ? 'badge-accent' : 
                'badge-ghost'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              {user.role === 'seller' && (
                <span className="badge badge-lg badge-outline">
                  Store Owner
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

