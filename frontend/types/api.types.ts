export type ApiResponse<Data> = {
  data: Data;
  status: number;
  message: string,
  success: boolean
};


export type TMeta = {
  totalCount: number,
  pageCount: number,
  currentPage: number,
  perPage: number
}
