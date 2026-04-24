'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function SellerProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: sellerData } = await supabase.from('sellers').select('*').eq('email', user.email).single();
    if (!sellerData) { router.push('/seller/register'); return; }
    
    const { data } = await supabase.from('products').select('*').eq('added_by', sellerData.id).order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('products').update({ status: !currentStatus }).eq('id', id);
    loadProducts();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/seller" className="text-xl font-bold text-green-600">Agriflow Seller</Link>
          <Link href="/seller/products/add" className="text-green-600">+ Add Product</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Products</h1>
          <Link href="/seller/products/add" className="bg-green-600 text-white px-4 py-2 rounded-lg">+ Add Product</Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">No products yet</p>
            <Link href="/seller/products/add" className="text-green-600">Add your first product</Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3">Product</th>
                  <th className="text-left px-6 py-3">Price</th>
                  <th className="text-left px-6 py-3">Stock</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-gray-500">{product.shrt_desc?.substring(0, 50)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-green-600">GH₵{product.fa}</p>
                      <p className="text-sm text-gray-400 line-through">GH₵{product.price}</p>
                    </td>
                    <td className="px-6 py-4">{product.qty}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${product.status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{product.status ? 'Active' : 'Inactive'}</span>
                      <br/>
                      <span className={`px-2 py-1 rounded text-sm ${product.isappp ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>{product.isappp ? 'Approved' : 'Pending'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleStatus(product.id, product.status)} className="text-green-600 mr-2">{product.status ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => deleteProduct(product.id)} className="text-red-500">Delete</button>
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