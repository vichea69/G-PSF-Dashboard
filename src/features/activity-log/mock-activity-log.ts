import type { ActivityLogItem, ActivityLogListResult } from './types';

// Local fallback data keeps the page usable when the API is unavailable.
export const mockActivityLogItems: ActivityLogItem[] = [
  {
    id: '4',
    event: 'updated',
    activity: 'User logged in',
    module: '/auth',
    userName: 'admin',
    userEmail: 'admin@gmail.com',
    userAvatar: 'uploads/1772605768142-vichea.jpg',
    targetLabel: 'admin',
    targetType: 'user',
    date: '2026-03-09T02:48:38+07:00',
    contentPath: '/admin/users'
  },
  {
    id: '3',
    event: 'created',
    activity: 'Blog post created',
    module: '/post',
    userName: 'admin',
    userEmail: 'admin@gmail.com',
    userAvatar: 'uploads/1772605768142-vichea.jpg',
    targetLabel: 'yoyo',
    targetType: 'post',
    date: '2026-03-09T02:32:45+07:00',
    contentPath: '/admin/post/40'
  },
  {
    id: '2',
    event: 'updated',
    activity: 'Blog post updated',
    module: '/post',
    userName: 'admin',
    userEmail: 'admin@gmail.com',
    userAvatar: 'uploads/1772605768142-vichea.jpg',
    targetLabel: 'Meeting Minutes',
    targetType: 'post',
    date: '2026-03-09T02:32:02+07:00',
    contentPath: '/admin/post/39'
  },
  {
    id: '1',
    event: 'created',
    activity: 'Category created',
    module: '/category',
    userName: 'admin',
    userEmail: 'admin@gmail.com',
    userAvatar: 'uploads/1772605768142-vichea.jpg',
    targetLabel: 'Announcement',
    targetType: 'category',
    date: '2026-03-08T16:30:38+07:00',
    contentPath: '/admin/category/7'
  }
];

export const mockActivityLogResult: ActivityLogListResult = {
  items: mockActivityLogItems,
  meta: {
    total: mockActivityLogItems.length,
    page: 1,
    limit: 20,
    totalPages: 1
  }
};
