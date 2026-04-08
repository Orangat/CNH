/**
 * Curated Unsplash photos used across the redesigned site.
 *
 * Unsplash allows hotlinking from the official CDN (images.unsplash.com)
 * under the Unsplash License — free for commercial use, no attribution
 * required, but credit is appreciated and shown in the Footer.
 *
 * To swap any image: replace the photoId and update the credit. The full
 * page URL on Unsplash is https://unsplash.com/photos/{photoId}.
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
  // Hero — worship hands raised in light
  worshipHands: make(
    '1438232992991-995b7058bbb3',
    'Hands raised in worship at sunset',
    'Edward Cisneros',
    'edwardcisneros'
  ),
  // Sunday service congregation
  congregation: make(
    '1507692049790-de58290a4334',
    'Congregation gathered for Sunday service',
    'Akira Hojo',
    'sky_high1117'
  ),
  // Open Bible
  openBible: make(
    '1504052434569-70ad5836ab65',
    'Open Bible on a wooden table',
    'Aaron Burden',
    'aaronburden'
  ),
  // Cross silhouette against sky
  cross: make(
    '1490127252417-7c393f993ee4',
    'Wooden cross silhouette against evening sky',
    'Aaron Burden',
    'aaronburden'
  ),
  // Diverse community
  community: make(
    '1529156069898-49953e39b3ac',
    'Diverse community gathering with hands together',
    'Hannah Busing',
    'hannahbusing'
  ),
  // Worship music / band
  worship: make(
    '1510924199351-4e9d94df18a6',
    'Worship band on stage with stage lights',
    'Edward Cisneros',
    'edwardcisneros'
  ),
  // Kids in classroom
  kids: make(
    '1503676260728-1c00da094a0b',
    'Children learning together in a classroom',
    'CDC',
    'cdc'
  ),
  // Worship night / community gathering with music
  fellowship: make(
    '1525026198548-4baa812f1183',
    'Worship gathering with raised hands and stage lights',
    'Edward Cisneros',
    'edwardcisneros'
  ),
  // Charlotte / NC cityscape
  charlotte: make(
    '1496024840928-4c417adf211d',
    'Charlotte North Carolina skyline at dusk',
    'Kevin Charit',
    'kcharit'
  ),
  // Praying hands
  prayer: make(
    '1545987796-200677ee1011',
    'Hands folded in prayer with light',
    'Patrick Fore',
    'patrickian4'
  ),
  // Communion / gathering (replacement — original ID 404'd)
  communion: make(
    '1511795409834-ef04bbd61622',
    'People gathered together in community',
    'Priscilla Du Preez',
    'priscilladupreez'
  ),
  // Welcome / open doors
  welcome: make(
    '1519671482749-fd09be7ccebf',
    'Open church doors with sunlight streaming in',
    'Karl Fredrickson',
    'karlfredrickson'
  ),
};

export type StockPhotoKey = keyof typeof stockPhotos;
