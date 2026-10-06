// astro.config.mjs
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

import { loadEnv } from 'vite';
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV || 'production',
  process.cwd(),
  '',
);

export default defineConfig({
  // TODO bij livegang: https://narwalcreative.com
  site: 'https://narwalcreative.netlify.app',

  // Prefetch: with ClientRouter, prefetch is on by default. Use viewport strategy
  // so links are prefetched when visible (nav links = immediately), making clicks feel instant.
  prefetch: {
    defaultStrategy: 'viewport',
  },

  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: '2025-01-28',
      // /admin i.p.v. /studio: deze route gaat vóór [...uri], dus een pagina
      // met slug 'studio' zou onbereikbaar worden.
      studioBasePath: '/admin',
      stega: {
        studioUrl: '/admin',
      },
    }),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],

  vite: {
    optimizeDeps: {
      force: true,
      include: [
        'react',
        'react-dom',
        'sanity',
        '@sanity/astro',
        'sanity-plugin-link-field',
        'styled-components',
      ],
    },
    ssr: {
      noExternal: ['sanity-plugin-link-field', 'styled-components'],
    },
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },

  // SSR: Visual Editing toont drafts per request (zie src/middleware.ts)
  output: 'server',
  adapter: netlify(),
  image: {
    domains: ['cdn.sanity.io'],
  },
});
