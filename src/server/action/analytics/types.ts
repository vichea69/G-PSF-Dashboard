export type AnalyticsSummary = {
  sessions: number;
  sessionsChange: number | null;
  activeUsers: number;
  activeUsersChange: number | null;
  newUsers: number;
  newUsersChange: number | null;
  pageViews: number;
  pageViewsChange: number | null;
};

export type AnalyticsTimelinePoint = {
  label: string;
  sessions: number;
  activeUsers: number;
  newUsers: number;
  pageViews: number;
};

export type AnalyticsOverviewData = {
  summary: AnalyticsSummary;
  timeline: AnalyticsTimelinePoint[];
};

export type AnalyticsTopPage = {
  title: string;
  path: string;
  visitors: number;
};

export type AnalyticsCountry = {
  country: string;
  visitors: number;
};

export type AnalyticsBrowser = {
  browser: string;
  visitors: number;
};
