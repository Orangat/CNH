import { pickLang } from './pickLang';

test('pickLang prefers active language, falls back when empty', () => {
  expect(pickLang('uk', 'Hello', 'Привіт')).toBe('Привіт');
  expect(pickLang('uk', 'Hello', '')).toBe('Hello');   // fallback
  expect(pickLang('en', '', 'Привіт')).toBe('Привіт'); // fallback
  expect(pickLang('en', '', '')).toBe('');
});
