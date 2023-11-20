export class ResponseResultDto<T> {
  result?: T | T[];
  total?: string | number;
  currentPage?: string | number;
  prevPage?: string | number | null;
  nextPage?: string | number | null;
  statusCode?: number;
  message?: string;
}
