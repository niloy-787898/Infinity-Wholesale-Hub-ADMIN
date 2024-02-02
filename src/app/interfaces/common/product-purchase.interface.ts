

export interface ProductPurchase {
  product: any;
  previousQuantity: number;
  updatedQuantity: number;
  createdAtString: string;
  updatedAtString: string;
  month: number;
  year: number;
}


export  interface  ProductPurchaseGroup{
  _id?: string;
  data: [ProductPurchase];
  select?: boolean;
}
