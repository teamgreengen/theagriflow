'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function DeliveryBoyOrders() {
  const supabase = createClient();
  const [deliveryBoy, setDeliveryBoy] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: dvData } = await supabase.from('delivery_boys').select('*').eq('email', user.email).single();
    if (!dvData) { router.push('/delivery-boy/register'); return; }
    setDeliveryBoy(dvData);

    let query = supabase.from('orders')
      .select('*, address:ad_id(*, city_id:city_id(city_name)), user:u_id(name, phone), order_detail(*, product:p_id(product_name, img1, price))')
      .eq('dv_boy_id', dvData.id);

    if (filter === 'assigned') query = query.eq('order_status', 3);
    else if (filter === 'ofd') query = query.eq('order_status', 4);
    else if (filter === 'delivered') query = query.eq('order_status', 5);
    else if (filter === 'undelivered') query = query.eq('order_status', 6);

    const { data } = await query.order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const startDelivery = async (orderId: string) => {
    await supabase.from('orders').update({ order_status: 4 }).eq('id', orderId);
    await supabase.from('order_time').insert({ oid: orderId, o_status: 4 });
    loadData();
  };

  const confirmDelivery = async (orderId: string) => {
    await supabase.from('orders').update({ order_status: 5, u_cnfrm: 1 }).eq('id', orderId);
    await supabase.from('order_time').insert({ oid: orderId, o_status: 5 });
    loadData();
  };

  const markUndelivered = async (orderId: string) => {
    const reason = prompt('Enter reason for undelivered:');
    if (!reason) return;
    await supabase.from('orders').update({ order_status: 6, payu_status: reason }).eq('id', orderId);
    await supabase.from('order_time').insert({ oid: orderId, o_status: 6 });
    loadData();
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 3: return 'bg-yellow-100 text-yellow-600';
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
          <Link href="/delivery-boy" className="text-xl font-bold text-green-600">Agriflow Delivery</Link>
          <Link href="/delivery-boy" className="text-gray-600 hover:text-green-600">Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          {['all', 'assigned', 'ofd', 'delivered', 'undelivered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded ${filter === f ? 'bg-green-600 text-white' : 'bg-white'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No orders found</p>
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
                  <p className="font-semibold">Delivery Address:</p>
                  <p className="text-gray-600">{order.address?.address}</p>
                  <p className="text-gray-600">{order.address?.city_id?.city_name}</p>
                  <p className="text-gray-600">Phone: {order.address?.user_mobile}</p>
                </div>

                <div className="mb-4">
                  <p className="font-semibold">Customer: {order.user?.name}</p>
                  <p className="text-gray-600">Phone: {order.user?.phone}</p>
                </div>

                <div className="mb-4">
                  <p className="font-semibold">Items:</p>
                  {order.order_detail?.map((item: any) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span>{item.product?.product_name} x {item.qty}</span>
                      <span>GH₵{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>GH₵{order.final_val}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  {order.order_status === 3 && (
                    <button
                      onClick={() => startDelivery(order.id)}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                      Start Delivery
                    </button>
                  )}
                  {order.order_status === 4 && (
                    <>
                      <button
                        onClick={() => confirmDelivery(order.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Confirm Delivery
                      </button>
                      <button
                        onClick={() => markUndelivered(order.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Mark Undelivered
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}