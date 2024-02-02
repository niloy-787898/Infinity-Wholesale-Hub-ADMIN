import {Inject, Injectable} from '@angular/core';
import * as moment from 'moment';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {
  }


  /**
   * UTILS
   */

  getDateString(date: Date, format?: string): string {
    const fm = format ? format : 'YYYY-MM-DD';
    return moment(date).format(fm);
  }

  getDateMonth(fromZero: boolean, date?: any): number {
    let d;
    if (date) {
      d = new Date(date)
    } else {
      d = new Date();
    }
    const month = d.getMonth();
    return  fromZero ? month : month + 1;
  }

  mergeArrayString(array1: string[], array2: string[]): string[] {
    const c = array1.concat(array2);
    return c.filter((item, pos) => c.indexOf(item) === pos);
  }


  /**
   * GET RANDOM NUMBER
   */
  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getImageName(originalName: string): string {
    const array = originalName.split('.');
    array.pop();
    return array.join('');
  }

  groupByField<T>(dataArray: T[], field: string): T[] {
    const data = dataArray.reduce((group, product) => {
      const uniqueField = product[field]
      group[uniqueField] = group[uniqueField] ?? [];
      group[uniqueField].push(product);
      return group;
    }, {});

    const final = [];

    for (const key in data) {
      final.push({
        _id: key,
        // data: data[key],
        data: this.totalCal(data[key])
      })
    }

    return final as T[];

  }


  totalCal = (data) => {
    const total = data.reduce((acc, value) => acc + value.total, 0);
    const totalPurchasePrice = data.reduce((acc, value) => acc + value.totalPurchasePrice, 0);
    return {
      total,
      totalPurchasePrice,
      profit: total - totalPurchasePrice,
    };
  }


}
