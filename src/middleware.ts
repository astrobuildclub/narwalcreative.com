// ./src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import {
  PREVIEW_COOKIE,
  isValidPreviewCookie,
  runWithVisualEditing,
} from './sanity/lib/visual-editing';

export const onRequest = defineMiddleware(async (context, next) => {
  // De ondertekende cookie is de beveiliging: alleen /api/preview zet hem, met
  // een geldig secret uit de Studio. Sec-Fetch-Dest beperkt het tot de iframe
  // van de Presentation tool, zodat dezelfde browser in een gewone tab de live
  // site ziet.
  const hasPreviewCookie = isValidPreviewCookie(
    context.cookies.get(PREVIEW_COOKIE)?.value,
  );
  const inIframe = context.request.headers.get('sec-fetch-dest') === 'iframe';
  const visualEditing = hasPreviewCookie && inIframe;
  context.locals.visualEditing = visualEditing;

  // Zo kan loadQuery() de status lezen zonder dat elke page of component
  // hem moet doorgeven.
  const response = await runWithVisualEditing(visualEditing, next);

  // Met preview-cookie nooit cachen (ook geen prefetch die later als
  // navigatie wordt hergebruikt): de inhoud verschilt per iframe/tab.
  if (hasPreviewCookie) {
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Vary', 'Cookie, Sec-Fetch-Dest');
  }

  return response;
});
