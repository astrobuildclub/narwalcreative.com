// ./src/pages/api/preview.ts
import type { APIRoute } from 'astro';
import { sanityClient } from 'sanity:client';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import {
  PREVIEW_COOKIE,
  PREVIEW_MAX_AGE,
  createPreviewCookieValue,
} from '../../sanity/lib/visual-editing';

// Wordt aangeroepen door de Presentation tool (previewMode.enable in sanity.config.ts).
// De Studio maakt een tijdelijk secret aan; dat valideren we hier met de read token.
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (!token) {
    return new Response('SANITY_API_READ_TOKEN ontbreekt', { status: 500 });
  }

  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    sanityClient.withConfig({ token }),
    request.url,
  );

  if (!isValid) {
    return new Response('Ongeldig preview-secret', { status: 401 });
  }

  cookies.set(PREVIEW_COOKIE, createPreviewCookieValue(token), {
    path: '/',
    maxAge: PREVIEW_MAX_AGE,
    httpOnly: true,
    secure: import.meta.env.PROD,
    // In productie 'none', zodat het ook werkt als de Studio op een ander domein draait.
    sameSite: import.meta.env.PROD ? 'none' : 'lax',
  });

  return redirect(redirectTo, 307);
};
