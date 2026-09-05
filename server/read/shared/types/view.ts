import { ResourceMap, ResourceName, ResourceType } from "@/lib/resource";

// for every resource there can be several views
// a view is referenced by its key and provides a transform function `Resource` => object
// eg.
// type EmployeeView = {
//   list: (employee: Employee) => EmployeeListItem;
//   detail: (employee: Employee) => EmployeeDetail;
//   export: (employee: Employee) => EmployeeExport;
// };
export type ResourceViews<
  RMap extends ResourceMap,
  R extends ResourceName<RMap>,
> = Record<string, (resource: ResourceType<RMap, R>) => object>;
