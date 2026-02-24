'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
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
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { MenuItem, getMenuLabelText } from '@/features/menu/types';
import { Draggable } from '@hello-pangea/dnd';

export interface FlatMenuItem {
  item: MenuItem;
  level: number;
  isLast: boolean;
  hasChildren: boolean;
}

interface MenuItemRowProps {
  flat: FlatMenuItem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
  onToggleVisibility?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
}

const TYPE_DOT_COLORS: Record<MenuItem['type'], string> = {
  page: 'bg-blue-400',
  external: 'bg-emerald-400',
  category: 'bg-violet-400',
  post: 'bg-amber-400',
  custom: 'bg-slate-400'
};

export function MenuItemRow({
  flat,
  index,
  isExpanded,
  onToggleExpand,
  onEdit,
  onToggleVisibility,
  onDelete
}: MenuItemRowProps) {
  const { item, level, isLast, hasChildren } = flat;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          {/* Tree connector wrapper */}
          <div
            className='relative'
            style={{ paddingLeft: level > 0 ? `${level * 24}px` : 0 }}
          >
            {/* Vertical line from parent */}
            {level > 0 && (
              <div
                className='border-border absolute border-l'
                style={{
                  left: `${(level - 1) * 24 + 11}px`,
                  top: 0,
                  bottom: isLast ? '50%' : 0
                }}
              />
            )}
            {/* Horizontal line to item */}
            {level > 0 && (
              <div
                className='border-border absolute border-t'
                style={{
                  left: `${(level - 1) * 24 + 11}px`,
                  top: '50%',
                  width: '13px'
                }}
              />
            )}

            {/* Row content */}
            <div
              className={`group flex items-center gap-2 rounded-md border px-2.5 py-2 transition-all duration-150 ${
                snapshot.isDragging
                  ? 'bg-card ring-primary/20 scale-[1.02] shadow-md ring-2'
                  : 'bg-card hover:bg-muted/50 hover:border-border border-transparent'
              } ${!item.isVisible ? 'opacity-60' : ''}`}
            >
              {/* Drag handle */}
              <div
                className='text-muted-foreground/50 hover:text-muted-foreground cursor-grab transition-colors'
                {...provided.dragHandleProps}
              >
                <GripVertical className='h-3.5 w-3.5' />
              </div>

              {/* Collapse toggle */}
              {hasChildren ? (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground hover:text-foreground -ml-0.5 h-5 w-5 p-0'
                  onClick={() => onToggleExpand(item.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className='h-3.5 w-3.5' />
                  ) : (
                    <ChevronRight className='h-3.5 w-3.5' />
                  )}
                </Button>
              ) : (
                <div className='w-5' />
              )}

              {/* Type dot */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${TYPE_DOT_COLORS[item.type] ?? TYPE_DOT_COLORS.custom}`}
                  />
                </TooltipTrigger>
                <TooltipContent side='top'>{item.type}</TooltipContent>
              </Tooltip>

              {/* Label & URL */}
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <span className='text-foreground truncate text-sm font-medium'>
                  {getMenuLabelText(item.label)}
                </span>
                {!item.isVisible && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <EyeOff className='text-muted-foreground h-3 w-3 shrink-0' />
                    </TooltipTrigger>
                    <TooltipContent side='top'>Hidden</TooltipContent>
                  </Tooltip>
                )}
                {item.openInNewTab && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ExternalLink className='text-muted-foreground h-3 w-3 shrink-0' />
                    </TooltipTrigger>
                    <TooltipContent side='top'>Opens in new tab</TooltipContent>
                  </Tooltip>
                )}
                <span className='text-muted-foreground hidden max-w-[200px] truncate font-mono text-xs sm:inline'>
                  {item.url}
                </span>
              </div>

              {/* Hover-reveal inline actions (desktop) */}
              <div className='flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-foreground h-7 w-7 p-0'
                        onClick={() => onEdit(item.id)}
                      >
                        <Edit className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>Edit</TooltipContent>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-destructive h-7 w-7 p-0'
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>Delete</TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Dropdown fallback */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-muted-foreground h-7 w-7 p-0 opacity-0 group-hover:opacity-100'
                  >
                    <MoreVertical className='h-3.5 w-3.5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(item.id)}>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onToggleVisibility && (
                    <DropdownMenuItem
                      onClick={() => onToggleVisibility(item.id)}
                    >
                      {item.isVisible ? (
                        <EyeOff className='mr-2 h-4 w-4' />
                      ) : (
                        <Eye className='mr-2 h-4 w-4' />
                      )}
                      {item.isVisible ? 'Hide' : 'Show'}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(item.id)}
                      variant='destructive'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
