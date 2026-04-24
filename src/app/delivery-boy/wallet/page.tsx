'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function DeliveryBoyWallet() {
  const supabase = createClient();
  const [deliveryBoy, setDeliveryBoy] = useState<any>(null);
  const [wallet, setWallet] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: dvData } = await supabase.from('delivery_boys').select('*').eq('email', user.email).single();
    if (!dvData) { router.push('/delivery-boy/register'); return; }
    setDeliveryBoy(dvData);
    setWallet(dvData.wallet || 0);

    const { data } = await supabase.from('wallet_txn')
      .select('*')
      .eq('delivery_boy_id', dvData.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setTransactions(data || []);
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/delivery-boy" className="text-xl font-bold text-green-600">Agriflow Delivery</Link>
          <Link href="/delivery-boy" className="text-gray-600 hover:text-green-600">Back</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-gray-500">Wallet Balance</p>
          <p className="text-4xl font-bold text-green-600">GH₵{wallet}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-medium">{txn.description || txn.type}</p>
                    <p className="text-sm text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.amount > 0 ? '+' : ''}GH₵{txn.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}