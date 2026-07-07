import { moveItem } from './moveItem';

test('moveItem moves an element and returns a new array', () => {
  const a = ['x', 'y', 'z'];
  expect(moveItem(a, 0, 1)).toEqual(['y', 'x', 'z']);
  expect(moveItem(a, 2, 0)).toEqual(['z', 'x', 'y']);
  expect(moveItem(a, 0, 5)).toEqual(['y', 'z', 'x']); // clamps
  expect(a).toEqual(['x', 'y', 'z']); // original untouched
});
