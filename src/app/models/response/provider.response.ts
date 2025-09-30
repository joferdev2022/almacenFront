import { ProductModel } from "../internal/product.model";
import { ProviderModel } from "../internal/provider.model";
import { SellerModel } from "../internal/seller.model";


export class ProviderResponse {
 
    message!: string;
    data!: Array<ProviderModel>;
    code!: number;
    page?: number;
    total?: number;
    xpage?: number;
  
  
    static createFromObject(responseData_: any): ProviderResponse {
      console.log("data creteformobject",responseData_.data);
      const newObj = new ProviderResponse();
      newObj.code = responseData_.code;
      newObj.message = responseData_.message;
      newObj.page = responseData_.page;
      newObj.total = responseData_.total;
      newObj.xpage = responseData_.xpage;
      newObj.data = responseData_.data &&  ProviderModel.createFromObjects(responseData_.data[0]);
  
  
      return newObj;
    }
  }
  