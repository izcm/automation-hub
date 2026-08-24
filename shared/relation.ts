type RelationName<TResourceNames extends string> =
  | TResourceNames
  | (TResourceNames extends `${infer Singular}s` ? Singular : never);

export const restrictRelationNames =
  <TResourceNames extends string>() =>
  // keys that may or may not be valid = keys of T
  // keys that ARE valid are members of RelationName<TResourceNames>
  // exclude those valid keys from keyof T so we're only left with the invalid keys
  // then force those invalid f....g keys to be of type `never`
  <T extends Partial<Record<RelationName<TResourceNames>, unknown>>>(
    relations: T &
      Record<Exclude<keyof T, RelationName<TResourceNames>>, never>,
  ) =>
    relations;
