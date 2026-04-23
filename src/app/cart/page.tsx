'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function CartPage() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('*, items:cart_items(*, product:products(*))')
      .eq('u_id', user.id)
      .single();

    setItems(cart?.items || []);
    setLoading(false);
  };

  const updateQty = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    await supabase.from('cart_items').update({ qty }).eq('id', itemId);
    loadCart();
  };

  const removeItem = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    loadCart();
  };

  const subtotal = items.reduce((sum, item) => sum + ((item.product?.fa || 0) * item.qty), 0);
  const deliveryFee = subtotal > 500 ? 0 : 20;
  const total = subtotal + deliveryFee;

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <a href="/" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg shadow">
              <div className="w-24 h-24 bg-gray-200 rounded" />
              <div className="flex-1">
                <h3 className="font-semibold">{item.product?.product_name}</h3>
                <p className="text-green-600 font-bold">GH₵{item.product?.fa}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 border rounded">-</button>
                  <span className="w-8 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 border rounded">+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-red-500">Remove</button>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>GH₵{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery Fee</span><span>GH₵{deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span><span>GH₵{total.toFixed(2)}</span>
            </div>
          </div>
          <a href="/checkout" className="block w-full mt-4 bg-green-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-green-700">
            Proceed to Checkout
          </a>
        </div>
      </div>
    </div>
  );
}