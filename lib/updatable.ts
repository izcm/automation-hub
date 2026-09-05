// TODO: move to @a2zb/types alongside ByKey/Pageable/Countable.
export interface Updatable<TEntity, TKey> {
  update(key: TKey, fields: Partial<TEntity>): Promise<void>;
}
