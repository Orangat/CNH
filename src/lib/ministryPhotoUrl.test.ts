import { ministryPhotoUrl } from './supabase';

test('ministryPhotoUrl passes through absolute paths and urls', () => {
  expect(ministryPhotoUrl('/images/x.png')).toBe('/images/x.png');
  expect(ministryPhotoUrl('https://cdn/x.png')).toBe('https://cdn/x.png');
  expect(ministryPhotoUrl(null)).toBe('/images/placeholder.png');
});
