import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, Gauge } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AccountMenu({ user, initials }) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[10.5px] font-medium transition-colors hover:bg-accent"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel className="pb-1">
          <p className="truncate text-[12px] font-medium">{user?.full_name || 'Studio operator'}</p>
          <p className="truncate text-[10.5px] font-normal text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings/profile')} className="gap-2 text-[12px]">
          <User size={13} /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings/usage')} className="gap-2 text-[12px]">
          <Gauge size={13} /> Usage &amp; credits
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 text-[12px]">
          <Settings size={13} /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => base44.auth.logout()} className="gap-2 text-[12px]">
          <LogOut size={13} /> Sign out
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 text-[12px]">
          <Link to="/" className="w-full">New task</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}