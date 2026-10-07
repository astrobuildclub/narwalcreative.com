// ./src/sanity/components/VisualEditing.tsx
// Eigen variant van <VisualEditing> uit @sanity/astro, met een history-adapter.
// Zonder adapter weet de Presentation tool niet op welke pagina de iframe
// staat: de adresbalk blijft op /api/preview hangen, het documentpaneel klopt
// niet meer en de Edit-toggle reageert niet na navigatie.
import {
  VisualEditing as SanityVisualEditing,
  type HistoryAdapter,
} from '@sanity/visual-editing/react';

function currentUrl() {
  return `${location.pathname}${location.search}${location.hash}`;
}

const historyAdapter: HistoryAdapter = {
  // In de preview is elke klik een volledige page load (zie DefaultLayout),
  // dus elke pagina meldt zich één keer bij de Studio.
  subscribe(navigate) {
    navigate({ type: 'replace', url: currentUrl() });
    return () => {};
  },
  // Navigatie vanuit de Studio (adresbalk, "Used on … pages", terug/vooruit).
  update(update) {
    if (update.type === 'pop') {
      history.back();
      return;
    }
    const target = new URL(update.url, location.origin);
    // De Studio stuurt de gemelde URL soms terug: dan niet herladen.
    if (`${target.pathname}${target.search}${target.hash}` === currentUrl()) {
      return;
    }
    if (update.type === 'replace') location.replace(target);
    else location.assign(target);
  },
};

export default function VisualEditing() {
  return (
    <SanityVisualEditing
      portal
      history={historyAdapter}
      refresh={() => {
        // Na een wijziging in de Studio: pagina opnieuw ophalen met de drafts.
        location.reload();
        return Promise.resolve();
      }}
    />
  );
}
