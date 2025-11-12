import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export default function TabsDemo() {
  return (
    <div className='flex h-full items-center justify-center'>
      <Tabs
        defaultValue='profile'
        className='text-muted-foreground w-[375px] text-sm'
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='profile'>Khmer</TabsTrigger>
          <TabsTrigger value='notifications'>English</TabsTrigger>
        </TabsList>
        <TabsContent value='profile'>Content for Khmer lang</TabsContent>
        <TabsContent value='notifications'>
          Content for English lang
        </TabsContent>
      </Tabs>
    </div>
  );
}
