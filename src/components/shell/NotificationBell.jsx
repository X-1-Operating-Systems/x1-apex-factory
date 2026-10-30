import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Bell, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [page, count] = await Promise.all([
      base44.entities.Notification.filter({}, { sort: '-created_date', limit: 8 }),
      base44.entities.Notification.count({ read: false }),
    ]);
    setItems(page.items);
    setUnread(count);
  };

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.Notification.subscribe(() => load());
    return unsubscribe;
  }, []);

  const openItem = async (item) => {
    if (!item.read) {
      await base44.entities.Notification.update(item.id, { read: true });
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      setUnread((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (item.href) navigate(item.href);
  };

  const markAll = async () => {
    await base44.entities.Notification.updateMany({ read: false }, { $set: { read: true } });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
          className="relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <Bell size={15} strokeWidth={1.8} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid h-3.5 min-w-[14px] place-items-center rounded-full bg-foreground px-1 text-[9px] font-semibold text-background">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-[12px] font-medium">Notifications</p>
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Check size={10} /> Mark all read
          </button>
        </div>

        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-[11.5px] text-muted-foreground">
            Nothing yet. Task, automation and release updates land here.
          </p>
        ) : (
          <div className="max-h-[320px] overflow-y-auto scroll-thin">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item)}
                className="flex w-full gap-2 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-secondary/60"
              >
                <span className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${item.read ? 'bg-border' : 'bg-foreground'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-medium">{item.title}</span>
                  {item.body && <span className="mt-0.5 block line-clamp-2 text-[10.5px] leading-relaxed text-muted-foreground">{item.body}</span>}
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">{moment(item.created_date).fromNow()}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => { setOpen(false); navigate('/notifications'); }}
          className="block w-full border-t border-border px-3 py-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          View all notifications
        </button>
      </PopoverContent>
    </Popover>
  );
}