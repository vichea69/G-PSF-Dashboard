'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostContentEditor } from '@/features/post/component/post-content-editor';
import {
  BannerForm,
  type HeroBannerData
} from '@/features/post/component/block/hero-banner/hero-banner-form';
import {
  StatsForm,
  type StatsBlockData
} from '@/features/post/component/block/stats/stats-form';
import {
  TextBlockForm,
  type TextBlockData
} from '@/features/post/component/block/text-block/text-block-form';
import {
  WgCoChairsForm,
  type WgCoChairsData
} from '@/features/post/component/block/wg-co-chairs/wg-co-chairs-form';
import {
  AnnualReportsForm,
  type AnnualReportsData
} from '@/features/post/component/block/annual-reports/annual-reports-form';
import {
  IssuesResponsesForm,
  type IssuesResponsesData
} from '@/features/post/component/block/issues-responses/issues-responses-form';
import {
  WgTemplateForm,
  type WgTemplateData
} from '@/features/post/component/block/wg-template/wg-template-form';
import type { PostContent } from '@/server/action/post/types';

type PostContentCardProps = {
  activeLanguage: 'en' | 'km';
  onActiveLanguageChange: (language: 'en' | 'km') => void;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  isHeroBannerSection: boolean;
  isStatsSection: boolean;
  isTextBlockSection: boolean;
  isWgCoChairsSection: boolean;
  isAnnualReportsSection: boolean;
  isIssuesResponsesSection: boolean;
  isWgTemplateSection: boolean;
  isAddressSection: boolean;
  editorValue: PostContent | string;
  heroBannerValue: HeroBannerData;
  statsValue: StatsBlockData;
  textBlockValue: TextBlockData;
  wgCoChairsValue: WgCoChairsData;
  annualReportsValue: AnnualReportsData;
  issuesResponsesValue: IssuesResponsesData;
  wgTemplateValue: WgTemplateData;
  onTitleEnChange: (value: string) => void;
  onTitleKmChange: (value: string) => void;
  onDescriptionEnChange: (value: string) => void;
  onDescriptionKmChange: (value: string) => void;
  onEditorChange: (value: PostContent) => void;
  onBannerChange: (value: HeroBannerData) => void;
  onStatsChange: (value: StatsBlockData) => void;
  onTextBlockChange: (value: TextBlockData) => void;
  onWgCoChairsChange: (value: WgCoChairsData) => void;
  onAnnualReportsChange: (value: AnnualReportsData) => void;
  onIssuesResponsesChange: (value: IssuesResponsesData) => void;
  onWgTemplateChange: (value: WgTemplateData) => void;
};

export function PostContentCard({
  activeLanguage,
  onActiveLanguageChange,
  titleEn,
  titleKm,
  descriptionEn,
  descriptionKm,
  isHeroBannerSection,
  isStatsSection,
  isTextBlockSection,
  isWgCoChairsSection,
  isAnnualReportsSection,
  isIssuesResponsesSection,
  isWgTemplateSection,
  isAddressSection,
  editorValue,
  heroBannerValue,
  statsValue,
  textBlockValue,
  wgCoChairsValue,
  annualReportsValue,
  issuesResponsesValue,
  wgTemplateValue,
  onTitleEnChange,
  onTitleKmChange,
  onDescriptionEnChange,
  onDescriptionKmChange,
  onEditorChange,
  onBannerChange,
  onStatsChange,
  onTextBlockChange,
  onWgCoChairsChange,
  onAnnualReportsChange,
  onIssuesResponsesChange,
  onWgTemplateChange
}: PostContentCardProps) {
  return (
    <Card>
      <CardHeader className='space-y-3'>
        <Tabs
          value={activeLanguage}
          onValueChange={(value) =>
            onActiveLanguageChange(value as 'en' | 'km')
          }
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
          onValueChange={(value) =>
            onActiveLanguageChange(value as 'en' | 'km')
          }
          className='space-y-3'
        >
          <TabsContent value='en'>
            <Label htmlFor='title-en'>Title</Label>
            <Input
              id='title-en'
              value={titleEn}
              onChange={(event) => onTitleEnChange(event.target.value)}
              placeholder='Enter English title'
              className='mt-1'
            />
            <Label className='mt-3 block' htmlFor='description-en'>
              Description
            </Label>
            <Textarea
              id='description-en'
              value={descriptionEn}
              onChange={(event) => onDescriptionEnChange(event.target.value)}
              placeholder='Short description'
              className='mt-1'
            />
          </TabsContent>

          <TabsContent value='km'>
            <Label htmlFor='title-km'>Title</Label>
            <Input
              id='title-km'
              value={titleKm}
              onChange={(event) => onTitleKmChange(event.target.value)}
              placeholder='Enter Khmer title'
              className='mt-1'
            />
            <Label className='mt-3 block' htmlFor='description-km'>
              Description
            </Label>
            <Textarea
              id='description-km'
              value={descriptionKm}
              onChange={(event) => onDescriptionKmChange(event.target.value)}
              placeholder='Description in khmer'
              className='mt-1'
            />
          </TabsContent>
        </Tabs>

        {isHeroBannerSection ? (
          <div className='space-y-2'>
            <CardTitle className='text-sm font-medium'>
              Hero Banner Content
            </CardTitle>
            <BannerForm
              language={activeLanguage}
              value={heroBannerValue}
              onChange={onBannerChange}
            />
          </div>
        ) : isStatsSection ? (
          <div className='space-y-2'>
            <CardTitle className='text-sm font-medium'>
              Stats Block Content
            </CardTitle>
            <StatsForm
              language={activeLanguage}
              value={statsValue}
              onChange={onStatsChange}
            />
          </div>
        ) : isTextBlockSection ? (
          <div className='space-y-2'>
            <CardTitle className='text-sm font-medium'>
              Text Block Content
            </CardTitle>
            <TextBlockForm
              language={activeLanguage}
              value={textBlockValue}
              onChange={onTextBlockChange}
            />
          </div>
        ) : isWgCoChairsSection ? (
          <div className='space-y-2'>
            <CardTitle className='text-sm font-medium'>
              Working Group Co-Chairs
            </CardTitle>
            <WgCoChairsForm
              language={activeLanguage}
              value={wgCoChairsValue}
              onChange={onWgCoChairsChange}
            />
          </div>
        ) : isAnnualReportsSection ? (
          <div className='space-y-2'>
            <CardTitle className='text-sm font-medium'>
              Annual Reports
            </CardTitle>
            <AnnualReportsForm
              language={activeLanguage}
              value={annualReportsValue}
              onChange={onAnnualReportsChange}
            />
          </div>
        ) : isIssuesResponsesSection ? (
          <div className='space-y-2'>
            <CardTitle className='text-sm font-medium'>
              Issues & Responses
            </CardTitle>
            <IssuesResponsesForm
              language={activeLanguage}
              value={issuesResponsesValue}
              onChange={onIssuesResponsesChange}
            />
          </div>
        ) : isWgTemplateSection ? (
          <div className='space-y-2'>
            <CardTitle className='text-sm font-medium'>WG Template</CardTitle>
            <WgTemplateForm
              language={activeLanguage}
              value={wgTemplateValue}
              onChange={onWgTemplateChange}
            />
          </div>
        ) : isAddressSection ? (
          <div className='space-y-2'>
            <CardTitle className='text-sm font-medium'>
              Address Block Preview
            </CardTitle>
          </div>
        ) : (
          <div className='space-y-2'>
            <Label htmlFor='post-content-editor'>Content</Label>
            <div className='mt-2'>
              <PostContentEditor
                id='post-content-editor'
                value={editorValue}
                onChange={onEditorChange}
                placeholder='Write the post content...'
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
