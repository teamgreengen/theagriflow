'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AdminOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: userData } = await supabase.from('users').select('is_admin').eq('email', user.email).single();
    if (!userData?.is_admin) { router.push('/'); return; }

    let query = supabase.from('orders')
      .select('*, address:ad_id(*, city_id:city_id(city_name)), user:u_id(name, phone), dv_boy:dv_boy_id(name)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('order_status', parseInt(filter));
    }

    const { data: ordersData } = await query;
    setOrders(ordersData || []);

    const { data: dvData } = await supabase.from('delivery_boys').select('id, name, phone').eq('status', 1);
    setDeliveryBoys(dvData || []);
    setLoading(false);
  };

  const assignDeliveryBoy = async (orderId: string, dvId: string) => {
    await supabase.from('orders').update({ dv_boy_id: dvId, order_status: 3 }).eq('id', orderId);
    await supabase.from('order_time').insert({ oid: orderId, o_status: 3 });
    loadData();
  };

  const getStatusColor = (status: number) => {
    const colors: Record<number, string> = { 1: 'bg-blue-100 text-blue-600', 2: 'bg-yellow-100 text-yellow-600', 3: 'bg-purple-100 text-purple-600', 4: 'bg-orange-100 text-orange-600', 5: 'bg-green-100 text-green-600', 6: 'bg-red-100 text-red-600' };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusText = (status: number) => {
    const texts: Record<number, string> = { 1: 'Placing', 2: 'Placed', 3: 'Assigned', 4: 'Out for Delivery', 5: 'Delivered', 6: 'Undelivered' };
    return texts[status] || 'Unknown';
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold text-green-600">Agriflow Admin</Link>
          <div className="flex gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-green-600">Dashboard</Link>
            <Link href="/admin/orders" className="text-green-600">Orders</Link>
            <Link href="/admin/sellers" className="text-gray-600 hover:text-green-600">Sellers</Link>
            <Link href="/admin/delivery-boys" className="text-gray-600 hover:text-green-600">Delivery Boys</Link>
            <Link href="/admin/products" className="text-gray-600 hover:text-green-600">Products</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

        <div className="flex gap-4 mb-6">
          {['all', '2', '3', '4', '5', '6'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded ${filter === f ? 'bg-green-600 text-white' : 'bg-white'}`}>
              {f === 'all' ? 'All' : getStatusText(parseInt(f))}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center"><p className="text-gray-500">No orders found</p></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Boy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4">{order.o_id}</td>
                    <td className="px-4 py-4">{order.user?.name}<br/><span className="text-gray-500">{order.user?.phone}</span></td>
                    <td className="px-4 py-4">{order.address?.address}<br/>{order.address?.city_id?.city_name}</td>
                    <td className="px-4 py-4">GH₵{order.final_val}</td>
                    <td className="px-4 py-4"><span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.order_status)}`}>{getStatusText(order.order_status)}</span></td>
                    <td className="px-4 py-4">{order.dv_boy?.name || '-'}</td>
                    <td className="px-4 py-4">
                      {order.order_status === 2 && (
                        <select
                          onChange={(e) => { if (e.target.value) assignDeliveryBoy(order.id, e.target.value); }}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="">Assign</option>
                          {deliveryBoys.map((dv) => (<option key={dv.id} value={dv.id}>{dv.name}</option>))}
                        </select>
                      )}
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