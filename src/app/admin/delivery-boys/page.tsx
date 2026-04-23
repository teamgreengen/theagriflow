'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AdminDeliveryBoys() {
  const supabase = createClient();
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: userData } = await supabase.from('users').select('is_admin').eq('email', user.email).single();
    if (!userData?.is_admin) { router.push('/'); return; }

    const { data } = await supabase.from('delivery_boys').select('*').order('created_at', { ascending: false });
    setDeliveryBoys(data || []);
    setLoading(false);
  };

  const toggleStatus = async (dvId: string, currentStatus: number) => {
    await supabase.from('delivery_boys').update({ status: currentStatus === 1 ? 0 : 1 }).eq('id', dvId);
    loadData();
  };

  const addDeliveryBoy = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('delivery_boys').insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      status: 1,
    });
    if (!error) {
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
      loadData();
    }
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
            <Link href="/admin/sellers" className="text-gray-600 hover:text-green-600">Sellers</Link>
            <Link href="/admin/delivery-boys" className="text-green-600">Delivery Boys</Link>
            <Link href="/admin/products" className="text-gray-600 hover:text-green-600">Products</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Delivery Boys Management</h1>
          <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            + Add Delivery Boy
          </button>
        </div>

        {deliveryBoys.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No delivery boys found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliveryBoys.map((dv) => (
                  <tr key={dv.id}>
                    <td className="px-4 py-4">{dv.name}</td>
                    <td className="px-4 py-4">{dv.email}</td>
                    <td className="px-4 py-4">{dv.phone || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${dv.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {dv.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleStatus(dv.id, dv.status)} className="text-blue-600 hover:underline">
                        {dv.status === 1 ? 'Deactivate' : 'Activate'}
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
              <h2 className="text-xl font-bold mb-4">Add Delivery Boy</h2>
              <form onSubmit={addDeliveryBoy} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                    Add
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