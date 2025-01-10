export class UserModel {

    userId!: number;
    tel!: string;
    status!: boolean;
    amount!: number;
    email!: string;
    plan!: string;
    message_limit!: number;

    static createFromObject(obj: any): UserModel {
        const newObj = new UserModel();
        newObj.userId = obj.userId;
        newObj.tel = '914825470';
        newObj.status = obj.status;
        newObj.amount = obj.amount;
        newObj.email = obj.email;
        newObj.plan = obj.plan;
        newObj.message_limit = obj.message_limit;
        return newObj;
      }
    
      static createFromObjects(_objs: any): Array<UserModel> {
        // console.log(_objs)
        const newObjs = [];
        if (_objs instanceof Array) {
          for (const item of _objs) {
            // console.log("item",item);
            newObjs.push(UserModel.createFromObject(item));
            // console.log(newObjs);
            
          }
        }

        return newObjs;
      }
    
}