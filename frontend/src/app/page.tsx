'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function RootPage() {
  const router = useRouter();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router, initAuth]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}
