'use client';

import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Menu as MenuIcon } from 'lucide-react';
import type { MenuItem, MenuGroup } from '@/features/menu/types';
import {
  MenuItemRow,
  type FlatMenuItem
} from '@/features/menu/components/MenuItemRow';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { setSequentialOrder } from '@/features/menu/utils/reorder';

/* ------------------------------------------------------------------ */
/*  Build a flat DFS list from the tree, skipping collapsed subtrees  */
/* ------------------------------------------------------------------ */

function buildFlatList(
  items: MenuItem[],
  collapsedIds: Set<string>
): FlatMenuItem[] {
  const result: FlatMenuItem[] = [];
  const norm = (p?: string) => p ?? '__root__';

  const childrenOf = (parentId?: string) =>
    items
      .filter((i) => norm(i.parentId) === norm(parentId))
      .sort((a, b) => a.order - b.order);

  const walk = (parentId: string | undefined, level: number) => {
    const children = childrenOf(parentId);
    children.forEach((item, idx) => {
      const hasChildren = items.some((i) => i.parentId === item.id);
      result.push({
        item,
        level,
        isLast: idx === children.length - 1,
        hasChildren
      });
      if (hasChildren && !collapsedIds.has(item.id)) {
        walk(item.id, level + 1);
      }
    });
  };

  walk(undefined, 0);
  return result;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface MenuItemsPanelProps {
  selectedMenu: MenuGroup;
  onEdit?: (itemId: string) => void;
  onToggleVisibility?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onReorder?: (nextItems: MenuGroup['items']) => void;
}

export function MenuItemsPanel({
  selectedMenu,
  onEdit,
  onToggleVisibility,
  onDelete,
  onReorder
}: MenuItemsPanelProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  /* ---------- flat list ------------------------------------------------ */

  const flatItems = useMemo(
    () => buildFlatList(selectedMenu.items, collapsedIds),
    [selectedMenu.items, collapsedIds]
  );

  /* ---------- expand / collapse ---------------------------------------- */

  const toggleExpand = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ---------- drag & drop ---------------------------------------------- */

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination || !onReorder) return;
      if (source.index === destination.index) return;

      const draggedFlat = flatItems[source.index];
      if (!draggedFlat) return;
      const draggedItem = draggedFlat.item;
      const oldParentId = draggedItem.parentId;

      // Remove source from flat list to find reference neighbour
      const withoutDragged = flatItems.filter((_, i) => i !== source.index);
      const adjustedDest =
        destination.index > source.index
          ? destination.index - 1
          : destination.index;

      // Decide new parent based on the item at the destination position
      const norm = (p?: string) => p ?? '__root__';
      let newParentId: string | undefined;

      if (withoutDragged.length === 0) {
        newParentId = undefined;
      } else if (adjustedDest >= withoutDragged.length) {
        newParentId = withoutDragged[withoutDragged.length - 1].item.parentId;
      } else {
        newParentId = withoutDragged[adjustedDest].item.parentId;
      }

      const targetKey = norm(newParentId);

      // Count same-parent siblings that appear above the drop position
      // so we know the insertion index among siblings
      const siblingsBeforeDest = withoutDragged
        .slice(0, adjustedDest)
        .filter((f) => norm(f.item.parentId) === targetKey).length;

      // Clone items with updated parentId for the dragged item
      let updatedItems = selectedMenu.items.map((item) =>
        item.id === draggedItem.id ? { ...item, parentId: newParentId } : item
      );

      // Re-order siblings under the NEW parent
      const newSiblings = updatedItems
        .filter(
          (i) => norm(i.parentId) === targetKey && i.id !== draggedItem.id
        )
        .sort((a, b) => a.order - b.order);

      const movedItem = updatedItems.find((i) => i.id === draggedItem.id)!;
      newSiblings.splice(siblingsBeforeDest, 0, movedItem);
      const reorderedNew = setSequentialOrder(newSiblings);
      const newMap = new Map(reorderedNew.map((i) => [i.id, i]));

      updatedItems = updatedItems.map((i) => {
        const u = newMap.get(i.id);
        return u ? { ...i, parentId: u.parentId, order: u.order } : i;
      });

      // Re-order siblings under the OLD parent if it changed
      const oldKey = norm(oldParentId);
      if (oldKey !== targetKey) {
        const oldSiblings = updatedItems
          .filter((i) => norm(i.parentId) === oldKey)
          .sort((a, b) => a.order - b.order);
        const reorderedOld = setSequentialOrder(oldSiblings);
        const oldMap = new Map(reorderedOld.map((i) => [i.id, i]));

        updatedItems = updatedItems.map((i) => {
          const u = oldMap.get(i.id);
          return u ? { ...i, order: u.order } : i;
        });
      }

      onReorder(updatedItems);
    },
    [flatItems, selectedMenu.items, onReorder]
  );

  /* ---------- empty state ---------------------------------------------- */

  if (selectedMenu.items.length === 0) {
    return (
      <Card>
        <CardContent className='py-12 text-center'>
          <div className='from-muted to-muted/50 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br'>
            <MenuIcon className='text-muted-foreground h-9 w-9' />
          </div>
          <h3 className='text-foreground mb-1 text-base font-medium'>
            No menu items yet
          </h3>
          <p className='text-muted-foreground mx-auto max-w-xs text-sm'>
            Add your first menu item to start building the navigation structure
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ---------- render --------------------------------------------------- */

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='text-foreground text-sm font-semibold'>
              {selectedMenu.name}
            </h2>
            <Badge variant='secondary' size='sm'>
              {selectedMenu.items.length} items
            </Badge>
            <Badge variant='outline' size='sm'>
              {selectedMenu.location}
            </Badge>
          </div>
        </div>
        <Separator className='mb-3' />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='flat-menu-items' type='ITEM'>
            {(provided) => (
              <div
                className='space-y-0.5'
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {flatItems.map((flat, index) => (
                  <MenuItemRow
                    key={flat.item.id}
                    flat={flat}
                    index={index}
                    isExpanded={!collapsedIds.has(flat.item.id)}
                    onToggleExpand={toggleExpand}
                    onEdit={onEdit}
                    onToggleVisibility={onToggleVisibility}
                    onDelete={onDelete}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
