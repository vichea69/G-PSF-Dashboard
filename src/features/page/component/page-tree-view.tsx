import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  formatDateTime,
  getLocalizedText,
  type LocalizedText
} from '@/lib/helpers';
import {
  CheckCircle2,
  CircleDashed,
  FileText,
  FolderTree,
  Layers3,
  Tag
} from 'lucide-react';

type PageTreeCategory = {
  id: number;
  name?: LocalizedText;
  description?: LocalizedText;
};

type PageTreePost = {
  id: number;
  title?: LocalizedText;
  description?: LocalizedText | null;
  slug?: string;
  status?: string;
  isFeatured?: boolean;
  publishedAt?: string | null;
  expiredAt?: string | null;
  category?: {
    id: number;
    name?: LocalizedText;
  } | null;
};

type PageTreeSection = {
  id: number;
  blockType?: string;
  title?: LocalizedText;
  description?: LocalizedText | null;
  orderIndex?: number;
  enabled?: boolean;
  counts?: {
    posts?: number;
    categories?: number;
  };
  categories?: PageTreeCategory[];
  posts?: PageTreePost[];
};

export type PageTreeData = {
  page?: {
    id?: number;
    title?: LocalizedText;
    slug?: string;
    status?: string;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  counts?: {
    sections?: number;
    posts?: number;
    categories?: number;
  };
  categories?: PageTreeCategory[];
  sections?: PageTreeSection[];
};

const toArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? value : [];

function getText(value?: LocalizedText | null, fallback = '-') {
  const preferred = getLocalizedText(value ?? '', 'en').trim();
  if (preferred) return preferred;

  if (value && typeof value === 'object') {
    const km = String(value.km ?? '').trim();
    if (km) return km;
  }

  return fallback;
}

function getSecondaryText(value?: LocalizedText | null) {
  if (!value || typeof value !== 'object') return '';

  const primary = getText(value, '').trim();
  const km = String(value.km ?? '').trim();

  if (!km || km === primary) return '';
  return km;
}

function formatBlockType(value?: string) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .trim();
}

function formatOptionalDate(value?: string | null) {
  if (!value) return '-';
  try {
    return formatDateTime(value);
  } catch {
    return value;
  }
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = String(status ?? '').toLowerCase();
  const isPublished = normalized === 'published';

  return (
    <Badge
      variant={isPublished ? 'success' : 'warning'}
      appearance='outline'
      className='gap-1'
    >
      {isPublished ? (
        <CheckCircle2 className='h-3 w-3' />
      ) : (
        <CircleDashed className='h-3 w-3' />
      )}
      {isPublished ? 'Published' : 'Draft'}
    </Badge>
  );
}

function EnabledBadge({ enabled }: { enabled?: boolean }) {
  const isEnabled = Boolean(enabled);

  return (
    <Badge
      variant={isEnabled ? 'success' : 'warning'}
      appearance='outline'
      className='gap-1'
    >
      {isEnabled ? (
        <CheckCircle2 className='h-3 w-3' />
      ) : (
        <CircleDashed className='h-3 w-3' />
      )}
      {isEnabled ? 'Enabled' : 'Disabled'}
    </Badge>
  );
}

function LocalizedTextStack({
  value,
  fallback = '-'
}: {
  value?: LocalizedText | null;
  fallback?: string;
}) {
  const primary = getText(value, fallback);
  const secondary = getSecondaryText(value);

  return (
    <div className='space-y-1'>
      <p className='font-medium break-words'>{primary}</p>
      {secondary ? (
        <p className='text-muted-foreground text-sm break-words'>{secondary}</p>
      ) : null}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon
}: {
  title: string;
  value: number;
  icon: typeof FolderTree;
}) {
  return (
    <Card className='gap-3 py-4'>
      <CardContent className='flex items-center justify-between px-4'>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-sm'>{title}</p>
          <p className='text-2xl font-semibold'>{value}</p>
        </div>
        <div className='bg-muted text-muted-foreground rounded-lg p-2'>
          <Icon className='h-4 w-4' />
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryList({ categories }: { categories: PageTreeCategory[] }) {
  if (categories.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>No categories linked.</p>
    );
  }

  return (
    <div className='space-y-3'>
      {categories.map((category) => (
        <div
          key={category.id}
          className='rounded-lg border border-dashed p-3 text-sm'
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <LocalizedTextStack value={category.name} />
              {getText(category.description, '') ? (
                <p className='text-muted-foreground mt-2 break-words'>
                  {getText(category.description, '')}
                </p>
              ) : null}
            </div>
            <Badge variant='secondary' appearance='light'>
              #{category.id}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostTreeCard({ post }: { post: PageTreePost }) {
  const categoryName = getText(post.category?.name, '');

  return (
    <div className='rounded-lg border p-3'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div className='min-w-0 flex-1 space-y-2'>
          <LocalizedTextStack value={post.title} />

          <div className='flex flex-wrap gap-2'>
            <StatusBadge status={post.status} />
            <Badge variant='secondary' appearance='light'>
              Post #{post.id}
            </Badge>
            {post.isFeatured ? (
              <Badge variant='primary' appearance='light'>
                Featured
              </Badge>
            ) : null}
            {categoryName ? (
              <Badge variant='info' appearance='light' className='gap-1'>
                <Tag className='h-3 w-3' />
                {categoryName}
              </Badge>
            ) : null}
          </div>

          {post.slug ? (
            <p className='text-muted-foreground font-mono text-xs break-all'>
              /{post.slug}
            </p>
          ) : null}

          {getText(post.description, '') ? (
            <p className='text-muted-foreground text-sm break-words'>
              {getText(post.description, '')}
            </p>
          ) : null}

          <div className='text-muted-foreground flex flex-col gap-1 text-xs'>
            <p>Published: {formatOptionalDate(post.publishedAt)}</p>
            <p>Expired: {formatOptionalDate(post.expiredAt)}</p>
          </div>
        </div>

        <Button asChild variant='outline' size='sm' className='h-8 shrink-0'>
          <Link href={`/admin/post/${post.id}`}>Open Post</Link>
        </Button>
      </div>
    </div>
  );
}

function SectionTreeCard({ section }: { section: PageTreeSection }) {
  const categories = toArray<PageTreeCategory>(section.categories);
  const posts = toArray<PageTreePost>(section.posts);

  return (
    <div className='relative pl-6'>
      <span className='bg-border absolute top-0 bottom-0 left-2 w-px' />
      <span className='bg-border absolute top-6 left-2 h-px w-4' />

      <Card className='gap-4 py-4'>
        <CardHeader className='px-4 pb-0'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
            <div className='min-w-0 flex-1 space-y-2'>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='secondary' appearance='light'>
                  Section #{section.id}
                </Badge>
                <Badge variant='outline'>
                  {formatBlockType(section.blockType)}
                </Badge>
                <Badge variant='outline'>Order {section.orderIndex ?? 0}</Badge>
                <EnabledBadge enabled={section.enabled} />
              </div>

              <LocalizedTextStack value={section.title} />

              {getText(section.description, '') ? (
                <p className='text-muted-foreground text-sm break-words'>
                  {getText(section.description, '')}
                </p>
              ) : null}
            </div>

            <Button
              asChild
              variant='outline'
              size='sm'
              className='h-8 shrink-0'
            >
              <Link href={`/admin/section/${section.id}`}>Open Section</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className='space-y-4 px-4'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <div className='bg-muted/20 rounded-lg border p-3'>
              <div className='mb-3 flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <Tag className='h-4 w-4' />
                  Categories
                </div>
                <Badge variant='secondary' appearance='light'>
                  {section.counts?.categories ?? categories.length}
                </Badge>
              </div>
              <CategoryList categories={categories} />
            </div>

            <div className='bg-muted/20 rounded-lg border p-3'>
              <div className='mb-3 flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <FileText className='h-4 w-4' />
                  Posts
                </div>
                <Badge variant='secondary' appearance='light'>
                  {section.counts?.posts ?? posts.length}
                </Badge>
              </div>

              {posts.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                  No posts linked.
                </p>
              ) : (
                <div className='space-y-3'>
                  {posts.map((post) => (
                    <PostTreeCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PageTreeView({
  pageId,
  data
}: {
  pageId: string;
  data: PageTreeData;
}) {
  const page = data.page ?? {};
  const categories = toArray<PageTreeCategory>(data.categories);
  const sections = toArray<PageTreeSection>(data.sections).sort((a, b) => {
    const orderDiff = (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return a.id - b.id;
  });

  const counts = {
    sections: data.counts?.sections ?? sections.length,
    posts:
      data.counts?.posts ??
      sections.reduce((total, section) => {
        return total + toArray<PageTreePost>(section.posts).length;
      }, 0),
    categories: data.counts?.categories ?? categories.length
  };

  const editPageId = String(page.id ?? pageId);

  return (
    <div className='space-y-6'>
      <Card className='gap-4 py-5'>
        <CardHeader className='px-5 pb-0 sm:px-6'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='space-y-3'>
              <Badge
                variant='primary'
                appearance='light'
                className='w-fit gap-1'
              >
                <FolderTree className='h-3 w-3' />
                Page Tree
              </Badge>

              <div className='space-y-1'>
                <CardTitle className='text-2xl'>
                  {getText(page.title, 'Untitled page')}
                </CardTitle>
                {getSecondaryText(page.title) ? (
                  <CardDescription>
                    {getSecondaryText(page.title)}
                  </CardDescription>
                ) : null}
              </div>
            </div>

            <Button
              asChild
              variant='outline'
              size='sm'
              className='h-8 shrink-0'
            >
              <Link href={`/admin/page/${encodeURIComponent(editPageId)}`}>
                Edit Page
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className='grid gap-4 px-5 sm:px-6 lg:grid-cols-2'>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground min-w-20'>Slug</span>
              <code className='bg-muted rounded px-2 py-1 text-xs'>
                /{page.slug || '-'}
              </code>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground min-w-20'>Status</span>
              <StatusBadge status={page.status} />
            </div>
          </div>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground min-w-24'>Published</span>
              <span>{formatOptionalDate(page.publishedAt)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground min-w-24'>Updated</span>
              <span>{formatOptionalDate(page.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 sm:grid-cols-3'>
        <SummaryCard title='Sections' value={counts.sections} icon={Layers3} />
        <SummaryCard title='Posts' value={counts.posts} icon={FileText} />
        <SummaryCard title='Categories' value={counts.categories} icon={Tag} />
      </div>

      <div className='grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]'>
        <Card className='gap-4 py-5'>
          <CardHeader className='px-5 pb-0'>
            <CardTitle className='text-base'>Page Categories</CardTitle>
            <CardDescription>
              Categories directly linked to this page.
            </CardDescription>
          </CardHeader>
          <CardContent className='px-5'>
            <CategoryList categories={categories} />
          </CardContent>
        </Card>

        <Card className='gap-4 py-5'>
          <CardHeader className='px-5 pb-0'>
            <CardTitle className='text-base'>Section Tree</CardTitle>
            <CardDescription>
              Sections on this page and the posts/categories connected to them.
            </CardDescription>
          </CardHeader>

          <CardContent className='px-5'>
            {sections.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                No sections linked to this page.
              </p>
            ) : (
              <div className='space-y-4'>
                {sections.map((section) => (
                  <SectionTreeCard key={section.id} section={section} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
