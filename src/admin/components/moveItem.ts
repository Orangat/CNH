/** Return a new array with the item at `from` moved to `to` (clamped in range). */
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const clamped = Math.max(0, Math.min(to, next.length - 1));
  const [item] = next.splice(from, 1);
  next.splice(clamped, 0, item);
  return next;
}
