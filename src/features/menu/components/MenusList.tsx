'use client';

import Link from 'next/link';
import { MenuGroup } from '@/features/menu/types';

interface MenusListProps {
  menus: MenuGroup[];
  activeSlug?: string;
}

export function MenusList({ menus, activeSlug }: MenusListProps) {
  return (
    <div className='space-y-0.5'>
      {menus.map((menu) => {
        const isActive = activeSlug === menu.slug;
        return (
          <Link key={menu.id} href={`/admin/menu/${menu.slug}`}>
            <div
              className={`flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 transition-all duration-150 ${
                isActive
                  ? 'border-l-primary bg-primary/5'
                  : 'hover:bg-muted/50 border-l-transparent'
              }`}
              title={menu.description || undefined}
            >
              {/* Active/inactive dot */}
              <div
                className={`h-2 w-2 shrink-0 rounded-full ${
                  menu.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                }`}
              />
              {/* Menu name + item count */}
              <div className='flex min-w-0 flex-1 items-center justify-between gap-2'>
                <span
                  className={`truncate text-sm ${
                    isActive
                      ? 'text-foreground font-semibold'
                      : 'text-foreground font-medium'
                  }`}
                >
                  {menu.name}
                </span>
                <span className='text-muted-foreground shrink-0 text-xs'>
                  {menu.items.length}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
