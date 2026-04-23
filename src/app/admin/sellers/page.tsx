'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AdminSellers() {
  const supabase = createClient();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: userData } = await supabase.from('users').select('is_admin').eq('email', user.email).single();
    if (!userData?.is_admin) { router.push('/'); return; }

    const { data } = await supabase.from('sellers').select('*').order('created_at', { ascending: false });
    setSellers(data || []);
    setLoading(false);
  };

  const approveSeller = async (sellerId: string) => {
    await supabase.from('sellers').update({ status: 1 }).eq('id', sellerId);
    loadData();
  };

  const toggleSellerStatus = async (sellerId: string, currentStatus: number) => {
    await supabase.from('sellers').update({ status: currentStatus === 1 ? 0 : 1 }).eq('id', sellerId);
    loadData();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold text-green-600">Agriflow Admin</Link>
          <div className="flex gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-green-600">Dashboard</Link>
            <Link href="/admin/orders" className="text-gray-600 hover:text-green-600">Orders</Link>
            <Link href="/admin/sellers" className="text-green-600">Sellers</Link>
            <Link href="/admin/delivery-boys" className="text-gray-600 hover:text-green-600">Delivery Boys</Link>
            <Link href="/admin/products" className="text-gray-600 hover:text-green-600">Products</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Sellers Management</h1>

        {sellers.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center"><p className="text-gray-500">No sellers found</p></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sellers.map((seller) => (
                  <tr key={seller.id}>
                    <td className="px-4 py-4">{seller.b_name}</td>
                    <td className="px-4 py-4">{seller.email}</td>
                    <td className="px-4 py-4">{seller.phone || '-'}</td>
                    <td className="px-4 py-4">GH&#8373;{seller.wallet || 0}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${seller.status === 1 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {seller.status === 1 ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {seller.status === 0 && (
                          <button onClick={() => approveSeller(seller.id)} className="text-green-600 hover:underline">
                            Approve
                          </button>
                        )}
                        <button onClick={() => toggleSellerStatus(seller.id, seller.status)} className="text-blue-600 hover:underline">
                          {seller.status === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}