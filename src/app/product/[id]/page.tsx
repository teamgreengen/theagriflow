'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [qty, setQty] = useState(1);
  const supabase = createClient();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProduct(); }, []);
  
  const loadProduct = async () => {
    const { id } = await params;
    const { data } = await supabase.from('products').select('*, seller:sellers(f_name)').eq('id', id).single();
    setProduct(data);
    setLoading(false);
  };

  const addToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return window.location.href = '/login';
    let { data: cart } = await supabase.from('carts').select('*').eq('u_id', user.id).single();
    if (!cart) ({ data: cart } = await supabase.from('carts').insert({ u_id: user.id }).select().single());
    const { data: existing } = await supabase.from('cart_items').select('*').eq('cart_id', cart.id).eq('p_id', product.id).single();
    if (existing) await supabase.from('cart_items').update({ qty: existing.qty + qty }).eq('id', existing.id);
    else await supabase.from('cart_items').insert({ cart_id: cart.id, p_id: product.id, qty });
    window.location.href = '/cart';
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const discount = product.price > 0 ? Math.round(((product.price - product.fa) / product.price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
          {product.img1 ? <img src={product.img1} alt={product.product_name} className="object-cover w-full h-full" /> : <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
          {discount > 0 && <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded">{discount}% off</span>}
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.product_name}</h1>
          <p className="text-gray-500 mb-4">Sold by {product.seller?.f_name}</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl font-bold text-green-600">GH₵{product.fa}</span>
            <span className="text-lg text-gray-400 line-through">GH₵{product.price}</span>
          </div>
          <div className="mb-4">
            {product.qty > 0 ? <span className="text-green-600">In Stock ({product.qty} available)</span> : <span className="text-red-500">Out of Stock</span>}
          </div>
          {product.qty > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border rounded">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2">-</button>
                <span className="px-4">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-2">+</button>
              </div>
              <button onClick={addToCart} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                Add to Cart
              </button>
            </div>
          )}
          {product.shrt_desc && <div className="mt-6"><h3 className="font-semibold mb-2">Description</h3><p className="text-gray-600">{product.shrt_desc}</p></div>}
        </div>
      </div>
    </div>
  );
}