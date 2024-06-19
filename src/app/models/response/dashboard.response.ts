import { DashboardModel } from "../internal/dashboard.model";


export class DashboardResponse {
 
    message!: string;
    data!: DashboardModel;
    code!: number;
   
  
    static createFromObject(responseData_: any): DashboardResponse {
      console.log("data creteformobject",responseData_);
      const newObj = new DashboardResponse();
      newObj.code = responseData_.code;
      newObj.message = responseData_.message;
      newObj.data = responseData_.data &&  DashboardModel.createFromObject(responseData_.data);
      // console.log("data enviada",responseData_.data);
      
  
      return newObj;
    }
  }
