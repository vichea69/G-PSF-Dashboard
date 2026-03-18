'use client';

import type { ReactNode } from 'react';
import { useTranslate } from '@/hooks/use-translate';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  BannerForm,
  createEmptyBannerData,
  type HeroBannerData
} from '@/features/post/component/block/hero-banner/hero-banner-form';
import {
  TextBlockForm,
  createEmptyTextBlockData,
  type TextBlockData
} from '@/features/post/component/block/text-block/text-block-form';
import {
  IssuesResponsesForm,
  createEmptyIssuesResponsesData,
  type IssuesResponsesData
} from '@/features/post/component/block/issues-responses/issues-responses-form';
import {
  ProgressSnapshotForm,
  createEmptyProgressSnapshotData,
  type ProgressSnapshotData
} from '@/features/post/component/block/progress-snapshot/progress-snapshot-form';
import {
  SubmissionForm,
  createEmptySubmissionFormData,
  type SubmissionFormData
} from '@/features/post/component/block/submission-form/submission-form';

export interface WgTemplateData {
  heroBanner: HeroBannerData;
  textBlock: TextBlockData;
  progressSnapshot: ProgressSnapshotData;
  submissionForm: SubmissionFormData;
  issuesResponses: IssuesResponsesData;
}

export const createEmptyWgTemplateData = (): WgTemplateData => ({
  heroBanner: createEmptyBannerData(),
  textBlock: createEmptyTextBlockData(),
  progressSnapshot: createEmptyProgressSnapshotData(),
  submissionForm: createEmptySubmissionFormData(),
  issuesResponses: createEmptyIssuesResponsesData()
});

const normalizeWgTemplateData = (value?: WgTemplateData): WgTemplateData => {
  const fallback = createEmptyWgTemplateData();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  return {
    heroBanner:
      value.heroBanner && typeof value.heroBanner === 'object'
        ? value.heroBanner
        : fallback.heroBanner,
    textBlock:
      value.textBlock && typeof value.textBlock === 'object'
        ? value.textBlock
        : fallback.textBlock,
    progressSnapshot:
      value.progressSnapshot && typeof value.progressSnapshot === 'object'
        ? value.progressSnapshot
        : fallback.progressSnapshot,
    submissionForm:
      value.submissionForm && typeof value.submissionForm === 'object'
        ? value.submissionForm
        : fallback.submissionForm,
    issuesResponses:
      value.issuesResponses && typeof value.issuesResponses === 'object'
        ? value.issuesResponses
        : fallback.issuesResponses
  };
};

type WgTemplateFormProps = {
  language: 'en' | 'km';
  value?: WgTemplateData;
  onChange?: (value: WgTemplateData) => void;
};

type WgTemplateSectionProps = {
  value: string;
  title: string;
  children: ReactNode;
};

function WgTemplateSection({ value, title, children }: WgTemplateSectionProps) {
  return (
    <AccordionItem
      value={value}
      className='bg-card border-border/70 overflow-hidden rounded-2xl border shadow-sm'
    >
      <AccordionTrigger className='px-5 py-4 text-base font-semibold hover:no-underline'>
        {title}
      </AccordionTrigger>
      <AccordionContent className='px-5 pb-5'>{children}</AccordionContent>
    </AccordionItem>
  );
}

export function WgTemplateForm({
  language,
  value,
  onChange
}: WgTemplateFormProps) {
  const { t } = useTranslate();
  const formData = normalizeWgTemplateData(value);

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue='hero-banner'
      className='space-y-4'
    >
      <WgTemplateSection
        value='hero-banner'
        title={t('post.blocks.wgTemplate.heroBanner')}
      >
        <BannerForm
          language={language}
          value={formData.heroBanner}
          onChange={(nextHeroBanner) =>
            onChange?.({
              ...formData,
              heroBanner: nextHeroBanner
            })
          }
        />
      </WgTemplateSection>

      <WgTemplateSection
        value='mandate-scope'
        title={t('post.blocks.wgTemplate.mandateScope')}
      >
        <TextBlockForm
          language={language}
          value={formData.textBlock}
          cardTitle={t('post.blocks.wgTemplate.mandateScope')}
          descriptionInput='tiptap'
          onChange={(nextTextBlock) =>
            onChange?.({
              ...formData,
              textBlock: nextTextBlock
            })
          }
        />
      </WgTemplateSection>

      <WgTemplateSection
        value='progress-snapshot'
        title={t('post.blocks.wgTemplate.progressSnapshot')}
      >
        <ProgressSnapshotForm
          value={formData.progressSnapshot}
          onChange={(nextProgressSnapshot) =>
            onChange?.({
              ...formData,
              progressSnapshot: nextProgressSnapshot
            })
          }
        />
      </WgTemplateSection>

      <WgTemplateSection
        value='issues-responses'
        title={t('post.blocks.wgTemplate.issuesResponses')}
      >
        <IssuesResponsesForm
          language={language}
          value={formData.issuesResponses}
          onChange={(nextIssuesResponses) =>
            onChange?.({
              ...formData,
              issuesResponses: nextIssuesResponses
            })
          }
        />
      </WgTemplateSection>

      <WgTemplateSection
        value='submission-form'
        title={t('post.blocks.wgTemplate.submissionForm')}
      >
        <SubmissionForm
          language={language}
          value={formData.submissionForm}
          onChange={(nextSubmissionForm) =>
            onChange?.({
              ...formData,
              submissionForm: nextSubmissionForm
            })
          }
        />
      </WgTemplateSection>
    </Accordion>
  );
}
