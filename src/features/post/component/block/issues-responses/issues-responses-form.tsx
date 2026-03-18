'use client';

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import {
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquare,
  Plus,
  X
} from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';

type LocalizedTextValue = {
  en: string;
  km: string;
};

export type IssueResponseStatus = 'resolved' | 'in_progress' | 'pending';

type IssueResponseItem = {
  title: LocalizedTextValue;
  status: IssueResponseStatus;
  lastUpdate: string;
  link: string;
};

export interface IssuesResponsesData {
  items: IssueResponseItem[];
}

const createEmptyItem = (): IssueResponseItem => ({
  title: { en: '', km: '' },
  status: 'pending',
  lastUpdate: '',
  link: ''
});

export const createEmptyIssuesResponsesData = (): IssuesResponsesData => ({
  items: []
});

const normalizeStatus = (value: unknown): IssueResponseStatus => {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (normalized === 'resolved') return 'resolved';
  if (normalized === 'in_progress' || normalized === 'in progress') {
    return 'in_progress';
  }
  return 'pending';
};

const getStatusMeta = (
  status: IssueResponseStatus,
  t: (key: string) => string
) => {
  if (status === 'resolved') {
    return {
      label: t('post.blocks.issuesResponses.resolved'),
      variant: 'success' as const,
      Icon: CheckCircle2
    };
  }

  if (status === 'in_progress') {
    return {
      label: t('post.blocks.issuesResponses.inProgress'),
      variant: 'info' as const,
      Icon: Loader2
    };
  }

  return {
    label: t('post.blocks.issuesResponses.pending'),
    variant: 'warning' as const,
    Icon: Clock3
  };
};

const renderStatusBadge = (
  status: IssueResponseStatus,
  t: (key: string) => string
) => {
  const meta = getStatusMeta(status, t);
  const Icon = meta.Icon;

  return (
    <Badge
      variant={meta.variant}
      appearance='outline'
      size='sm'
      className='max-w-full gap-1'
    >
      <Icon
        className={`h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`}
      />
      <span className='truncate'>{meta.label}</span>
    </Badge>
  );
};

const normalizeIssuesResponsesData = (
  value?: IssuesResponsesData
): IssuesResponsesData => {
  if (!value || typeof value !== 'object')
    return createEmptyIssuesResponsesData();

  return {
    items: Array.isArray(value.items)
      ? value.items.map((item) => ({
          title: {
            en: item?.title?.en ?? '',
            km: item?.title?.km ?? ''
          },
          status: normalizeStatus(item?.status),
          lastUpdate: item?.lastUpdate ?? '',
          link: item?.link ?? ''
        }))
      : []
  };
};

type IssuesResponsesFormProps = {
  language: 'en' | 'km';
  value?: IssuesResponsesData;
  onChange?: (value: IssuesResponsesData) => void;
};

export function IssuesResponsesForm({
  language,
  value,
  onChange
}: IssuesResponsesFormProps) {
  const { t } = useTranslate();
  const isKhmer = language === 'km';
  const formData = normalizeIssuesResponsesData(value);
  const statusOptions: Array<{ value: IssueResponseStatus }> = [
    { value: 'resolved' },
    { value: 'in_progress' },
    { value: 'pending' }
  ];

  const updateItem = (
    index: number,
    updater: (item: IssueResponseItem) => IssueResponseItem
  ) => {
    onChange?.({
      ...formData,
      items: formData.items.map((item, itemIndex) =>
        itemIndex === index ? updater(item) : item
      )
    });
  };

  const addItem = () => {
    onChange?.({
      ...formData,
      items: [...formData.items, createEmptyItem()]
    });
  };

  const removeItem = (index: number) => {
    onChange?.({
      ...formData,
      items: formData.items.filter((_, itemIndex) => itemIndex !== index)
    });
  };

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='size-5' />
          {t('post.blocks.issuesResponses.title')}
        </CardTitle>
        <CardAction>
          <Button type='button' size='sm' onClick={addItem}>
            <Plus className='mr-1 size-4' />
            {t('post.blocks.issuesResponses.addItem')}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-4'>
        {formData.items.map((item, index) => (
          <div
            key={index}
            className='bg-muted/20 space-y-4 rounded-lg border p-4'
          >
            <div className='flex items-center justify-between gap-2'>
              <Label>{`${t('post.blocks.issuesResponses.item')} ${index + 1}`}</Label>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7'
                onClick={() => removeItem(index)}
              >
                <X className='size-4' />
              </Button>
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`issues-responses-title-${index}`}>
                {isKhmer
                  ? t('post.blocks.issuesResponses.titleKhmer')
                  : t('post.blocks.issuesResponses.titleEnglish')}
              </Label>
              <Input
                id={`issues-responses-title-${index}`}
                value={isKhmer ? item.title.km : item.title.en}
                onChange={(event) =>
                  updateItem(index, (current) => ({
                    ...current,
                    title: {
                      ...current.title,
                      [language]: event.target.value
                    }
                  }))
                }
                placeholder={
                  isKhmer
                    ? t('post.blocks.issuesResponses.enterTitleKhmer')
                    : t('post.blocks.issuesResponses.enterTitleEnglish')
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>{t('post.blocks.issuesResponses.status')}</Label>
              <Select
                value={item.status}
                onValueChange={(nextStatus) =>
                  updateItem(index, (current) => ({
                    ...current,
                    status: normalizeStatus(nextStatus)
                  }))
                }
              >
                <SelectTrigger className='w-full min-w-0'>
                  <div className='min-w-0'>
                    {renderStatusBadge(item.status, t)}
                  </div>
                </SelectTrigger>
                <SelectContent className='w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]'>
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className='py-2'
                    >
                      {renderStatusBadge(option.value, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`issues-responses-last-update-${index}`}>
                {t('post.blocks.issuesResponses.lastUpdate')}
              </Label>
              <Input
                id={`issues-responses-last-update-${index}`}
                value={item.lastUpdate}
                onChange={(event) =>
                  updateItem(index, (current) => ({
                    ...current,
                    lastUpdate: event.target.value
                  }))
                }
                placeholder={t(
                  'post.blocks.issuesResponses.lastUpdatePlaceholder'
                )}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`issues-responses-link-${index}`}>
                {t('post.blocks.issuesResponses.linkUrl')}
              </Label>
              <Input
                id={`issues-responses-link-${index}`}
                value={item.link}
                onChange={(event) =>
                  updateItem(index, (current) => ({
                    ...current,
                    link: event.target.value
                  }))
                }
                placeholder='https://example.com'
              />
            </div>
          </div>
        ))}

        {formData.items.length === 0 ? (
          <div className='text-muted-foreground rounded-lg border border-dashed py-8 text-center'>
            {t('post.blocks.issuesResponses.noItems')}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
