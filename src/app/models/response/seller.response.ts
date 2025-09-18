import { ProductModel } from "../internal/product.model";
import { SellerModel } from "../internal/seller.model";


export class SellerResponse {
 
    message!: string;
    data!: Array<SellerModel>;
    code!: number;
    page?: number;
    total?: number;
    xpage?: number;
  
  
    static createFromObject(responseData_: any): SellerResponse {
      console.log("data creteformobject",responseData_.data);
      const newObj = new SellerResponse();
      newObj.code = responseData_.code;
      newObj.message = responseData_.message;
      newObj.page = responseData_.page;
      newObj.total = responseData_.total;
      newObj.xpage = responseData_.xpage;
      newObj.data = responseData_.data &&  SellerModel.createFromObjects(responseData_.data[0]);
  
  
      return newObj;
    }
  }
  