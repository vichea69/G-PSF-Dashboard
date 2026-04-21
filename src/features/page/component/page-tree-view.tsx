'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { usePermissions } from '@/context/permission-context';
import { useLanguage, type Language } from '@/context/language-context';
import { useTranslate } from '@/hooks/use-translate';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import {
  formatDateTime,
  getLocalizedText,
  type LocalizedText
} from '@/lib/helpers';
import { deletePost } from '@/server/action/post/post';
import {
  ExternalLink,
  CheckCircle2,
  CircleDashed,
  FileText,
  FolderTree,
  Layers3,
  Plus,
  Tag,
  Trash2
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

function getText(
  value: LocalizedText | null | undefined,
  language: Language,
  fallback = '-'
) {
  const text = getLocalizedText(value ?? '', language).trim();
  return text || fallback;
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
  const { t } = useTranslate();
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
      {isPublished ? t('page.status.published') : t('page.status.draft')}
    </Badge>
  );
}

function EnabledBadge({ enabled }: { enabled?: boolean }) {
  const { t } = useTranslate();
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
      {isEnabled ? t('page.tree.enabled') : t('page.tree.disabled')}
    </Badge>
  );
}

function LocalizedTextStack({
  value,
  language,
  fallback = '-'
}: {
  value?: LocalizedText | null;
  language: Language;
  fallback?: string;
}) {
  return (
    <p className='font-medium break-words'>
      {getText(value, language, fallback)}
    </p>
  );
}

function TreeIconBadge({
  icon: Icon,
  variant = 'secondary',
  className = 'h-8 w-8 rounded-lg'
}: {
  icon: typeof FolderTree;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  className?: string;
}) {
  return (
    <Badge
      variant={variant}
      appearance='light'
      className={`shrink-0 justify-center p-0 ${className}`}
    >
      <Icon className='h-4 w-4' />
    </Badge>
  );
}

function OpenLinkBadge({ href, label }: { href: string; label: string }) {
  return (
    <Badge
      asChild
      variant='primary'
      size='md'
      appearance='light'
      className='shrink-0'
    >
      <Link href={href} aria-label={label} title={label}>
        <ExternalLink className='h-3 w-3' />
      </Link>
    </Badge>
  );
}

function DeleteIconBadge({
  onClick,
  label
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Badge
      asChild
      variant='destructive'
      size='md'
      appearance='light'
      className='hover:bg-destructive/10 shrink-0 transition-colors'
    >
      <button
        type='button'
        onClick={onClick}
        aria-label={label}
        title={label}
        className='cursor-pointer'
      >
        <Trash2 className='h-3 w-3' />
      </button>
    </Badge>
  );
}

function AddLinkBadge({ href, label }: { href: string; label: string }) {
  const { t } = useTranslate();
  return (
    <Button asChild size='sm' className='shrink-0 gap-1'>
      <Link href={href} aria-label={label} title={label}>
        <Plus className='h-3 w-3' />
        {t('page.tree.addSection')}
      </Link>
    </Button>
  );
}

function AddPostLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild size='sm' className='shrink-0 gap-1'>
      <Link href={href} aria-label={label} title={label}>
        <Plus className='h-3 w-3' />
        {label}
      </Link>
    </Button>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconVariant
}: {
  title: string;
  value: number;
  icon: typeof FolderTree;
  iconVariant: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}) {
  return (
    <Card className='gap-3 py-4'>
      <CardContent className='flex items-center justify-between px-4'>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-sm'>{title}</p>
          <p className='text-2xl font-semibold'>{value}</p>
        </div>
        <TreeIconBadge icon={Icon} variant={iconVariant} />
      </CardContent>
    </Card>
  );
}

function CategoryList({ categories }: { categories: PageTreeCategory[] }) {
  const { language } = useLanguage();
  const { t } = useTranslate();

  if (categories.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>
        {t('page.tree.noCategoriesLinked')}
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {categories.map((category) => (
        <Card
          key={category.id}
          className='gap-0 border-dashed py-0 text-sm shadow-none'
        >
          <CardContent className='p-3'>
            <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
              <div className='min-w-0 flex-1'>
                <p className='font-medium break-words'>
                  {getText(category.name, language)}
                </p>
              </div>
              <OpenLinkBadge
                href={`/admin/category/${category.id}`}
                label={t('page.tree.openCategory')}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PostTreeCard({ post }: { post: PageTreePost }) {
  const router = useRouter();
  const { can } = usePermissions();
  const { language } = useLanguage();
  const { t } = useTranslate();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const categoryName = getText(post.category?.name, language, '');
  const canDeletePost = can(
    adminRoutePermissions.posts.delete.resource,
    adminRoutePermissions.posts.delete.action
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);

      if (!result.success) {
        throw new Error(result.error || t('page.tree.postDeleteFailed'));
      }

      toast.success(t('page.tree.postDeleted'));
      setOpenDeleteModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || t('page.tree.postDeleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />

      <Card className='gap-0 py-0 shadow-none'>
        <CardContent className='p-3'>
          <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
            <div className='min-w-0 flex-1 space-y-2'>
              <LocalizedTextStack value={post.title} language={language} />

              <div className='flex flex-wrap gap-2'>
                <StatusBadge status={post.status} />
                {post.isFeatured ? (
                  <Badge variant='primary' appearance='light'>
                    {t('page.tree.featured')}
                  </Badge>
                ) : null}
                {categoryName ? (
                  <Badge variant='info' appearance='light' className='gap-1'>
                    <Tag className='h-3 w-3' />
                    {categoryName}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {canDeletePost ? (
                <DeleteIconBadge
                  onClick={() => setOpenDeleteModal(true)}
                  label={t('page.tree.deletePost')}
                />
              ) : null}
              <OpenLinkBadge
                href={`/admin/post/${post.id}`}
                label={t('page.tree.openPost')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function SectionTreeCard({
  section,
  pageId
}: {
  section: PageTreeSection;
  pageId: string;
}) {
  const { language } = useLanguage();
  const { t } = useTranslate();
  const categories = toArray<PageTreeCategory>(section.categories);
  const posts = toArray<PageTreePost>(section.posts);

  return (
    <div className='relative pl-6'>
      <span className='bg-border absolute top-0 bottom-0 left-2 w-px' />
      <span className='bg-border absolute top-6 left-2 h-px w-4' />

      <Card className='relative gap-0 overflow-hidden py-0'>
        <div className='absolute top-4 right-10 z-10 flex items-center gap-2'>
          <OpenLinkBadge
            href={`/admin/section/${section.id}`}
            label={t('page.tree.openSection')}
          />
          <EnabledBadge enabled={section.enabled} />
        </div>

        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value={`section-${section.id}`} className='border-b-0'>
            <AccordionTrigger className='px-4 py-4 pr-40 hover:no-underline sm:pr-48 [&>svg]:hidden'>
              <div className='min-w-0 flex-1 space-y-2'>
                <div className='flex min-w-0 flex-wrap gap-2'>
                  <Badge variant='outline'>
                    {formatBlockType(section.blockType)}
                  </Badge>
                </div>

                <LocalizedTextStack value={section.title} language={language} />
              </div>
            </AccordionTrigger>

            <AccordionContent className='px-4 pb-4'>
              <div className='grid gap-4 xl:grid-cols-2'>
                <Card className='bg-muted/20 gap-0 py-0 shadow-none'>
                  <CardContent className='p-3'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-2 text-sm font-medium'>
                        <TreeIconBadge
                          icon={Tag}
                          variant='warning'
                          className='h-7 w-7 rounded-md'
                        />
                        {t('page.tree.categories')}
                      </div>
                    </div>
                    <CategoryList categories={categories} />
                  </CardContent>
                </Card>

                <Card className='bg-muted/20 gap-0 py-0 shadow-none'>
                  <CardContent className='p-3'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-2 text-sm font-medium'>
                        <TreeIconBadge
                          icon={FileText}
                          variant='success'
                          className='h-7 w-7 rounded-md'
                        />
                        {t('page.tree.posts')}
                      </div>
                      <AddPostLinkButton
                        href={`/admin/post/new?pageId=${encodeURIComponent(pageId)}&sectionId=${encodeURIComponent(String(section.id))}`}
                        label={t('page.addNew')}
                      />
                    </div>

                    {posts.length === 0 ? (
                      <p className='text-muted-foreground text-sm'>
                        {t('page.tree.noPostsLinked')}
                      </p>
                    ) : (
                      <div className='space-y-3'>
                        {posts.map((post) => (
                          <PostTreeCard key={post.id} post={post} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
  const { can } = usePermissions();
  const { language } = useLanguage();
  const { t } = useTranslate();
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

  const canCreateSection = can(
    adminRoutePermissions.sections.create.resource,
    adminRoutePermissions.sections.create.action
  );
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
                {t('page.tree.badge')}
              </Badge>

              <div className='space-y-1'>
                <CardTitle className='text-2xl'>
                  {getText(page.title, language, t('page.tree.untitledPage'))}
                </CardTitle>
              </div>
            </div>

            <Button
              asChild
              variant='outline'
              size='sm'
              className='h-8 shrink-0'
            >
              <Link href={`/admin/page/${encodeURIComponent(editPageId)}`}>
                {t('page.tree.editPage')}
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className='grid gap-4 px-5 sm:px-6 lg:grid-cols-2'>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground min-w-20'>
                {t('page.tree.slug')}
              </span>
              <code className='bg-muted rounded px-2 py-1 text-xs'>
                /{page.slug || '-'}
              </code>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground min-w-20'>
                {t('page.tree.statusLabel')}
              </span>
              <StatusBadge status={page.status} />
            </div>
          </div>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground min-w-24'>
                {t('page.tree.publishedLabel')}
              </span>
              <span>{formatOptionalDate(page.publishedAt)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground min-w-24'>
                {t('page.tree.updatedLabel')}
              </span>
              <span>{formatOptionalDate(page.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 sm:grid-cols-3'>
        <SummaryCard
          title={t('page.tree.sections')}
          value={counts.sections}
          icon={Layers3}
          iconVariant='primary'
        />
        <SummaryCard
          title={t('page.tree.posts')}
          value={counts.posts}
          icon={FileText}
          iconVariant='success'
        />
        <SummaryCard
          title={t('page.tree.categories')}
          value={counts.categories}
          icon={Tag}
          iconVariant='warning'
        />
      </div>

      <Card className='gap-4 py-5'>
        <CardHeader className='px-5 pb-0'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='space-y-1'>
              <CardTitle className='text-base'>
                {t('page.tree.sectionTreeTitle')}
              </CardTitle>
              <CardDescription>
                {t('page.tree.sectionTreeDescription')}
              </CardDescription>
            </div>

            <div className='flex flex-wrap gap-2'>
              {canCreateSection ? (
                <AddLinkBadge
                  href={`/admin/section/new?pageId=${encodeURIComponent(editPageId)}`}
                  label={t('page.tree.addSection')}
                />
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className='px-5'>
          {sections.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              {t('page.tree.noSectionsLinked')}
            </p>
          ) : (
            <div className='space-y-4'>
              {sections.map((section) => (
                <SectionTreeCard
                  key={section.id}
                  section={section}
                  pageId={editPageId}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
