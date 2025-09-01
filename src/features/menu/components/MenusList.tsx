'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuGroup } from '@/features/menu/types';

interface MenusListProps {
  menus: MenuGroup[];
  selectedMenuId?: string;
  onSelect: (menu: MenuGroup) => void;
}

export function MenusList({ menus, selectedMenuId, onSelect }: MenusListProps) {
  return (
    <div className='space-y-2'>
      {menus.map((menu) => (
        <Card
          key={menu.id}
          className={`cursor-pointer transition-all duration-200 ${
            selectedMenuId === menu.id
              ? 'ring-primary ring-2'
              : 'hover:bg-muted/50'
          }`}
          onClick={() => onSelect(menu)}
        >
          <CardContent className='p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-foreground font-medium'>{menu.name}</h3>
              <Badge
                size='sm'
                appearance='light'
                variant={menu.isActive ? 'success' : 'secondary'}
              >
                {menu.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className='text-muted-foreground mb-2 text-sm'>
              {menu.description}
            </p>
            <div className='text-muted-foreground flex items-center justify-between text-xs'>
              <span>{menu.location}</span>
              <span>{menu.items.length} items</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
