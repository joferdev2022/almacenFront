
export class SellerRequest {
    nombreVendedor!: string;
    aliasVendedor!: string;
    local!: number;
  
    static createFromObject(seller: any): SellerRequest {
      const newObj = new SellerRequest();
      newObj.nombreVendedor = seller.nombreVendedor;
      newObj.aliasVendedor = seller.aliasVendedor;
      newObj.local = seller.local;
      // newObj.fechaDeCaducidad = product.startDate;
   
      return newObj;
    }
  }
  