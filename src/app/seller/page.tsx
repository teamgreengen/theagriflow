'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function SellerDashboard() {
  const supabase = createClient();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: sellerData } = await supabase.from('sellers').select('*').eq('email', user.email).single();
    if (!sellerData) { router.push('/seller/register'); return; }
    setSeller(sellerData);

    const [productsRes, ordersRes] = await Promise.all([
      supabase.from('products').select('*').eq('added_by', sellerData.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    setProducts(productsRes.data || []);
    setOrders(ordersRes.data || []);
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
          <Link href="/seller" className="text-xl font-bold text-green-600">Agriflow Seller</Link>
          <div className="flex gap-4">
            <Link href="/seller/products" className="hover:text-green-600">Products</Link>
            <Link href="/seller/orders" className="hover:text-green-600">Orders</Link>
            <Link href="/seller/wallet" className="hover:text-green-600">Wallet</Link>
            <button onClick={handleLogout} className="text-red-500">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {seller?.f_name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow"><p className="text-gray-500">Total Products</p><p className="text-2xl font-bold">{products.length}</p></div>
          <div className="bg-white p-6 rounded-lg shadow"><p className="text-gray-500">Active Orders</p><p className="text-2xl font-bold">{orders.filter((o: any) => o.order_status < 5).length}</p></div>
          <div className="bg-white p-6 rounded-lg shadow"><p className="text-gray-500">Status</p><p className={`text-2xl font-bold ${seller?.isapp ? 'text-green-600' : 'text-orange-600'}`}>{seller?.isapp ? 'Active' : 'Pending'}</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/seller/products/add" className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700"><p className="font-bold text-xl">+ Add Product</p><p className="text-sm">List a new product</p></Link>
          <Link href="/seller/orders" className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700"><p className="font-bold text-xl">View Orders</p><p className="text-sm">Manage your orders</p></Link>
          <Link href="/seller/wallet" className="bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700"><p className="font-bold text-xl">Withdraw</p><p className="text-sm">Request withdrawal</p></Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {orders.length === 0 ? <p className="text-gray-500">No orders yet</p> : (
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-2">Order ID</th><th className="text-left py-2">Date</th><th className="text-left py-2">Total</th><th className="text-left py-2">Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2">{order.o_id}</td>
                    <td className="py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-2">GH&#8373;{order.final_val}</td>
                    <td className="py-2"><span className={`px-2 py-1 rounded text-sm ${order.order_status === 5 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{(['Placing', 'Placed', 'Assigned', 'Out for Delivery', 'Delivered', 'Undelivered'][order.order_status - 1]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}