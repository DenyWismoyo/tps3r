import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.organizationName,
    short_name: 'TPS 3R ADK',
    description: SITE_CONFIG.description,
    start_url: '/admin',
    display: 'standalone',
    background_color: '#fafbf9',
    theme_color: '#1b4332',
    orientation: 'portrait',
    lang: 'id',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
