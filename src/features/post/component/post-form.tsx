'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, Upload } from 'lucide-react';
import ProgressUpload from '@/components/file-upload/progress-upload';
import type { FileWithPreview } from '@/hooks/use-file-upload';
import { useCategories } from '@/hooks/use-category';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/helpers';
import { usePage } from '@/hooks/use-page';
import { PostContentEditor } from '@/features/post/component/post-content-editor';
import type { PostContent } from '@/server/action/post/types';
import { useSection } from '@/features/section/hook/use-section';
import {
  BannerForm,
  createEmptyBannerData,
  type HeroBannerData
} from '@/features/post/component/block/hero-banner/hero-banner-form';

export type PostFormData = {
  title: string;
  titleEn?: string;
  titleKm?: string;
  descriptionEn?: string;
  descriptionKm?: string;
  status: 'published' | 'draft';
  content?: PostContent | HeroBannerData | string;
  categoryId?: number | string;
  sectionId?: number | string;
  pageId?: number | string;
  newImages: File[];
  existingImageIds: number[];
  removedImageIds: number[];
};

type PostFormProps = {
  editingPost?: any | null;
  onSave: (data: PostFormData) => void | Promise<void>;
  onCancel: () => void;
};

const parseJsonObject = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null;
  if (typeof value === 'object') return value as Record<string, unknown>;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
  }
  return null;
};

const parseId = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const readString = (value: unknown) => (typeof value === 'string' ? value : '');

const parseContentValue = (
  value: unknown
): PostContent | HeroBannerData | string => {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          return parsed as PostContent | HeroBannerData;
        }
      } catch {
        return value;
      }
    }
    return value;
  }
  return value as PostContent;
};

const isHeroBannerContent = (value: unknown): value is HeroBannerData => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as HeroBannerData;
  return (
    typeof candidate.title === 'object' &&
    typeof candidate.subtitle === 'object' &&
    typeof candidate.description === 'object' &&
    Array.isArray(candidate.backgroundImages) &&
    Array.isArray(candidate.ctas)
  );
};

const derivePostFields = (post: any) => {
  const titleObj = parseJsonObject(post?.title);
  const titleEn =
    (typeof titleObj?.en === 'string' ? titleObj.en : '') ||
    readString(post?.title);
  const titleKm = typeof titleObj?.km === 'string' ? titleObj.km : '';
  const descriptionObj = parseJsonObject(post?.description);
  const descriptionEn =
    (typeof descriptionObj?.en === 'string' ? descriptionObj.en : '') ||
    readString(post?.description);
  const descriptionKm =
    typeof descriptionObj?.km === 'string' ? descriptionObj.km : '';
  const content = parseContentValue(post?.content);
  const title = titleEn || titleKm || readString(post?.title);
  return {
    title,
    titleEn,
    titleKm,
    descriptionEn,
    descriptionKm,
    content
  };
};

export default function PostForm({
  editingPost,
  onSave,
  onCancel
}: PostFormProps) {
  type EditingImage = {
    key: string;
    id?: number;
    url: string;
    sortOrder: number;
    fileName: string;
    size: number;
    mimeType: string;
  };

  const editingImages: EditingImage[] = useMemo(() => {
    if (!Array.isArray(editingPost?.images)) return [];
    return editingPost.images
      .filter((img: any) => img && typeof img === 'object')
      .map((img: any, index: number) => {
        const id = parseId(img.id);
        const key = id !== undefined ? String(id) : `existing-${index}`;
        const url = typeof img.url === 'string' ? img.url : '';
        return {
          key,
          id,
          url,
          sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
          fileName:
            typeof img.fileName === 'string' && img.fileName.length > 0
              ? img.fileName
              : `Image ${index + 1}`,
          size: typeof img.size === 'number' ? img.size : 0,
          mimeType:
            typeof img.mimeType === 'string' && img.mimeType.length > 0
              ? img.mimeType
              : 'image/*'
        } as EditingImage;
      })
      .sort(
        (a: { sortOrder: number }, b: { sortOrder: number }) =>
          a.sortOrder - b.sortOrder
      );
  }, [editingPost]);

  const existingImageIdMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const img of editingImages) {
      if (typeof img.id === 'number') {
        map.set(img.key, img.id);
      }
    }
    return map;
  }, [editingImages]);

  const initialFileMetadata = useMemo(() => {
    return editingImages.map((img) => ({
      id: img.key,
      name: img.fileName,
      size: img.size,
      type: img.mimeType,
      url: img.url
    }));
  }, [editingImages]);

  const initialFields = derivePostFields(editingPost);
  const [formData, setFormData] = useState<PostFormData>({
    title: initialFields.title,
    titleEn: initialFields.titleEn,
    titleKm: initialFields.titleKm,
    descriptionEn: initialFields.descriptionEn,
    descriptionKm: initialFields.descriptionKm,
    status:
      editingPost?.status === 'published' || editingPost?.status === 'draft'
        ? editingPost.status
        : 'draft',
    content: initialFields.content,
    categoryId: editingPost?.category?.id ?? editingPost?.categoryId,
    sectionId: editingPost?.section?.id ?? editingPost?.sectionId,
    pageId: editingPost?.page?.id ?? editingPost?.pageId,
    newImages: [],
    existingImageIds: editingImages
      .map((img) => img.id)
      .filter((id): id is number => typeof id === 'number'),
    removedImageIds: []
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>(() =>
    initialFileMetadata.map((file) => ({
      id: file.id,
      file,
      preview: file.url
    }))
  );
  useEffect(() => {
    setUploadedFiles(
      initialFileMetadata.map((file) => ({
        id: file.id,
        file,
        preview: file.url
      }))
    );
    setFormData((prev) => ({
      ...prev,
      existingImageIds: editingImages
        .map((img) => img.id)
        .filter((id): id is number => typeof id === 'number'),
      removedImageIds: []
    }));
  }, [editingImages, initialFileMetadata]);

  useEffect(() => {
    if (!editingPost) return;
    const derived = derivePostFields(editingPost);
    setFormData((prev) => ({
      ...prev,
      title: derived.title ?? prev.title,
      titleEn: derived.titleEn ?? prev.titleEn,
      titleKm: derived.titleKm ?? prev.titleKm,
      descriptionEn: derived.descriptionEn ?? prev.descriptionEn,
      descriptionKm: derived.descriptionKm ?? prev.descriptionKm,
      status:
        editingPost?.status === 'published' || editingPost?.status === 'draft'
          ? editingPost.status
          : prev.status,
      content: derived.content ?? prev.content,
      categoryId:
        editingPost?.category?.id ?? editingPost?.categoryId ?? prev.categoryId,
      sectionId:
        editingPost?.section?.id ?? editingPost?.sectionId ?? prev.sectionId,
      pageId: editingPost?.page?.id ?? editingPost?.pageId ?? prev.pageId,
      newImages: []
    }));
  }, [editingPost]);

  const { data: categoriesData } = useCategories();
  const { language } = useLanguage();
  const initialActiveLang = useMemo(
    () => (language === 'kh' ? 'km' : 'en') as 'en' | 'km',
    [language]
  );
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'km'>(
    initialActiveLang
  );
  const categories = useMemo(() => {
    const raw = (categoriesData?.data ?? categoriesData) as any;
    if (!Array.isArray(raw)) return [];
    return raw.map((category) => ({
      ...category,
      name: getLocalizedText(category?.name, language),
      description: getLocalizedText(category?.description, language)
    }));
  }, [categoriesData, language]);

  const { data: pagesData } = usePage();
  const pages = useMemo(() => {
    const raw = (pagesData?.data ?? pagesData) as any;
    const rows = Array.isArray(raw) ? raw : [];
    return rows.map((page) => ({
      ...page,
      title: getLocalizedText(page?.title, language) || page?.slug || page?.id
    }));
  }, [pagesData, language]);

  const { data: sectionsData } = useSection();
  const sections = useMemo(() => {
    const raw = (sectionsData?.data ?? sectionsData) as any;
    if (!Array.isArray(raw)) return [];
    return raw.map((section) => ({
      ...section,
      title: getLocalizedText(section?.title, language) || section?.id
    }));
  }, [sectionsData, language]);

  const selectedSection = useMemo(
    () =>
      sections.find(
        (section: any) =>
          String(section.id) === String(formData.sectionId ?? '')
      ),
    [sections, formData.sectionId]
  );

  // Slug removed per request; backend will derive if needed.

  const handleSubmit = () => {
    const titleEn = formData.titleEn?.trim() || '';
    const titleKm = formData.titleKm?.trim() || '';
    const descriptionEn = formData.descriptionEn?.trim() || '';
    const descriptionKm = formData.descriptionKm?.trim() || '';
    const title = titleEn || titleKm || formData.title?.trim() || '';
    const content =
      selectedSection?.blockType === 'hero_banner'
        ? isHeroBannerContent(formData.content)
          ? formData.content
          : createEmptyBannerData()
        : formData.content;
    onSave({
      ...formData,
      title,
      titleEn,
      titleKm,
      descriptionEn,
      descriptionKm,
      content
    });
  };

  const previewImages = useMemo(() => {
    return uploadedFiles
      .filter((file) => typeof file.preview === 'string' && file.preview)
      .map((file) => ({
        id: file.id,
        src: file.preview as string,
        isNew: file.file instanceof File
      }));
  }, [uploadedFiles]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <Card>
            <CardHeader className='space-y-3'>
              <Tabs
                value={activeLanguage}
                onValueChange={(v) => setActiveLanguage(v as 'en' | 'km')}
              >
                <TabsList>
                  <TabsTrigger value='en'>English</TabsTrigger>
                  <TabsTrigger value='km'>Khmer</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Tabs
                value={activeLanguage}
                onValueChange={(v) => setActiveLanguage(v as 'en' | 'km')}
                className='space-y-3'
              >
                <TabsContent value='en'>
                  <Label htmlFor='title-en'>Title</Label>
                  <Input
                    id='title-en'
                    value={formData.titleEn ?? ''}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        titleEn: e.target.value
                      }))
                    }
                    placeholder='Enter English title'
                    className='mt-1'
                  />
                  <Label className='mt-3 block' htmlFor='description-en'>
                    Description
                  </Label>
                  <Input
                    id='description-en'
                    value={formData.descriptionEn ?? ''}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        descriptionEn: e.target.value
                      }))
                    }
                    placeholder='Short description'
                    className='mt-1'
                  />
                </TabsContent>
                <TabsContent value='km'>
                  <Label htmlFor='title-km'>Title</Label>
                  <Input
                    id='title-km'
                    value={formData.titleKm ?? ''}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        titleKm: e.target.value
                      }))
                    }
                    placeholder='Enter Khmer title'
                    className='mt-1'
                  />
                  <Label className='mt-3 block' htmlFor='description-km'>
                    Description
                  </Label>
                  <Input
                    id='description-km'
                    value={formData.descriptionKm ?? ''}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        descriptionKm: e.target.value
                      }))
                    }
                    placeholder='Description in khmer'
                    className='mt-1'
                  />
                </TabsContent>
              </Tabs>

              {selectedSection?.blockType === 'hero_banner' ? (
                <div className='space-y-2'>
                  <CardTitle className='text-sm font-medium'>
                    Hero Banner Content
                  </CardTitle>
                  <BannerForm
                    language={activeLanguage}
                    value={
                      isHeroBannerContent(formData.content)
                        ? formData.content
                        : createEmptyBannerData()
                    }
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, content: value }))
                    }
                  />
                </div>
              ) : (
                <div className='space-y-2'>
                  <Label htmlFor='post-content-editor'>Content</Label>
                  <div className='mt-2'>
                    <PostContentEditor
                      id='post-content-editor'
                      value={
                        isHeroBannerContent(formData.content)
                          ? ''
                          : formData.content
                      }
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, content: value }))
                      }
                      placeholder='Write the post content...'
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSection?.blockType !== 'hero_banner' && (
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Media</CardTitle>
                <CardDescription>Upload and manage post images</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {previewImages.length > 0 ? (
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {previewImages.map((image) => (
                      <div
                        key={image.id}
                        className='relative h-24 w-full overflow-hidden rounded-md border'
                      >
                        <img
                          src={image.src}
                          alt='Uploaded preview'
                          className='h-full w-full object-cover'
                        />
                        {image.isNew ? (
                          <span className='text-background absolute right-1 bottom-1 rounded bg-emerald-500/90 px-1 text-[10px] font-semibold uppercase'>
                            New
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className='space-y-2'>
                  <Label>Images</Label>
                  <ProgressUpload
                    maxFiles={10}
                    multiple
                    accept={'image/*'}
                    maxSize={5 * 1024 * 1024}
                    simulateUpload={false}
                    useDefaults={false}
                    initialFiles={initialFileMetadata}
                    onFilesChange={(files) => {
                      setUploadedFiles(files);
                      setTimeout(() => {
                        const newImages = files
                          .filter((file) => file.file instanceof File)
                          .map((file) => file.file as File);
                        const keptExistingIds = files
                          .map((file) => existingImageIdMap.get(file.id))
                          .filter((id): id is number => typeof id === 'number');
                        const removedImageIds = Array.from(
                          existingImageIdMap.values()
                        ).filter((id) => !keptExistingIds.includes(id));

                        setFormData((prev) => ({
                          ...prev,
                          newImages,
                          existingImageIds: keptExistingIds,
                          removedImageIds
                        }));
                      }, 0);
                    }}
                  />
                  {previewImages.length === 0 ? (
                    <p className='text-muted-foreground flex items-center gap-1 text-xs'>
                      <Upload className='h-3 w-3' /> Optional, will appear in
                      the gallery and thumbnail
                    </p>
                  ) : (
                    <p className='text-muted-foreground text-xs'>
                      Remove existing images or add more as needed
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as 'draft' | 'published'
                    }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='published'>Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='category'>Category</Label>
                <Select
                  value={(formData.categoryId ?? '').toString()}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, categoryId: value }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name ?? c.title ?? c.slug ?? c.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='section'>Section</Label>
                <Select
                  value={(formData.sectionId ?? '').toString()}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, sectionId: value }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Attach to a section (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.title ?? s.blockType ?? s.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSection ? (
                  <div className='border-muted bg-muted/30 mt-3 space-y-1 rounded-md border p-3 text-xs'>
                    <p className='font-medium'>
                      Block type: {selectedSection.blockType || 'Unknown'}
                    </p>
                    {selectedSection.blockType === 'hero_banner' && (
                      <p className='text-muted-foreground'>
                        Hero banner: your post title/description will surface as
                        hero text. Add strong images in the Media section.
                      </p>
                    )}
                    {selectedSection.blockType === 'post_list' && (
                      <div className='text-muted-foreground space-y-2'>
                        <p>
                          Post list: this post will appear according to the
                          section&apos;s category, sort, and limit settings.
                        </p>
                        <p className='text-[11px]'>
                          Adjust those settings inside the Section editor if
                          needed.
                        </p>
                      </div>
                    )}
                    {selectedSection.blockType &&
                      !['hero_banner', 'post_list'].includes(
                        selectedSection.blockType
                      ) && (
                        <p className='text-muted-foreground'>
                          Custom layout: this section will render using its
                          block template.
                        </p>
                      )}
                  </div>
                ) : null}
              </div>

              <div>
                <Label htmlFor='page'>Page</Label>
                <Select
                  value={(formData.pageId ?? '').toString()}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, pageId: value }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Attach to a page (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((p: any) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title ?? p.slug ?? p.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center gap-2'>
                <Button variant='outline' onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className='mr-2 h-4 w-4' />
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
