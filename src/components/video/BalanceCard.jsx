import React from 'react';
import { AlertTriangle, Wallet } from 'lucide-react';

const money = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export default function BalanceCard({ account, loading }) {
  const balance = account?.wallet?.remaining_balance;
  const empty = Number(balance) <= 0;

  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wallet size={13} className="text-muted-foreground" />
          <span className="text-[12px] font-medium">
            {account ? `${account.first_name || ''} ${account.last_name || ''}`.trim() || account.email : 'HeyGen account'}
          </span>
          {account?.billing_type && (
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
              {account.billing_type}
            </span>
          )}
        </div>
        <p className="font-heading text-[15px] tabular-nums">
          {loading && !account ? '…' : money(balance)}
          <span className="ml-1 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">wallet</span>
        </p>
      </div>
      {empty && account && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-[10.5px] leading-relaxed text-amber-700 dark:text-amber-500">
          <AlertTriangle size={11} className="mt-[1px] shrink-0" />
          The wallet is empty, so HeyGen refuses new renders. Everything else here works — top the wallet up
          and the render button starts producing video.
        </p>
      )}
    </section>
  );
}