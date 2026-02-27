'use client';

import { useMemo } from 'react';
import { useCategories } from '@/hooks/use-category';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/helpers';
import { extractPageRows, usePage } from '@/hooks/use-page';
import type { PostContent } from '@/server/action/post/types';
import { useSection } from '@/features/section/hook/use-section';
import {
  createEmptyBannerData,
  type HeroBannerData
} from '@/features/post/component/block/hero-banner/hero-banner-form';
import {
  createEmptyStatsData,
  type StatsBlockData
} from '@/features/post/component/block/stats/stats-form';
import { PostContentCard } from '@/features/post/component/post-form-sections/post-content-card';
import { PostResourcesCard } from '@/features/post/component/post-form-sections/post-resources-card';
import { PostPublishSettingsCard } from '@/features/post/component/post-form-sections/post-publish-settings-card';
import {
  getLocalizedContent,
  isHeroBannerContent,
  isStatsContent
} from '@/features/post/component/post-form-helpers';
import { usePostFormState } from '@/features/post/component/use-post-form-state';
import type { PostFormData } from '@/features/post/component/post-form-types';

export type { PostFormData } from '@/features/post/component/post-form-types';

type PostFormProps = {
  editingPost?: any | null;
  onSave: (data: PostFormData) => void | Promise<void>;
  onCancel: () => void;
};

export default function PostForm({
  editingPost,
  onSave,
  onCancel
}: PostFormProps) {
  const { language } = useLanguage();
  const initialActiveLang = useMemo(
    () => (language === 'kh' ? 'km' : 'en') as 'en' | 'km',
    [language]
  );

  const { formData, setFormData, activeLanguage, setActiveLanguage } =
    usePostFormState({
      editingPost,
      initialActiveLanguage: initialActiveLang
    });

  const { data: categoriesData } = useCategories();
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
    const rows = extractPageRows(pagesData);

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

  const isHeroBannerSection = selectedSection?.blockType === 'hero_banner';
  const isAddressSection = selectedSection?.blockType === 'address';
  const isStatsSection = selectedSection?.blockType === 'stats';

  const heroBannerValue = isHeroBannerContent(formData.content?.en)
    ? (formData.content?.en as HeroBannerData)
    : createEmptyBannerData();

  const statsValue = isStatsContent(formData.content?.en)
    ? (formData.content?.en as StatsBlockData)
    : createEmptyStatsData();

  const editorValue =
    isHeroBannerContent(formData.content?.en) ||
    isStatsContent(formData.content?.en)
      ? ''
      : getLocalizedContent(formData.content, activeLanguage);

  const handleSubmit = () => {
    const titleEn = formData.titleEn?.trim() || '';
    const titleKm = formData.titleKm?.trim() || '';
    const descriptionEn = formData.descriptionEn?.trim() || '';
    const descriptionKm = formData.descriptionKm?.trim() || '';
    const publishDate = formData.publishDate?.trim() || '';
    const isFeatured = Boolean(formData.isFeatured);
    const coverImage = formData.coverImage?.trim() || '';
    const normalizeDocumentEntry = (entry?: {
      url?: string;
      thumbnailUrl?: string;
    }) => {
      const url = entry?.url?.trim() || '';
      const thumbnailUrl = entry?.thumbnailUrl?.trim() || '';
      if (!url && !thumbnailUrl) return undefined;
      return {
        ...(url ? { url } : {}),
        ...(thumbnailUrl ? { thumbnailUrl } : {})
      };
    };
    const documents = {
      en: normalizeDocumentEntry(formData.documents?.en),
      km: normalizeDocumentEntry(formData.documents?.km)
    };
    const hasDocuments = Boolean(documents.en || documents.km);
    const document = documents.en?.url || formData.document?.trim() || '';
    const documentThumbnail =
      documents.en?.thumbnailUrl || formData.documentThumbnail?.trim() || '';
    const link = formData.link?.trim() || '';
    const title = titleEn || titleKm || formData.title?.trim() || '';

    const normalizeContentEntry = (
      value: PostContent | HeroBannerData | StatsBlockData | string | undefined
    ) => {
      if (!value) return { type: 'doc', content: [] } as PostContent;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed ? value : ({ type: 'doc', content: [] } as PostContent);
      }
      return value;
    };

    const content = isHeroBannerSection
      ? ({
          en: heroBannerValue,
          km: heroBannerValue
        } as PostFormData['content'])
      : isStatsSection
        ? ({
            en: statsValue
          } as PostFormData['content'])
        : {
            en: normalizeContentEntry(formData.content?.en),
            km: formData.content?.km
              ? normalizeContentEntry(formData.content?.km)
              : undefined
          };

    onSave({
      ...formData,
      title,
      titleEn,
      titleKm,
      descriptionEn,
      descriptionKm,
      publishDate: publishDate || undefined,
      isFeatured,
      coverImage: coverImage || undefined,
      document: document || undefined,
      documentThumbnail: documentThumbnail || undefined,
      documents: hasDocuments
        ? {
            ...(documents.en ? { en: documents.en } : {}),
            ...(documents.km ? { km: documents.km } : {})
          }
        : undefined,
      link: link || undefined,
      content
    });
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <PostContentCard
            activeLanguage={activeLanguage}
            onActiveLanguageChange={(nextLanguage) =>
              setActiveLanguage(nextLanguage)
            }
            titleEn={formData.titleEn ?? ''}
            titleKm={formData.titleKm ?? ''}
            descriptionEn={formData.descriptionEn ?? ''}
            descriptionKm={formData.descriptionKm ?? ''}
            isHeroBannerSection={isHeroBannerSection}
            isStatsSection={isStatsSection}
            isAddressSection={isAddressSection}
            editorValue={editorValue}
            heroBannerValue={heroBannerValue}
            statsValue={statsValue}
            onTitleEnChange={(value) =>
              setFormData((prev) => ({ ...prev, titleEn: value }))
            }
            onTitleKmChange={(value) =>
              setFormData((prev) => ({ ...prev, titleKm: value }))
            }
            onDescriptionEnChange={(value) =>
              setFormData((prev) => ({ ...prev, descriptionEn: value }))
            }
            onDescriptionKmChange={(value) =>
              setFormData((prev) => ({ ...prev, descriptionKm: value }))
            }
            onEditorChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? { en: value }),
                  [activeLanguage]: value
                }
              }))
            }
            onBannerChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? { en: value }),
                  en: value,
                  km: value
                }
              }))
            }
            onStatsChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? {}),
                  en: value
                }
              }))
            }
          />

          {!isHeroBannerSection && !isStatsSection && (
            <>
              {/* <PostImagesCard
                previewImages={previewImages}
                initialFiles={initialFileMetadata}
                onFilesChange={handleImagesChange}
              /> */}

              <PostResourcesCard
                coverImage={formData.coverImage ?? ''}
                documents={formData.documents}
                document={formData.document ?? ''}
                documentThumbnail={formData.documentThumbnail ?? ''}
                link={formData.link ?? ''}
                activeLanguage={activeLanguage}
                onCoverImageChange={(value) =>
                  setFormData((prev) => ({ ...prev, coverImage: value }))
                }
                onDocumentsChange={(value) =>
                  setFormData((prev) => ({ ...prev, documents: value }))
                }
                onDocumentChange={(value) =>
                  setFormData((prev) => ({ ...prev, document: value }))
                }
                onDocumentThumbnailChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    documentThumbnail: value
                  }))
                }
                onLinkChange={(value) =>
                  setFormData((prev) => ({ ...prev, link: value }))
                }
              />
            </>
          )}
        </div>

        <div className='space-y-6'>
          <PostPublishSettingsCard
            status={formData.status}
            publishDate={formData.publishDate}
            isFeatured={Boolean(formData.isFeatured)}
            categoryId={formData.categoryId}
            sectionId={formData.sectionId}
            pageId={formData.pageId}
            categories={categories as Array<Record<string, unknown>>}
            sections={sections as Array<Record<string, unknown>>}
            pages={pages as Array<Record<string, unknown>>}
            selectedSection={selectedSection as Record<string, unknown>}
            isEditing={Boolean(editingPost)}
            onStatusChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
            onPublishDateChange={(value) =>
              setFormData((prev) => ({ ...prev, publishDate: value }))
            }
            onIsFeaturedChange={(value) =>
              setFormData((prev) => ({ ...prev, isFeatured: value }))
            }
            onCategoryChange={(value) =>
              setFormData((prev) => ({ ...prev, categoryId: value }))
            }
            onSectionChange={(value) =>
              setFormData((prev) => ({ ...prev, sectionId: value }))
            }
            onPageChange={(value) =>
              setFormData((prev) => ({ ...prev, pageId: value }))
            }
            expiredDate={formData.expiredDate}
            onExpiredDateChange={(value) =>
              setFormData((prev) => ({ ...prev, expiredDate: value }))
            }
            onCancel={onCancel}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
