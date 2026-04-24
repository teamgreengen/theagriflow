'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AccountPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push('/login'); return; }
    setUser(authUser);
    
    const { data: userData } = await supabase.from('users').select('*').eq('email', authUser.email).single();
    setProfile(userData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-green-600">Agriflow</Link>
          <div className="flex gap-4">
            <Link href="/cart" className="hover:text-green-600">Cart</Link>
            <button onClick={handleLogout} className="text-red-500">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <div className="space-y-3">
              <div><p className="text-gray-500">Name</p><p className="font-medium">{profile?.name}</p></div>
              <div><p className="text-gray-500">Email</p><p className="font-medium">{profile?.email}</p></div>
              <div><p className="text-gray-500">Phone</p><p className="font-medium">{profile?.phone || '-'}</p></div>
              <div><p className="text-gray-500">Wallet Balance</p><p className="font-medium text-green-600">GH₵{profile?.wallet || 0}</p></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/addresses" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">Manage Addresses</Link>
              <Link href="/orders" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">My Orders</Link>
              <Link href="/wishlist" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">Wishlist</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}