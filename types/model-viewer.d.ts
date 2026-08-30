/**
 * JSX typing for <model-viewer>.
 *
 * @google/model-viewer registers a custom element rather than exporting a React
 * component, so TypeScript has no idea the tag exists until it is declared here.
 * This lives in its own file rather than inside components/RugAr.tsx because a global
 * type augmentation is not something a component should be carrying around.
 *
 * The attributes are deliberately loose. model-viewer has upwards of eighty of them,
 * they change between releases, and narrowing them here would mean maintaining a copy
 * of someone else's API surface for no benefit — the element ignores what it does not
 * recognise.
 */
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> &
        Record<string, unknown>
    }
  }
}

export {}
