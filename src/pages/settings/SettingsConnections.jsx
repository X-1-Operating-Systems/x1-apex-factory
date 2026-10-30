import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { SettingsCard } from '@/components/settings/SettingsUI';
import AccountKeyPanel from '@/components/account/AccountKeyPanel';

export default function SettingsConnections() {
  const [account, setAccount] = useState(null);

  const refresh = async () => {
    const res = await base44.functions.invoke('manusAgent', { action: 'account' });
    setAccount(res.data);
  };

  useEffect(() => {
    refresh().catch(() => setAccount({ ready: false }));
  }, []);

  return (
    <>
      <SettingsCard
        title="Execution engine"
        description="Sessions, agents and scheduled runs use this engine unless a session overrides it."
      >
        <AccountKeyPanel account={account} onRefresh={refresh} />
      </SettingsCard>

      <SettingsCard title="Apps & tools" description="External services your sessions can call.">
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          Connectors and plugins are managed on the Connectors page, where each tool can be installed and granted
          per workspace.
        </p>
        <Link
          to="/plugins"
          className="mt-2 inline-block text-[11.5px] underline underline-offset-2 hover:text-foreground"
        >
          Open connectors
        </Link>
      </SettingsCard>
    </>
  );
}