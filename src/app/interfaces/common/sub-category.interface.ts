import {Category} from './category.interface';

export interface SubCategory {
  select: Boolean;
  _id?: string;
  category?: Category;
  name?: string;
  code?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
