'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function DeliveryBoyDashboard() {
  const supabase = createClient();
  const [deliveryBoy, setDeliveryBoy] = useState<any>(null);
  const [stats, setStats] = useState({ assigned: 0, ofd: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: dvData } = await supabase.from('delivery_boys').select('*').eq('email', user.email).single();
    if (!dvData) { router.push('/delivery-boy/register'); return; }
    setDeliveryBoy(dvData);

    const [assigned, ofd, delivered] = await Promise.all([
      supabase.from('orders').select('id').eq('dv_boy_id', dvData.id).eq('order_status', 3),
      supabase.from('orders').select('id').eq('dv_boy_id', dvData.id).eq('order_status', 4),
      supabase.from('orders').select('id').eq('dv_boy_id', dvData.id).eq('order_status', 5),
    ]);

    setStats({
      assigned: assigned.data?.length || 0,
      ofd: ofd.data?.length || 0,
      delivered: delivered.data?.length || 0,
    });
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
          <Link href="/delivery-boy" className="text-xl font-bold text-green-600">Agriflow Delivery</Link>
          <div className="flex gap-4">
            <Link href="/delivery-boy/orders" className="hover:text-green-600">Orders</Link>
            <Link href="/delivery-boy/wallet" className="hover:text-green-600">Wallet</Link>
            <button onClick={handleLogout} className="text-red-500">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {deliveryBoy?.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500">Assigned Orders</p>
            <p className="text-2xl font-bold">{stats.assigned}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500">Out for Delivery</p>
            <p className="text-2xl font-bold">{stats.ofd}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500">Delivered</p>
            <p className="text-2xl font-bold">{stats.delivered}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/delivery-boy/orders" className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700">
            <p className="font-bold text-xl">My Orders</p>
            <p className="text-sm">View assigned orders</p>
          </Link>
          <Link href="/delivery-boy/orders" className="bg-orange-600 text-white p-6 rounded-lg text-center hover:bg-orange-700">
            <p className="font-bold text-xl">Out for Delivery</p>
            <p className="text-sm">Mark orders in progress</p>
          </Link>
          <Link href="/delivery-boy/delivered" className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700">
            <p className="font-bold text-xl">Delivered</p>
            <p className="text-sm">View delivered orders</p>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link href="/delivery-boy/orders" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}