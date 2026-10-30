import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import AccountKeyPanel from '@/components/account/AccountKeyPanel';

export default function Account() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await base44.functions.invoke('manusAgent', { action: 'account' });
    setAccount(res.data);
  };

  useEffect(() => {
    let live = true;
    const boot = async () => {
      try {
        const me = await base44.auth.me();
        const res = await base44.functions.invoke('manusAgent', { action: 'account' });
        if (!live) return;
        setUser(me);
        setAccount(res.data);
      } finally {
        if (live) setLoading(false);
      }
    };
    boot();
    return () => {
      live = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 py-8 lg:px-10 lg:py-10">
      <h1 className="text-[15px] font-medium">Account</h1>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
        {user?.email} · signed in to X1 Apex Factory
      </p>

      <div className="mt-5">
        <AccountKeyPanel account={account} onRefresh={refresh} />
      </div>
    </div>
  );
}