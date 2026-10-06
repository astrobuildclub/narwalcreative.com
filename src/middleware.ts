// ./src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import {
  PREVIEW_COOKIE,
  runWithVisualEditing,
} from './sanity/lib/visual-editing';

export const onRequest = defineMiddleware((context, next) => {
  // De cookie is de beveiliging: alleen /api/preview zet hem, met een geldig
  // secret uit de Studio. Sec-Fetch-Dest beperkt het tot de iframe van de
  // Presentation tool, zodat dezelfde browser in een gewone tab de live site ziet.
  const hasPreviewCookie =
    context.cookies.get(PREVIEW_COOKIE)?.value === 'true';
  const inIframe = context.request.headers.get('sec-fetch-dest') === 'iframe';
  const visualEditing = hasPreviewCookie && inIframe;
  context.locals.visualEditing = visualEditing;

  // Zo kan loadQuery() de status lezen zonder dat elke page of component
  // hem moet doorgeven.
  return runWithVisualEditing(visualEditing, next);
});
