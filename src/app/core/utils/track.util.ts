/** Stable `@for` track function for any entity carrying a string `id`. */
export function trackById<T extends { readonly id: string }>(_index: number, item: T): string {
  return item.id;
}

/** Track function for primitive lists. */
export function trackByValue<T>(_index: number, item: T): T {
  return item;
}
