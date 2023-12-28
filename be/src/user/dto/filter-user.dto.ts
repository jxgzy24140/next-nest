export class FilterUserDto {
  page: number | string;
  items_per_page: number | string;
  search_query?: string;
}
