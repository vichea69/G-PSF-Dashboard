'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  GripVertical,
  MoreVertical,
  Edit,
  Trash2,
  EyeOff,
  Eye,
  ExternalLink,
  Link,
  FileText
} from 'lucide-react';
import { MenuItem } from '@/features/menu/types';
import { ReactNode } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';

interface MenuItemRowProps {
  item: MenuItem;
  items: MenuItem[];
  index: number;
  level?: number;
  actions?: ReactNode;
  onToggleVisibility: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

const getTypeIcon = (type: MenuItem['type']) => {
  switch (type) {
    case 'page':
      return <FileText className='h-3 w-3' />;
    case 'external':
      return <ExternalLink className='h-3 w-3' />;
    case 'category':
      return <GripVertical className='h-3 w-3' />;
    default:
      return <Link className='h-3 w-3' />;
  }
};

const getTypeBadge = (type: MenuItem['type']) => {
  switch (type) {
    case 'page':
      return { variant: 'info' as const, appearance: 'light' as const };
    case 'external':
      return { variant: 'success' as const, appearance: 'light' as const };
    case 'category':
      return { variant: 'primary' as const, appearance: 'light' as const };
    case 'post':
      return { variant: 'warning' as const, appearance: 'light' as const };
    default:
      return { variant: 'secondary' as const, appearance: 'light' as const };
  }
};

export function MenuItemRow({
  item,
  items,
  index,
  level = 0,
  onToggleVisibility,
  onDelete
}: MenuItemRowProps) {
  const children = items
    .filter((child) => child.parentId === item.id)
    .sort((a, b) => a.order - b.order);

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          className='space-y-2'
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div
            className='bg-card hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-all duration-200'
            style={{
              marginLeft: `${level * 20}px`,
              opacity: snapshot.isDragging ? 0.6 : undefined
            }}
          >
            <div
              className='text-muted-foreground cursor-grab'
              {...provided.dragHandleProps}
            >
              <GripVertical className='h-4 w-4' />
            </div>
            <div className='flex flex-1 items-center gap-3'>
              <Badge
                size='sm'
                {...getTypeBadge(item.type)}
                className='flex items-center gap-1'
              >
                {getTypeIcon(item.type)}
                {item.type}
              </Badge>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-foreground font-medium'>
                    {item.label}
                  </span>
                  {!item.isVisible && (
                    <EyeOff className='text-muted-foreground h-4 w-4' />
                  )}
                  {item.openInNewTab && (
                    <ExternalLink className='text-muted-foreground h-3 w-3' />
                  )}
                </div>
                <p className='text-muted-foreground text-sm'>{item.url}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground'
                >
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Edit className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleVisibility(item.id)}>
                  {item.isVisible ? (
                    <EyeOff className='mr-2 h-4 w-4' />
                  ) : (
                    <Eye className='mr-2 h-4 w-4' />
                  )}
                  {item.isVisible ? 'Hide' : 'Show'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  variant='destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Droppable droppableId={`parent:${item.id}`} type='ITEM'>
            {(dropProvided, dropSnapshot) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className='space-y-2'
              >
                {children.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: dropSnapshot.isDraggingOver
                        ? 'hsl(var(--muted))'
                        : 'transparent'
                    }}
                  />
                ) : (
                  children.map((child, idx) => (
                    <MenuItemRow
                      key={child.id}
                      item={child}
                      items={items}
                      index={idx}
                      level={level + 1}
                      onToggleVisibility={onToggleVisibility}
                      onDelete={onDelete}
                    />
                  ))
                )}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}
