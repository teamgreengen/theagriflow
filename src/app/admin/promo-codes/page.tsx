'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AdminPromoCodes() {
  const supabase = createClient();
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount: '', min_order: '' });
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: userData } = await supabase.from('users').select('is_admin').eq('email', user.email).single();
    if (!userData?.is_admin) { router.push('/'); return; }

    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    setPromoCodes(data || []);
    setLoading(false);
  };

  const createPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('promo_codes').insert({
      code: formData.code.toUpperCase(),
      discount: parseFloat(formData.discount),
      min_order: parseFloat(formData.min_order) || 0,
      status: 1,
    });
    if (!error) {
      setShowModal(false);
      setFormData({ code: '', discount: '', min_order: '' });
      loadData();
    }
  };

  const toggleStatus = async (promoId: string, currentStatus: number) => {
    await supabase.from('promo_codes').update({ status: currentStatus === 1 ? 0 : 1 }).eq('id', promoId);
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
            <Link href="/admin/promo-codes" className="text-green-600">Promo Codes</Link>
            <Link href="/admin/categories" className="text-gray-600 hover:text-green-600">Categories</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Promo Codes</h1>
          <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            + Create Promo Code
          </button>
        </div>

        {promoCodes.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center"><p className="text-gray-500">No promo codes found</p></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promoCodes.map((promo) => (
                  <tr key={promo.id}>
                    <td className="px-4 py-4 font-mono font-bold">{promo.code}</td>
                    <td className="px-4 py-4">GH₵{promo.discount}</td>
                    <td className="px-4 py-4">GH₵{promo.min_order}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${promo.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {promo.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleStatus(promo.id, promo.status)} className="text-blue-600 hover:underline">
                        {promo.status === 1 ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Promo Code</h2>
              <form onSubmit={createPromoCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount Amount (GH₵)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Order (GH₵)</label>
                  <input
                    type="number"
                    value={formData.min_order}
                    onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}