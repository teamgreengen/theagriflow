'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function CheckoutPage() {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentType, setPaymentType] = useState('cod');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login?redirect=/checkout'); return; }
    setUser(user);
    loadData();
  };

  const loadData = async () => {
    const { data: addr } = await supabase.from('addresses').select('*').eq('uid', user?.id);
    setAddresses(addr || []);
    const { data: cart } = await supabase.from('carts').select('*, items:cart_items(*, product:products(*))').eq('u_id', user?.id).single();
    setCartItems(cart?.items || []);
  };

  const placeOrder = async () => {
    setLoading(true);
    const city = localStorage.getItem('agriflow_city') || 'default';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let oId = 'OD';
    for (let i = 0; i < 2; i++) oId += chars[Math.floor(Math.random() * chars.length)];
    for (let i = 0; i < 2; i++) oId += numbers[Math.floor(Math.random() * numbers.length)];
    oId += Date.now().toString();

    let totalAmt = 0;
    for (const item of cartItems) totalAmt += (item.product?.fa || 0) * item.qty;
    const shipFee = totalAmt > 500 ? 0 : 20;
    const finalVal = totalAmt + shipFee;

    const { data: order } = await supabase.from('orders').insert({
      o_id: oId, u_id: user.id, ad_id: selectedAddress,
      dv_date: deliveryDate, dv_time: deliveryTime, payment_type: paymentType,
      total_amt: totalAmt, ship_fee_order: shipFee, final_val: finalVal,
      belonging_city: city, order_status: 1,
    }).select().single();

    for (const item of cartItems) {
      await supabase.from('order_details').insert({ oid: order.id, p_id: item.p_id, qty: item.qty });
    }

    const { data: cart } = await supabase.from('carts').select('id').eq('u_id', user.id).single();
    if (cart) await supabase.from('cart_items').delete().eq('cart_id', cart.id);

    setLoading(false);
    router.push(`/order/${order.o_id}`);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.product?.fa || 0) * item.qty), 0);
  const deliveryFee = subtotal > 500 ? 0 : 20;
  const total = subtotal + deliveryFee;

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="flex mb-8">
        {['Address', 'Delivery', 'Payment'].map((s, i) => (
          <div key={s} className={`flex-1 text-center ${i + 1 <= step ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`inline-block w-8 h-8 rounded-full ${i + 1 <= step ? 'bg-green-600 text-white' : 'bg-gray-200'} mr-2`}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Delivery Address</h2>
          {addresses.map((addr) => (
            <div key={addr.id} onClick={() => setSelectedAddress(addr.id)}
              className={`p-4 border rounded-lg cursor-pointer ${selectedAddress === addr.id ? 'border-green-500 bg-green-50' : ''}`}>
              <p className="font-medium">{addr.user_name}</p>
              <p className="text-gray-600">{addr.user_add}, {addr.user_city}</p>
            </div>
          ))}
          <Link href="/account/address/new" className="block text-green-600">+ Add new address</Link>
          <button onClick={() => setStep(2)} disabled={!selectedAddress}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Delivery Date & Time</h2>
          <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full p-3 border rounded-lg" />
          <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="w-full p-3 border rounded-lg">
            <option value="">Select time slot</option>
            <option value="morning">Morning (8am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 4pm)</option>
            <option value="evening">Evening (4pm - 8pm)</option>
          </select>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-3 border rounded-lg">Back</button>
            <button onClick={() => setStep(3)} disabled={!deliveryDate || !deliveryTime}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <div onClick={() => setPaymentType('cod')} className={`p-4 border rounded-lg cursor-pointer ${paymentType === 'cod' ? 'border-green-500 bg-green-50' : ''}`}>
            <p className="font-medium">Cash on Delivery</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between"><span>Subtotal</span><span>GH&#8373;{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>GH&#8373;{deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2"><span>Total</span><span>GH&#8373;{total.toFixed(2)}</span></div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex-1 py-3 border rounded-lg">Back</button>
            <button onClick={placeOrder} disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50">
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}