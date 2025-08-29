import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconCheck, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

type RoleRow = {
  title: string;
  modules: string[];
};

const ROLES: RoleRow[] = [
  {
    title: 'Webmaster',
    modules: ['Analytics', 'File Manager', 'Users & Permissions']
  },
  {
    title: 'Website Manager',
    modules: ['Site pages', 'Welcome', 'Statistical data', 'Cards', 'Tourism']
  },
  {
    title: 'Editor User',
    modules: ['Inbox', 'Ad. Banners', 'Site Menus', 'Site pages']
  },
  {
    title: 'Editor2',
    modules: ['Inbox', 'Ad. Banners', 'Site Menus']
  }
];

export default function UserRolePage() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex-col items-start justify-between gap-2 space-y-0 md:flex-row md:items-center'>
          <CardTitle className='text-xl'>Permissions</CardTitle>
          <Button className='gap-2'>
            <IconPlus className='h-4 w-4' /> New Permission
          </Button>
        </CardHeader>
        <CardContent>
          <div className='w-full overflow-x-auto'>
            <Table className='min-w-[900px]'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[200px] whitespace-nowrap'>
                    Title
                  </TableHead>
                  <TableHead className='whitespace-nowrap'>
                    Permissions
                  </TableHead>
                  <TableHead className='w-[120px] whitespace-nowrap'>
                    Status
                  </TableHead>
                  <TableHead className='w-[180px] text-right whitespace-nowrap'>
                    Options
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROLES.map((role) => (
                  <TableRow key={role.title}>
                    <TableCell className='align-top font-medium'>
                      {role.title}
                    </TableCell>
                    <TableCell className='space-y-2'>
                      <div className='flex flex-wrap items-center gap-2 text-xs'>
                        <Badge variant='outline' className='gap-1'>
                          <IconCheck className='h-3 w-3' /> ADD
                        </Badge>
                        <Badge variant='outline' className='gap-1'>
                          <IconCheck className='h-3 w-3' /> EDIT
                        </Badge>
                        <Badge variant='outline' className='gap-1'>
                          <IconCheck className='h-3 w-3' /> DELETE
                        </Badge>
                      </div>
                      <div className='text-muted-foreground line-clamp-3 text-sm md:line-clamp-none'>
                        {role.modules.join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <IconCheck className='h-4 w-4 text-emerald-600' />
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button variant='secondary' size='sm' className='gap-1'>
                          <IconEdit className='h-4 w-4' /> Edit
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          className='gap-1'
                        >
                          <IconTrash className='h-4 w-4' /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
