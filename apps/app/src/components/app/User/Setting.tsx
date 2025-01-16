'use client';
import React from 'react';
import Delete from '@/components/app/Dashboard/DeleteAccount';
import UpdateEmail from '@/components/app/Dashboard/UpdateEmail';
import UpdatePassword from '@/components/app/Dashboard/UpdatePassword';
import UserLayout from '@/components/app/Layouts/UserLayout';
import withAuth from '@/components/app/stores/withAuth';
import useAuth from '@/hooks/app/useAuth';

const Setting = ({ role }: { role?: string }) => {
  const { data: userData, loading, mutate } = useAuth('/users/me', {}, true);
  const user = userData?.user || null;

  return (
    <>
      <UserLayout role={role} title="Account Settings">
        <div>
          <UpdateEmail loading={loading} mutate={mutate} user={user} />
        </div>
        <div>
          <UpdatePassword />
        </div>
        <div>
          <Delete />
        </div>
      </UserLayout>
    </>
  );
};

export default withAuth(Setting);
