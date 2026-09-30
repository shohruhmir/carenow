export type TLinks = {
  label: string;
  to: string;
  icon?: string;
}[];

export type TFilters = {
  seachKey: string;
  sort: number;
  page: number;
  page_count: number;
  per_page: number;
  total: number;
};
