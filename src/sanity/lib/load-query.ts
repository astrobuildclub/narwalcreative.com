// ./src/sanity/lib/load-query.ts
// Haal alle Sanity-content via deze functie op, nooit direct via sanityClient.fetch.
import { type QueryParams } from 'sanity';
import { sanityClient } from 'sanity:client';
import { isVisualEditing } from './visual-editing';

const token = import.meta.env.SANITY_API_READ_TOKEN;

export async function loadQuery<QueryResponse>({
  query,
  params,
}: {
  query: string;
  params?: QueryParams;
}) {
  // Gezet door de middleware: alleen met preview-cookie én in de Studio-iframe.
  const visualEditingEnabled = isVisualEditing();

  if (visualEditingEnabled && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required during Visual Editing.',
    );
  }

  const perspective = visualEditingEnabled ? 'drafts' : 'published';

  const { result, resultSourceMap } = await sanityClient.fetch<QueryResponse>(
    query,
    params ?? {},
    {
      filterResponse: false,
      perspective,
      resultSourceMap: visualEditingEnabled ? 'withKeyArraySelector' : false,
      stega: visualEditingEnabled,
      ...(visualEditingEnabled ? { token } : {}),
    },
  );

  return {
    data: result,
    sourceMap: resultSourceMap,
    perspective,
  };
}
