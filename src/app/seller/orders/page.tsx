'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function SellerOrders() {
  const supabase = createClient();
  const [seller, setSeller] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: sellerData } = await supabase.from('sellers').select('*').eq('email', user.email).single();
    if (!sellerData) { router.push('/seller/register'); return; }
    setSeller(sellerData);

    const { data: allOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(allOrders || []);
    setLoading(false);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'bg-blue-100 text-blue-600';
      case 2: return 'bg-yellow-100 text-yellow-600';
      case 3: return 'bg-purple-100 text-purple-600';
      case 4: return 'bg-orange-100 text-orange-600';
      case 5: return 'bg-green-100 text-green-600';
      case 6: return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Placing';
      case 2: return 'Placed';
      case 3: return 'Assigned';
      case 4: return 'Out for Delivery';
      case 5: return 'Delivered';
      case 6: return 'Undelivered';
      default: return 'Unknown';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/seller" className="text-xl font-bold text-green-600">Agriflow Seller</Link>
          <Link href="/seller" className="text-gray-600 hover:text-green-600">Back</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>

        <div className="flex gap-4 mb-6">
          {['all', '2', '3', '4', '5'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded ${filter === f ? 'bg-green-600 text-white' : 'bg-white'}`}
            >
              {f === 'all' ? 'All' : getStatusText(parseInt(f))}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.o_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">GH₵{order.final_val}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.order_status)}`}>
                        {getStatusText(order.order_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/seller/orders/${order.id}`} className="text-green-600 hover:underline">
                        View
                      </Link>
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