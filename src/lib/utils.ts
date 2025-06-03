/** Simple debounce (used for throttled localStorage writes) */
export function debounce<T extends (...a: any[]) => void>(fn: T, wait = 500): T {
  let id: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), wait);
  }) as T;
}
