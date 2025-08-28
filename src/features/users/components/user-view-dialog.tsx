'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserRow } from './user-tables/columns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RelativeTime } from '@/components/ui/relative-time';

export function UserViewDialog({
  open,
  onOpenChange,
  user
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRow;
}) {
  const initials = (user.username || user.email || 'US')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Quick view of user information.</DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-3'>
          <Avatar className='h-12 w-12 rounded-lg'>
            {user.image && <AvatarImage src={user.image} alt={user.username} />}
            <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>{user.username || '-'}</span>
            <span className='text-muted-foreground text-sm'>{user.email}</span>
          </div>
          <Badge variant='secondary' className='ml-auto capitalize'>
            {user.role}
          </Badge>
        </div>

        <Separator />

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <Field label='Username' value={user.username} />
          <Field label='Email' value={user.email} />
          <Field label='Role' value={user.role} />
          <Field
            label='Last Login'
            value={<RelativeTime value={user.lastLogin} short />}
          />
          {user.bio && (
            <Field label='Bio' value={user.bio} className='sm:col-span-2' />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  className
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className='text-muted-foreground text-xs font-medium'>{label}</div>
      <div className='text-sm'>{value || '-'}</div>
    </div>
  );
}
