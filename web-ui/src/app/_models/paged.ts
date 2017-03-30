
export class PagedData<T> {
  currentPage: number = null;
  lastPage: number = null;
  prevPage: number = null;
  nextPage: number = null;
  deltaPages: number[] = [];
  itemCount = 0;

  page = 1;
  perPage = 25;
  offset = 0;
  deltaPageCount = 2;
  results: T[] = [];
  parseResultFromJson: Function;

  updateFromJson(data): PagedData<T> {
    if (!data) {
      this.page = 1;
      this.offset = 0;
      this.results = [];
    } else {
      const res = data.results || [];
      this.results = [];
      for (let i = 0; i < res.length; i++) {
        if (this.parseResultFromJson) {
          this.results.push(this.parseResultFromJson(res[i]));
        } else {
          this.results.push(res[i]);
        }
      }

      const options = data.options || {};
      this.page = options.page || this.page;
      this.perPage = options.perPage || this.perPage;
      this.offset = options.offset || this.offset;
      this.deltaPageCount = options.delta || this.deltaPageCount;

      this.currentPage = data.current;
      this.lastPage = data.last;
      this.nextPage = data.next;
      this.prevPage = data.prev;
      this.deltaPages = data.pages || [];
      this.itemCount = data.count;
    }
    return this;
  }
}
