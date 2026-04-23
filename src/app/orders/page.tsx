'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function UserOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    let query = supabase.from('orders')
      .select('*, address:ad_id(*, city_id:city_id(city_name)), order_detail(*, product:p_id(product_name, img1))')
      .eq('u_id', user.id)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('order_status', parseInt(filter));
    }

    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
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
          <Link href="/account" className="text-xl font-bold text-green-600">Agriflow</Link>
          <Link href="/account" className="text-gray-600 hover:text-green-600">Back</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        <div className="flex gap-4 mb-6">
          {['all', '2', '3', '4', '5', '6'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded ${filter === f ? 'bg-green-600 text-white' : 'bg-white'}`}>
              {f === 'all' ? 'All' : getStatusText(parseInt(f))}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No orders found</p>
            <Link href="/" className="text-green-600 hover:underline mt-2 inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg">{order.o_id}</p>
                    <p className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded ${getStatusColor(order.order_status)}`}>
                    {getStatusText(order.order_status)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="font-semibold">Items:</p>
                  {order.order_detail?.map((item: any) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span>{item.product?.product_name} x {item.qty}</span>
                      <span>GH&#8373;{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>GH&#8373;{order.final_val}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Delivery to: {order.address?.address}, {order.address?.city_id?.city_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}