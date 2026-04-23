'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function SellerWallet() {
  const supabase = createClient();
  const [seller, setSeller] = useState<any>(null);
  const [wallet, setWallet] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: sellerData } = await supabase.from('sellers').select('*, wallet:wallet(*)').eq('email', user.email).single();
    if (!sellerData) { router.push('/seller/register'); return; }
    setSeller(sellerData);
    setWallet(sellerData.wallet || 0);

    const { data } = await supabase.from('wallet_txn')
      .select('*')
      .eq('seller_id', sellerData.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setTransactions(data || []);
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    const amount = parseFloat(withdrawAmount);
    
    if (amount > wallet) {
      alert('Insufficient balance');
      return;
    }

    const { error } = await supabase.from('withdrawal_requests').insert({
      seller_id: seller.id,
      amount,
      status: 'pending',
    });

    if (error) {
      alert('Failed to request withdrawal');
      return;
    }

    await supabase.from('sellers').update({ wallet: wallet - amount }).eq('id', seller.id);
    await supabase.from('wallet_txn').insert({
      seller_id: seller.id,
      amount: -amount,
      type: 'withdrawal',
      description: `Withdrawal request`,
    });

    alert('Withdrawal request submitted');
    setWithdrawAmount('');
    loadData();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/seller" className="text-xl font-bold text-green-600">Agriflow Seller</Link>
          <Link href="/seller" className="text-gray-600 hover:text-green-600">Back</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-gray-500">Wallet Balance</p>
          <p className="text-4xl font-bold text-green-600">GH&#8373;{wallet}</p>
          <p className="text-sm text-gray-500 mt-2">Commission: {seller?.commission || 5}% per order</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Request Withdrawal</h2>
          <div className="flex gap-4">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > wallet}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Request
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
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
                    {txn.amount > 0 ? '+' : ''}GH&#8373;{txn.amount}
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