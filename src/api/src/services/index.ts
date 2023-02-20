export * from "./email-service";
export * from "./directory-service";
export * from "./generic-service";
export * from "./user-service";
export * from "./permission-service";
export * from "./visitor-centre-service";

export interface QueryStatement {
  field: string;
  fields: [];
  operator: string;
  value: any;
}

export interface SortStatement {
  field: string;
  direction: SortDirection;
}

export enum SortDirection {
  ASCENDING = "asc",
  DESCENDING = "desc",
}
