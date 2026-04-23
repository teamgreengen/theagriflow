'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AddressesPage() {
  const supabase = createClient();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ user_name: '', user_mobile: '', address: '', city_id: '', pincode: '', landmark: '', address_type: 'home' });
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    
    const [addrRes, cityRes] = await Promise.all([
      supabase.from('user_address').select('*, city_id:city_id(city_name)').eq('u_id', user.id),
      supabase.from('city').select('*').eq('status', 1).order('city_name'),
    ]);
    setAddresses(addrRes.data || []);
    setCities(cityRes.data || []);
    setLoading(false);
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from('user_address').insert({
      ...formData,
      u_id: user.id,
    });
    
    if (!error) {
      setShowModal(false);
      setFormData({ user_name: '', user_mobile: '', address: '', city_id: '', pincode: '', landmark: '', address_type: 'home' });
      loadData();
    }
  };

  const deleteAddress = async (addrId: string) => {
    if (!confirm('Delete this address?')) return;
    await supabase.from('user_address').delete().eq('id', addrId);
    loadData();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/account" className="text-xl font-bold text-green-600">Agriflow</Link>
          <Link href="/account" className="text-gray-600 hover:text-green-600">Back</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            + Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No addresses saved. Add your first address.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white p-6 rounded-lg shadow relative">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{addr.user_name}</p>
                    <p className="text-gray-600">{addr.address}</p>
                    <p className="text-gray-600">{addr.city_id?.city_name} - {addr.pincode}</p>
                    <p className="text-gray-600">{addr.user_mobile}</p>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">{addr.address_type}</span>
                  </div>
                  <button onClick={() => deleteAddress(addr.id)} className="text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Address</h2>
              <form onSubmit={saveAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" value={formData.user_name} onChange={(e) => setFormData({ ...formData, user_name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" value={formData.user_mobile} onChange={(e) => setFormData({ ...formData, user_mobile: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <select value={formData.city_id} onChange={(e) => setFormData({ ...formData, city_id: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
                    <option value="">Select City</option>
                    {cities.map((city) => (<option key={city.id} value={city.id}>{city.city_name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Landmark</label>
                  <input type="text" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Type</label>
                  <select value={formData.address_type} onChange={(e) => setFormData({ ...formData, address_type: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Save</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}