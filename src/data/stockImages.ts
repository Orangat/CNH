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
  // Giving / generosity — hands holding seedling
  cross: make(
    '1679110663825-c6ec1ad51884',
    'Hands gently holding a small seedling in soil',
    'Jennifer Delmarre',
    'delmarre'
  ),
  // Diverse community
  community: make(
    '1529156069898-49953e39b3ac',
    'Diverse community gathering with hands together',
    'Hannah Busing',
    'hannahbusing'
  ),
  // Church community event / gathering
  worship: make(
    '1695938746747-ec185ea81325',
    'People greeting and embracing at a church community event',
    'Claudia Raya',
    'claudiaraya'
  ),
  // Kids in classroom
  kids: make(
    '1503676260728-1c00da094a0b',
    'Children learning together in a classroom',
    'CDC',
    'cdc'
  ),
  // Small group worship / Bible study indoors
  fellowship: make(
    '1649365810760-19eaf9c78ca7',
    'Young people worshipping together indoors at a church gathering',
    'Ismael Paramo',
    'ismaelparamo'
  ),
  // Charlotte / NC cityscape
  charlotte: make(
    '1496024840928-4c417adf211d',
    'Charlotte North Carolina skyline at dusk',
    'Kevin Charit',
    'kcharit'
  ),
  // People praying together indoors
  prayer: make(
    '1547382002-b908c9367d83',
    'People praying together with arms around each other at church',
    'Sam Balye',
    'sambalye'
  ),
  // Communion / gathering (replacement — original ID 404'd)
  communion: make(
    '1511795409834-ef04bbd61622',
    'People gathered together in community',
    'Priscilla Du Preez',
    'priscilladupreez'
  ),
  // Welcome / congregation gathered in church
  welcome: make(
    '1759127481171-30a27de310ad',
    'Congregation seated in a church during a service',
    'Benito Sanity',
    'benitosito'
  ),
};

export type StockPhotoKey = keyof typeof stockPhotos;
