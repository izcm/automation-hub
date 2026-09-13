export type FilterPredicate<T> = {
  id: string;
  predicate: (item: T) => boolean;
};

export type Filter<T> = {
  id: string;
  predicates: FilterPredicate<T>[];
};
