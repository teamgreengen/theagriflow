'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export default function AddProductPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    product_name: '', cat_id: '', price: '', sell_price: '', fa: '', qty: 0, shrt_desc: '', description: '',
  });
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: sellerData } = await supabase.from('sellers').select('*').eq('email', user.email).single();
    if (!sellerData) { router.push('/seller/register'); return; }
    const { data: cats } = await supabase.from('categories').select('*').eq('status', true);
    setCategories(cats || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sku = 'SKU' + Date.now().toString();
    const city = localStorage.getItem('agriflow_city') || '';
    const { data: { user } } = await supabase.auth.getUser();
    const { data: sellerData } = await supabase.from('sellers').select('*').eq('email', user.email).single();
    
    await supabase.from('products').insert({
      ...form, sku, added_by: sellerData.id, belonging_city: city, status: true, isappp: false,
    });

    setLoading(false);
    router.push('/seller/products');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow"><div className="max-w-7xl mx-auto px-4 py-4"><h1 className="text-xl font-bold text-green-600">Add Product</h1></div></nav>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div><label className="block text-sm font-medium">Product Name *</label><input type="text" required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} className="w-full p-3 border rounded-lg" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Category *</label><select required value={form.cat_id} onChange={(e) => setForm({ ...form, cat_id: e.target.value })} className="w-full p-3 border rounded-lg"><option value="">Select</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.category}</option>)}</select></div>
            <div><label className="block text-sm font-medium">MRP Price *</label><input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-3 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium">Selling Price</label><input type="number" step="0.01" value={form.sell_price} onChange={(e) => setForm({ ...form, sell_price: e.target.value })} className="w-full p-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium">Discount Price *</label><input type="number" step="0.01" required value={form.fa} onChange={(e) => setForm({ ...form, fa: e.target.value })} className="w-full p-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium">Quantity *</label><input type="number" required value={form.qty} onChange={(e) => setForm({ ...form, qty: parseInt(e.target.value) })} className="w-full p-3 border rounded-lg" /></div>
          </div>
          <div><label className="block text-sm font-medium">Short Description</label><textarea value={form.shrt_desc} onChange={(e) => setForm({ ...form, shrt_desc: e.target.value })} className="w-full p-3 border rounded-lg" rows={2} /></div>
          <div><label className="block text-sm font-medium">Full Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 border rounded-lg" rows={5} /></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50">{loading ? 'Saving...' : 'Submit for Approval'}</button>
        </form>
      </div>
    </div>
  );
}