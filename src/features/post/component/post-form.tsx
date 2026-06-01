'use client';

import { useEffect, useMemo } from 'react';
import { useCategories } from '@/hooks/use-category';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/helpers';
import { extractPageRows, usePage } from '@/hooks/use-page';
import type { PostContent } from '@/server/action/post/types';
import { useSection } from '@/features/section/hook/use-section';
import {
  useWorkingGroups,
  useWorkingGroupPostTargets
} from '@/hooks/use-working-group';
import {
  createEmptyBannerData,
  type HeroBannerData
} from '@/features/post/component/block/hero-banner/hero-banner-form';
import {
  createEmptyStatsData,
  type StatsBlockData
} from '@/features/post/component/block/stats/stats-form';
import {
  createEmptyTextBlockData,
  type TextBlockData
} from '@/features/post/component/block/text-block/text-block-form';
import {
  createEmptyWgCoChairsData,
  type WgCoChairsData
} from '@/features/post/component/block/wg-co-chairs/wg-co-chairs-form';
import {
  createEmptyAnnualReportsData,
  type AnnualReportsData
} from '@/features/post/component/block/annual-reports/annual-reports-form';
import {
  createEmptyIssuesResponsesData,
  type IssuesResponsesData
} from '@/features/post/component/block/issues-responses/issues-responses-form';
import {
  createEmptyWgTemplateData,
  type WgTemplateData
} from '@/features/post/component/block/wg-template/wg-template-form';
import {
  createEmptyDefaultTemplateData,
  type DefaultTemplateData
} from '@/features/post/component/block/default-template/default-template-form';
import { PostContentCard } from '@/features/post/component/post-form-sections/post-content-card';
import { PostResourcesCard } from '@/features/post/component/post-form-sections/post-resources-card';
import { PostPublishSettingsCard } from '@/features/post/component/post-form-sections/post-publish-settings-card';
import {
  derivePostFields,
  getLocalizedContent,
  isHeroBannerContent,
  isStatsContent,
  isTextBlockContent,
  isWgCoChairsContent,
  isAnnualReportsContent,
  isIssuesResponsesContent,
  isWgTemplateContent,
  isDefaultTemplateContent
} from '@/features/post/component/post-form-helpers';
import { usePostFormState } from '@/features/post/component/use-post-form-state';
import type { PostFormData } from '@/features/post/component/post-form-types';

export type { PostFormData } from '@/features/post/component/post-form-types';

type PostFormProps = {
  editingPost?: any | null;
  initialPageId?: number;
  initialSectionId?: number;
  onSave: (data: PostFormData) => void | Promise<void>;
  onCancel: () => void;
};

export default function PostForm({
  editingPost,
  initialPageId,
  initialSectionId,
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
      initialActiveLanguage: initialActiveLang,
      initialPageId,
      initialSectionId
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

  const selectedPageId = useMemo(() => {
    const value = String(formData.pageId ?? '').trim();
    return value || undefined;
  }, [formData.pageId]);

  const { data: sectionsData } = useSection(selectedPageId);
  const sections = useMemo(() => {
    if (!Array.isArray(sectionsData)) return [];

    return sectionsData.map((section) => ({
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

  const { data: workingGroupsData } = useWorkingGroups();
  const workingGroups = useMemo(() => {
    if (!Array.isArray(workingGroupsData)) return [];
    return workingGroupsData.map((wg) => ({
      ...wg,
      title:
        getLocalizedText(wg?.title as any, language) || String(wg?.id ?? '')
    }));
  }, [workingGroupsData, language]);

  // Reverse-lookup: when editing a post whose pageId matches a WG's pageId,
  // pre-select that WG in the dropdown on initial load.
  // Only undefined means "never resolved" — empty string means the user explicitly
  // cleared it via the Clear button, so we MUST NOT re-set it from pageId.
  useEffect(() => {
    if (formData.workingGroupId !== undefined) {
      return;
    }
    if (!Array.isArray(workingGroupsData) || workingGroupsData.length === 0) {
      return;
    }
    const pageIdValue = formData.pageId;
    if (
      pageIdValue === undefined ||
      pageIdValue === null ||
      pageIdValue === ''
    ) {
      return;
    }
    const match = workingGroupsData.find(
      (wg) => String(wg.pageId ?? '') === String(pageIdValue)
    );
    if (match) {
      setFormData((prev) => ({ ...prev, workingGroupId: match.id }));
    }
  }, [
    workingGroupsData,
    formData.pageId,
    formData.workingGroupId,
    setFormData
  ]);

  const { data: postTargets, isFetching: postTargetsLoading } =
    useWorkingGroupPostTargets(formData.workingGroupId);

  const allowedSectionIds = useMemo(
    () => postTargets?.sections.map((s) => s.id) ?? [],
    [postTargets]
  );

  const allowedCategoryIds = useMemo(() => {
    if (!postTargets) return [];
    const targetSection = postTargets.sections.find(
      (section) => String(section.id) === String(formData.sectionId ?? '')
    );
    return targetSection?.allowedCategoryIds ?? [];
  }, [postTargets, formData.sectionId]);

  const hasWorkingGroup =
    formData.workingGroupId !== undefined &&
    formData.workingGroupId !== null &&
    String(formData.workingGroupId).trim() !== '';
  const hasNoPostListSection =
    hasWorkingGroup &&
    !postTargetsLoading &&
    Array.isArray(postTargets?.sections) &&
    postTargets!.sections.length === 0;

  const isHeroBannerSection = selectedSection?.blockType === 'hero_banner';
  const isAddressSection = selectedSection?.blockType === 'address';
  const isStatsSection = selectedSection?.blockType === 'stats';
  const isTextBlockSection = selectedSection?.blockType === 'text_block';
  const isWgCoChairsSection =
    selectedSection?.blockType === 'working_group_co_chairs';
  const isAnnualReportsSection =
    selectedSection?.blockType === 'annual_reports';
  const isIssuesResponsesSection =
    selectedSection?.blockType === 'issues_responses';
  const isWgTemplateSection = selectedSection?.blockType === 'wg_template';
  const isDefaultTemplateSection =
    selectedSection?.blockType === 'default_template';

  const heroBannerValue = isHeroBannerContent(formData.content?.en)
    ? (formData.content?.en as HeroBannerData)
    : createEmptyBannerData();

  const statsValue = isStatsContent(formData.content?.en)
    ? (formData.content?.en as StatsBlockData)
    : createEmptyStatsData();

  const textBlockValue = isTextBlockContent(formData.content?.en)
    ? (formData.content?.en as TextBlockData)
    : createEmptyTextBlockData();

  const wgCoChairsValue = isWgCoChairsContent(formData.content?.en)
    ? (formData.content?.en as WgCoChairsData)
    : createEmptyWgCoChairsData();

  const annualReportsValue = isAnnualReportsContent(formData.content?.en)
    ? (formData.content?.en as AnnualReportsData)
    : createEmptyAnnualReportsData();

  const issuesResponsesValue = isIssuesResponsesContent(formData.content?.en)
    ? (formData.content?.en as IssuesResponsesData)
    : createEmptyIssuesResponsesData();

  const wgTemplateValue = isWgTemplateContent(formData.content?.en)
    ? (formData.content?.en as WgTemplateData)
    : createEmptyWgTemplateData();

  const defaultTemplateValue = isDefaultTemplateContent(formData.content?.en)
    ? (formData.content?.en as DefaultTemplateData)
    : createEmptyDefaultTemplateData();

  const editorValue =
    isHeroBannerContent(formData.content?.en) ||
    isStatsContent(formData.content?.en) ||
    isTextBlockContent(formData.content?.en) ||
    isWgCoChairsContent(formData.content?.en) ||
    isAnnualReportsContent(formData.content?.en) ||
    isIssuesResponsesContent(formData.content?.en) ||
    isWgTemplateContent(formData.content?.en) ||
    isDefaultTemplateContent(formData.content?.en)
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
      const hasEntry = entry !== undefined;
      const url = entry?.url?.trim() || '';
      const thumbnailUrl = entry?.thumbnailUrl?.trim() || '';
      if (!url && !thumbnailUrl) {
        return hasEntry ? { url: '', thumbnailUrl: '' } : undefined;
      }

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
    const originalFields = derivePostFields(editingPost);
    const clearCoverImage = Boolean(
      editingPost && originalFields.coverImage && !coverImage
    );
    const clearDocumentEn = Boolean(
      editingPost &&
        originalFields.documents.en?.url &&
        formData.documents?.en !== undefined &&
        !documents.en?.url
    );
    const clearDocumentKm = Boolean(
      editingPost &&
        originalFields.documents.km?.url &&
        formData.documents?.km !== undefined &&
        !documents.km?.url
    );

    const normalizeContentEntry = (
      value:
        | PostContent
        | HeroBannerData
        | StatsBlockData
        | TextBlockData
        | WgCoChairsData
        | AnnualReportsData
        | IssuesResponsesData
        | WgTemplateData
        | DefaultTemplateData
        | string
        | undefined
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
        : isTextBlockSection
          ? ({
              en: textBlockValue
            } as PostFormData['content'])
          : isWgCoChairsSection
            ? ({
                en: wgCoChairsValue
              } as PostFormData['content'])
            : isAnnualReportsSection
              ? ({
                  en: annualReportsValue
                } as PostFormData['content'])
              : isIssuesResponsesSection
                ? ({
                    en: issuesResponsesValue
                  } as PostFormData['content'])
                : isWgTemplateSection
                  ? ({
                      en: wgTemplateValue
                    } as PostFormData['content'])
                  : isDefaultTemplateSection
                    ? ({
                        en: defaultTemplateValue
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
      coverImage,
      document,
      documentThumbnail,
      documents: hasDocuments
        ? {
            ...(documents.en ? { en: documents.en } : {}),
            ...(documents.km ? { km: documents.km } : {})
          }
        : undefined,
      clearCoverImage,
      clearDocumentEn,
      clearDocumentKm,
      clearDocuments: clearDocumentEn && clearDocumentKm,
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
            isTextBlockSection={isTextBlockSection}
            isWgCoChairsSection={isWgCoChairsSection}
            isAnnualReportsSection={isAnnualReportsSection}
            isIssuesResponsesSection={isIssuesResponsesSection}
            isWgTemplateSection={isWgTemplateSection}
            isDefaultTemplateSection={isDefaultTemplateSection}
            isAddressSection={isAddressSection}
            editorValue={editorValue}
            heroBannerValue={heroBannerValue}
            statsValue={statsValue}
            textBlockValue={textBlockValue}
            wgCoChairsValue={wgCoChairsValue}
            annualReportsValue={annualReportsValue}
            issuesResponsesValue={issuesResponsesValue}
            wgTemplateValue={wgTemplateValue}
            defaultTemplateValue={defaultTemplateValue}
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
            onTextBlockChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? {}),
                  en: value
                }
              }))
            }
            onWgCoChairsChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? {}),
                  en: value
                }
              }))
            }
            onAnnualReportsChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? {}),
                  en: value
                }
              }))
            }
            onIssuesResponsesChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? {}),
                  en: value
                }
              }))
            }
            onWgTemplateChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? {}),
                  en: value
                }
              }))
            }
            onDefaultTemplateChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: {
                  ...(prev.content ?? {}),
                  en: value
                }
              }))
            }
          />

          {!isHeroBannerSection &&
            !isStatsSection &&
            !isTextBlockSection &&
            !isWgCoChairsSection &&
            !isAnnualReportsSection &&
            !isIssuesResponsesSection &&
            !isWgTemplateSection &&
            !isDefaultTemplateSection && (
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
            workingGroupId={formData.workingGroupId}
            categories={categories as Array<Record<string, unknown>>}
            sections={sections as Array<Record<string, unknown>>}
            pages={pages as Array<Record<string, unknown>>}
            workingGroups={workingGroups as Array<Record<string, unknown>>}
            allowedSectionIds={allowedSectionIds}
            allowedCategoryIds={allowedCategoryIds}
            postTargetsLoading={postTargetsLoading}
            hasNoPostListSection={hasNoPostListSection}
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
              setFormData((prev) => ({
                ...prev,
                pageId: value,
                sectionId: ''
              }))
            }
            onWorkingGroupChange={(value) => {
              const trimmed = value?.trim() ?? '';
              if (!trimmed) {
                // Clearing the WG releases the auto-fill but keeps existing
                // page/section/category so authors don't lose their selections.
                setFormData((prev) => ({ ...prev, workingGroupId: '' }));
                return;
              }
              // Find the WG's pageId so the Page field auto-fills.
              // The post-targets query will follow up with allowed sections/categories.
              const next = Array.isArray(workingGroupsData)
                ? workingGroupsData.find((wg) => String(wg.id) === trimmed)
                : undefined;
              setFormData((prev) => ({
                ...prev,
                workingGroupId: trimmed,
                pageId: next?.pageId ?? prev.pageId,
                // Reset section/category so the author re-picks within the new WG's allowed set.
                sectionId: '',
                categoryId: ''
              }));
            }}
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
