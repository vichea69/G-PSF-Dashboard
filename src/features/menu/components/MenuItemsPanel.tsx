'use client';

import { Badge } from '@/components/ui/badge';
import { Menu as MenuIcon } from 'lucide-react';
import { MenuGroup } from '@/features/menu/types';
import { MenuItemRow } from '@/features/menu/components/MenuItemRow';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useMemo } from 'react';
import {
  reorderAll,
  reorderWithinSameParent
} from '@/features/menu/utils/reorder';

interface MenuItemsPanelProps {
  selectedMenu: MenuGroup;
  onToggleVisibility: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onReorder?: (nextItems: MenuGroup['items']) => void;
}

export function MenuItemsPanel({
  selectedMenu,
  onToggleVisibility,
  onDelete,
  onReorder
}: MenuItemsPanelProps) {
  const topLevelItems = useMemo(
    () =>
      selectedMenu.items
        .filter((item) => !item.parentId)
        .sort((a, b) => a.order - b.order),
    [selectedMenu.items]
  );

  const parentKey = (parentId?: string) =>
    parentId ? `parent:${parentId}` : 'parent:__root__';
  const parseParent = (droppableId: string): string | undefined => {
    const raw = droppableId.startsWith('parent:')
      ? droppableId.slice(7)
      : droppableId;
    return raw === '__root__' ? undefined : raw;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!onReorder) return;
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const all = selectedMenu.items;
    const active = all.find((i) => i.id === draggableId);
    if (!active) return;

    const sourceParent = parseParent(source.droppableId);
    const destParent = parseParent(destination.droppableId);

    const sameParent =
      (sourceParent ?? '__root__') === (destParent ?? '__root__');
    if (sameParent && source.index === destination.index) return;

    if (sameParent) {
      const next = reorderWithinSameParent(
        all,
        sourceParent,
        source.index,
        destination.index
      );
      toast.success('Menu reordered', {
        position: 'top-center'
      });
      onReorder(next);
      return;
    }

    // Move across parents
    const next = reorderAll(
      all,
      sourceParent,
      destParent,
      source.index,
      destination.index
    );
    toast('Menu reordered');
    onReorder(next);
  };

  if (selectedMenu.items.length === 0) {
    return (
      <div className='py-12 text-center'>
        <div className='bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
          <MenuIcon className='text-muted-foreground h-8 w-8' />
        </div>
        <h3 className='text-foreground mb-2 text-lg font-medium'>
          No menu items
        </h3>
        <p className='text-muted-foreground'>
          Add your first menu item to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-foreground text-lg font-semibold'>
          {selectedMenu.name} Items ({selectedMenu.items.length})
        </h2>
        <Badge variant='outline'>{selectedMenu.location}</Badge>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={parentKey(undefined)} type='ITEM'>
          {(provided) => (
            <div
              className='space-y-2'
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {topLevelItems.map((item, index) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  items={selectedMenu.items}
                  index={index}
                  onToggleVisibility={onToggleVisibility}
                  onDelete={onDelete}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
