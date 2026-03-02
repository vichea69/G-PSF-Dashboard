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
  isAddressSection: boolean;
  editorValue: PostContent | string;
  heroBannerValue: HeroBannerData;
  statsValue: StatsBlockData;
  textBlockValue: TextBlockData;
  onTitleEnChange: (value: string) => void;
  onTitleKmChange: (value: string) => void;
  onDescriptionEnChange: (value: string) => void;
  onDescriptionKmChange: (value: string) => void;
  onEditorChange: (value: PostContent) => void;
  onBannerChange: (value: HeroBannerData) => void;
  onStatsChange: (value: StatsBlockData) => void;
  onTextBlockChange: (value: TextBlockData) => void;
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
  isAddressSection,
  editorValue,
  heroBannerValue,
  statsValue,
  textBlockValue,
  onTitleEnChange,
  onTitleKmChange,
  onDescriptionEnChange,
  onDescriptionKmChange,
  onEditorChange,
  onBannerChange,
  onStatsChange,
  onTextBlockChange
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
