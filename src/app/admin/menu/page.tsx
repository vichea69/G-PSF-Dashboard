'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { MenusList } from '@/features/menu/components/MenusList';
import { MenuItemsPanel } from '@/features/menu/components/MenuItemsPanel';
import {
  CreateMenuDialog,
  CreateMenuPayload
} from '@/features/menu/components/CreateMenuDialog';
import {
  CreateMenuItemDialog,
  CreateMenuItemPayload
} from '@/features/menu/components/CreateMenuItemDialog';
import { MenuGroup, MenuItem } from '@/features/menu/types';
import { mockMenus } from '@/features/menu/mock';
import { Menu as MenuIcon } from 'lucide-react';

// menus data are mocked locally for now

export default function Page() {
  const [menus, setMenus] = useState<MenuGroup[]>(mockMenus);
  const [selectedMenu, setSelectedMenu] = useState<MenuGroup | null>(menus[0]);

  const handleCreateMenu = (payload: CreateMenuPayload) => {
    const menu: MenuGroup = {
      id: Date.now().toString(),
      ...payload,
      items: [],
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMenus([...menus, menu]);
    setSelectedMenu(menu);
  };

  const handleCreateMenuItem = (payload: CreateMenuItemPayload) => {
    if (!selectedMenu) return;

    const menuItem: MenuItem = {
      id: Date.now().toString(),
      ...payload,
      order: selectedMenu.items.length + 1,
      isVisible: true
    };

    const updatedMenu = {
      ...selectedMenu,
      items: [...selectedMenu.items, menuItem]
    };

    setMenus(
      menus.map((menu) => (menu.id === selectedMenu.id ? updatedMenu : menu))
    );
    setSelectedMenu(updatedMenu);
  };

  const toggleItemVisibility = (itemId: string) => {
    if (!selectedMenu) return;

    const updatedMenu = {
      ...selectedMenu,
      items: selectedMenu.items.map((item) =>
        item.id === itemId ? { ...item, isVisible: !item.isVisible } : item
      )
    };

    setMenus(
      menus.map((menu) => (menu.id === selectedMenu.id ? updatedMenu : menu))
    );
    setSelectedMenu(updatedMenu);
  };

  const deleteMenuItem = (itemId: string) => {
    if (!selectedMenu) return;

    const updatedMenu = {
      ...selectedMenu,
      items: selectedMenu.items.filter((item) => item.id !== itemId)
    };

    setMenus(
      menus.map((menu) => (menu.id === selectedMenu.id ? updatedMenu : menu))
    );
    setSelectedMenu(updatedMenu);
  };

  const reorderItems = (nextItems: MenuGroup['items']) => {
    if (!selectedMenu) return;
    const updatedMenu = { ...selectedMenu, items: nextItems };
    setMenus(menus.map((m) => (m.id === selectedMenu.id ? updatedMenu : m)));
    setSelectedMenu(updatedMenu);
  };

  // rendering of menu items handled by MenuItemsPanel

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Menus'
            description='Create and manage navigation menus'
          />
          <div className='flex gap-2'>
            <CreateMenuDialog onCreate={handleCreateMenu} />
            {selectedMenu && (
              <CreateMenuItemDialog
                selectedMenu={selectedMenu}
                onCreate={handleCreateMenuItem}
              />
            )}
          </div>
        </div>
        <Separator />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Menu List */}
          <div className='lg:col-span-1'>
            <MenusList
              menus={menus}
              selectedMenuId={selectedMenu?.id}
              onSelect={(m) => setSelectedMenu(m)}
            />
          </div>

          {/* Menu Items */}
          <div className='lg:col-span-3'>
            {selectedMenu ? (
              <MenuItemsPanel
                selectedMenu={selectedMenu}
                onToggleVisibility={toggleItemVisibility}
                onDelete={deleteMenuItem}
                onReorder={reorderItems}
              />
            ) : (
              <div className='py-12 text-center'>
                <div className='bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                  <MenuIcon className='text-muted-foreground h-8 w-8' />
                </div>
                <h3 className='text-foreground mb-2 text-lg font-medium'>
                  Select a menu
                </h3>
                <p className='text-muted-foreground'>
                  Choose a menu from the left to manage its items
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
