import { ProductModel } from "../internal/product.model";


export class ProductResponse {
 
    message!: string;
    data!: Array<ProductModel>;
    code!: number;
    page?: number;
    total?: number;
    xpage?: number;
  
  
    static createFromObject(responseData_: any): ProductResponse {
      console.log("data creteformobject",responseData_.data);
      const newObj = new ProductResponse();
      newObj.code = responseData_.code;
      newObj.message = responseData_.message;
      newObj.page = responseData_.page;
      newObj.total = responseData_.total;
      newObj.xpage = responseData_.xpage;
      newObj.data = responseData_.data &&  ProductModel.createFromObjects(responseData_.data[0]);
  
  
      return newObj;
    }
  }
  