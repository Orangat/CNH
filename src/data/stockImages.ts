/**
 * Curated Unsplash photos used across the redesigned site.
 *
 * Unsplash allows hotlinking from the official CDN (images.unsplash.com)
 * under the Unsplash License — free for commercial use, no attribution
 * required, but credit is appreciated and shown in the Footer.
 *
 * To swap any image: replace the photoId and update the credit. The full
 * page URL on Unsplash is https://unsplash.com/photos/{photoId}.
 *
 * Photos of the church itself live in churchPhotos.ts.
 */

interface StockPhoto {
  id: string;
  src: (w?: number) => string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;
}

const make = (
  photoId: string,
  alt: string,
  photographer: string,
  photographerHandle: string
): StockPhoto => ({
  id: photoId,
  src: (w = 1600) =>
    `https://images.unsplash.com/photo-${photoId}?w=${w}&q=80&auto=format&fit=crop`,
  alt,
  photographer,
  photographerUrl: `https://unsplash.com/@${photographerHandle}?utm_source=church_of_new_hope&utm_medium=referral`,
  unsplashUrl: `https://unsplash.com/photos/${photoId}?utm_source=church_of_new_hope&utm_medium=referral`,
});

export const stockPhotos = {
  // Giving / generosity — hands holding seedling
  cross: make(
    '1679110663825-c6ec1ad51884',
    'Hands gently holding a small seedling in soil',
    'Jennifer Delmarre',
    'delmarre'
  ),
  // Charlotte / NC cityscape
  charlotte: make(
    '1496024840928-4c417adf211d',
    'Charlotte North Carolina skyline at dusk',
    'Kevin Charit',
    'kcharit'
  ),
};

export type StockPhotoKey = keyof typeof stockPhotos;
