
export class SaleModel {

    id!: string;
    clientName!: string;
    dateSale!: string;
    products!: [];
    totalPrice!: number;
    state!: string;
    


    static createFromObject(obj: any): SaleModel {
        const newObj = new SaleModel();
        newObj.id = obj.id;
        newObj.clientName = obj.nombreCliente;
        newObj.dateSale = obj.fechaVenta;
        newObj.products = obj.productos;
        newObj.totalPrice = obj.precioTotal;
        newObj.state = obj.estado;
    
        return newObj;
      }
    
      static createFromObjects(_objs: any): Array<SaleModel> {
        // console.log(_objs)
        const newObjs = [];
        if (_objs instanceof Array) {
          for (const item of _objs) {
            // console.log("item",item);
            newObjs.push(SaleModel.createFromObject(item));
            // console.log(newObjs);
            
          }
        }

        return newObjs;
      }
    
}