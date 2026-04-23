'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AdminLocations() {
  const supabase = createClient();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: userData } = await supabase.from('users').select('is_admin').eq('email', user.email).single();
    if (!userData?.is_admin) { router.push('/'); return; }

    const { data } = await supabase.from('city').select('*').order('city_name');
    setLocations(data || []);
    setLoading(false);
  };

  const toggleStatus = async (cityId: string, currentStatus: number) => {
    await supabase.from('city').update({ status: currentStatus === 1 ? 0 : 1 }).eq('id', cityId);
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
            <Link href="/admin/locations" className="text-green-600">Locations</Link>
            <Link href="/admin/delivery-time" className="text-gray-600 hover:text-green-600">Delivery Time</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Location Management</h1>

        {locations.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center"><p className="text-gray-500">No locations found</p></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {locations.map((city) => (
                  <tr key={city.id}>
                    <td className="px-4 py-4">{city.city_name}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${city.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {city.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleStatus(city.id, city.status)} className="text-blue-600 hover:underline">
                        {city.status === 1 ? 'Deactivate' : 'Activate'}
                      </button>
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