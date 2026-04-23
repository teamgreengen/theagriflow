'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export default function AccountPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    setUser(user);
    const { data: ordersData } = await supabase.from('orders').select('*').eq('u_id', user.id).order('created_at', { ascending: false }).limit(10);
    setOrders(ordersData || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const statusLabels: Record<number, string> = { 1: 'Placing', 2: 'Placed', 3: 'Assigned', 4: 'Out for Delivery', 5: 'Delivered', 6: 'Undelivered', 7: 'Issue' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">{user?.email?.[0]?.toUpperCase()}</span>
              </div>
              <div><p className="font-semibold">{user?.email}</p></div>
            </div>
            <a href="/account/address" className="block py-2 hover:text-green-600">My Addresses</a>
            <a href="/account/orders" className="block py-2 hover:text-green-600">My Orders</a>
            <a href="/account/wallet" className="block py-2 hover:text-green-600">My Wallet</a>
            <button onClick={handleLogout} className="block py-2 text-red-500 w-full text-left">Logout</button>
          </div>
        </div>
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <a href="/account/orders" className="text-green-600">View All</a>
            </div>
            {orders.length === 0 ? <p className="text-gray-500">No orders yet</p> : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-4 border rounded">
                    <div><p className="font-medium">{order.o_id}</p><p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p></div>
                    <div className="text-right"><p className="font-bold">GH&#8373;{order.final_val}</p>
                      <span className={`text-sm ${order.order_status === 5 ? 'text-green-600' : 'text-orange-600'}`}>{statusLabels[order.order_status]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}