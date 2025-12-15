import {
  type MediaFile,
  formatFileSize,
  formatDate
} from '@/features/media/types/media-type';

export { formatFileSize, formatDate };

export const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'hero-image.png',
    type: 'image',
    size: 2458000,
    url: '/professional-hero-image.jpg',
    thumbnail: '/professional-hero-image.jpg',
    uploadedAt: new Date('2025-11-20T10:30:00')
  },
  {
    id: '2',
    name: 'product-demo.mp4',
    type: 'video',
    size: 15728000,
    url: '#',
    uploadedAt: new Date('2025-11-19T14:22:00')
  },
  {
    id: '3',
    name: 'team-photo.jpg',
    type: 'image',
    size: 1890000,
    url: '/professional-team-photo.png',
    thumbnail: '/professional-team-photo.png',
    uploadedAt: new Date('2025-11-18T09:15:00')
  },
  {
    id: '4',
    name: 'presentation.pdf',
    type: 'pdf',
    size: 5242880,
    url: '#',
    uploadedAt: new Date('2025-11-17T16:45:00')
  },
  {
    id: '5',
    name: 'logo-variations.png',
    type: 'image',
    size: 892000,
    url: '/logo-variations.png',
    thumbnail: '/logo-variations.png',
    uploadedAt: new Date('2025-11-16T11:20:00')
  },
  {
    id: '6',
    name: 'architecture-diagram.pdf',
    type: 'pdf',
    size: 3145728,
    url: '#',
    uploadedAt: new Date('2025-11-15T13:10:00')
  },
  {
    id: '7',
    name: 'banner-design.jpg',
    type: 'image',
    size: 1245000,
    url: '/website-banner.png',
    thumbnail: '/website-banner.png',
    uploadedAt: new Date('2025-11-14T08:55:00')
  },
  {
    id: '8',
    name: 'tutorial-video.mp4',
    type: 'video',
    size: 25165824,
    url: '#',
    uploadedAt: new Date('2025-11-13T15:30:00')
  }
];
