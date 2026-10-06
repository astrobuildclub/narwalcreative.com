// ./sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemaTypes';
import { presentationTool } from 'sanity/presentation';
import { resolve } from './src/sanity/lib/resolve';
import { structure } from './src/sanity/deskStructure';
// plug-ins
import { linkField } from 'sanity-plugin-link-field';
import seofields from 'sanity-plugin-seofields';

// Studio in de site (/admin): preview op hetzelfde domein. In de gedeployde
// Studio op *.sanity.studio wijst de preview naar de live site.
const SITE_URL = 'https://narwalcreative.netlify.app';
const previewOrigin =
  typeof location === 'undefined'
    ? 'http://localhost:4321'
    : location.hostname.endsWith('.sanity.studio')
      ? SITE_URL
      : location.origin;

export default defineConfig({
  name: 'narwal-creative',
  title: 'Narwal Creative',
  // Vaste waarden zodat de gedeployde studio (sanity.studio) altijd werkt; .env wordt daar niet geladen
  projectId: 'q178y836',
  dataset: 'production',
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: {
        initial: previewOrigin,
        // Zet via /api/preview een cookie; drafts alleen in de Studio-iframe.
        // Zie ~/Code/_standards/SANITY.md
        previewMode: {
          enable: '/api/preview',
          disable: '/api/preview/disable',
        },
      },
    }),
    linkField({
      linkableSchemaTypes: ['page', 'work'],
    }),
    seofields({
      seoPreview: true,
      fieldVisibility: {
        page: {
          hiddenFields: ['openGraphSiteName', 'twitterSite'],
        },
        work: {
          hiddenFields: ['openGraphSiteName', 'twitterSite'],
        },
        career: {
          hiddenFields: ['openGraphSiteName', 'twitterSite'],
        },
        siteSettings: {
          hiddenFields: [
            'title',
            'description',
            'canonicalUrl',
            'metaImage',
            'keywords',
            'openGraphUrl',
            'openGraphTitle',
            'openGraphDescription',
            'openGraphType',
            'openGraphImageType',
            'openGraphImage',
            'openGraphImageUrl',
            'twitterCard',
            'twitterCreator',
            'twitterTitle',
            'twitterDescription',
            'twitterImageType',
            'twitterImage',
            'twitterImageUrl',
            'robots',
            'metaAttributes',
          ],
        },
      },
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
