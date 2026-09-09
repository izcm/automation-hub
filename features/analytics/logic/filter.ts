export type Filter<T> = {
  predicate: (item: T) => boolean;
};
