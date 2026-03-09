export type ActivityLogEvent = 'created' | 'updated' | 'deleted';

export type ActivityLogItem = {
  id: string;
  event: ActivityLogEvent;
  activity: string;
  module: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  targetLabel: string;
  targetType: string;
  date: string;
  contentPath: string;
};

export type ActivityLogMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ActivityLogListResult = {
  items: ActivityLogItem[];
  meta: ActivityLogMeta;
};
