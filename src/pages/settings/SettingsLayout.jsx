import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bell, Database, Gauge, Palette, Plug, Shield, User, Users } from 'lucide-react';

const ITEMS = [
  { to: '/settings/profile', label: 'Profile', icon: User },
  { to: '/settings/appearance', label: 'Appearance', icon: Palette },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings/connections', label: 'Connections', icon: Plug },
  { to: '/settings/usage', label: 'Usage & credits', icon: Gauge },
  { to: '/settings/team', label: 'Team', icon: Users },
  { to: '/settings/security', label: 'Security', icon: Shield },
  { to: '/settings/data', label: 'Data controls', icon: Database },
];

export default function SettingsLayout() {
  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 py-8 lg:px-10 lg:py-10">
      <h1 className="text-[15px] font-medium">Settings</h1>
      <p className="mt-1 text-[11.5px] text-muted-foreground">Your account, workspace and studio defaults.</p>

      <div className="mt-4 lg:grid lg:grid-cols-[176px_1fr] lg:gap-6">
        <nav className="-mx-1 flex gap-0.5 overflow-x-auto scroll-thin px-1 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-[7px] text-[12px] transition-colors ${
                  isActive
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`
              }
            >
              <Icon size={14} strokeWidth={1.7} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 min-w-0 space-y-3 lg:mt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}