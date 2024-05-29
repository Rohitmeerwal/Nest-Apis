import { Injectable } from '@nestjs/common';
import { Query } from 'mongoose';

@Injectable()
export class ApifeaturesService {
  private _query: Query<any, any>;
  private queryParams: any;

  setQuery(query: Query<any, any>) {
    this._query = query;
  }

  setQueryParams(queryParams: any) {
    this.queryParams = queryParams;
  }

  filter(): this {
    let queryObj = { ...this.queryParams };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne|regex|options|all|in|exists|not|size|or|text|search)\b/g,
      (match) => `$${match}`,
    );
    queryObj = JSON.parse(queryStr);

    this._query = this._query.find(queryObj);
    return this;
  }

  sort(): this {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(',').join(' ');
      this._query = this._query.sort(sortBy);
    } else {
      this._query = this._query.sort('_id');
    }
    return this;
  }

  paginate(): this {
    const page = +this.queryParams.page || 1;
    const limit = +this.queryParams.limit || 100;
    const skip = (page - 1) * limit;
    this._query = this._query.skip(skip).limit(limit);
    return this;
  }

  getQuery(): Query<any, any> {
    return this._query;
  }
}
