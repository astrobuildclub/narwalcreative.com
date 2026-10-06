// ./src/pages/api/preview/disable.ts
import type { APIRoute } from 'astro';
import { PREVIEW_COOKIE } from '../../../sanity/lib/visual-editing';

// Wordt aangeroepen door de Presentation tool (previewMode.disable in sanity.config.ts).
export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(PREVIEW_COOKIE, { path: '/' });
  return redirect('/', 307);
};
