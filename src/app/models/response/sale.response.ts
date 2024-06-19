import { SaleModel } from "../internal/sale.model";


export class SaleResponse {
 
    message!: string;
    data!: Array<SaleModel>;
    code!: number;
    page?: number;
    total?: number;
    xpage?: number;
  
  
    static createFromObject(responseData_: any): SaleResponse {
      console.log("data creteformobject",responseData_.data);
      const newObj = new SaleResponse();
      newObj.code = responseData_.code;
      newObj.message = responseData_.message;
      newObj.page = responseData_.page;
      newObj.total = responseData_.total;
      newObj.xpage = responseData_.xpage;
      newObj.data = responseData_.data &&  SaleModel.createFromObjects(responseData_.data[0]);
  
  
      return newObj;
    }
  }
  