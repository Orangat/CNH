/**
 * Real photos of Church of New Hope, taken from the church's Instagram
 * (https://www.instagram.com/newhope.clt/) and self-hosted in
 * public/images/church/.
 *
 * Each photo is stored in two widths: `{file}.jpg` (up to 1600px, for
 * full-width heroes) and `{file}-800.jpg` (for cards and thumbnails).
 * `src(w)` returns the 800px file when w <= 800; `srcSet` offers both so the browser
 * picks the right one for images that are smaller than a hero.
 *
 * To swap a photo: overwrite both files in public/images/church/ (same names)
 * or add new files and point the entry at them.
 */

interface ChurchPhoto {
  src: (w?: number) => string;
  srcSet: string;
  alt: string;
}

const make = (file: string, alt: string): ChurchPhoto => ({
  src: (w = 1600) => `/images/church/${file}${w <= 800 ? '-800' : ''}.jpg`,
  srcSet: `/images/church/${file}-800.jpg 800w, /images/church/${file}.jpg 1600w`,
  alt,
});

export const churchPhotos = {
  // Visit hero — the church building from above (frame from the home-page drone video)
  building: make('church-aerial', 'Aerial view of the Church of New Hope building and entrance'),
  // Leadership hero — pastors praying over the church
  pastorsPraying: make('pastors-praying', 'Pastors praying with hands extended over the church'),
  // Sermons hero — preaching from the stage
  preaching: make('preaching', 'Pastor preaching at Church of New Hope'),
  // Ministries hero — worship team leading the service
  worshipStage: make('worship-stage', 'Worship team leading the congregation on stage'),
  // Prayer hero
  prayer: make('prayer', 'A man praying with folded hands during worship'),
  // Events hero — outdoor worship at the summer church picnic
  summerPicnic: make('summer-picnic', 'Worship band playing on the lawn at a church picnic'),
  // Forms hero — greeting a newcomer with a church bulletin
  welcomeGreeting: make('welcome-greeting', 'Church member handing a bulletin to a guest'),
  // We Believe hero
  openBible: make('open-bible', 'Open Bible with handwritten notes'),
  // Home — "About Church of New Hope"
  congregation: make('congregation', 'Congregation standing in worship during a Sunday service'),
  // Home — "Get connected"
  smallGroup: make('small-group', 'Women gathered around a table at a small group meeting'),

  // Ministry cards
  worshipTeam: make('worship-team', 'Worship team singing on stage'),
  choir: make('choir', 'Church choir singing in white'),
  kids: make('kids-worship', 'Children worshipping together in church'),
  sundaySchool: make('sunday-school', 'Children working on a Sunday school lesson'),
  youth: make('youth', 'Young people smiling at a youth gathering'),
  homeGroup: make('home-group', 'Home group studying together in a living room'),
  prayingTogether: make('praying-together', 'Church member praying for another'),
  hospitality: make('hospitality', 'Welcome team volunteer greeting guests'),

  // Sermons — YouTube channel block (shown until sermons are in the database)
  sermonVideo: make('sermon-video', 'Pastor preaching at the Church of New Hope pulpit'),
};

export type ChurchPhotoKey = keyof typeof churchPhotos;
