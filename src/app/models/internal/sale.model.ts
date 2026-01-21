
export class SaleModel {

    id!: string;
    nombreVendedor?: string;
    clientName!: string;
    direccionCliente?: string;
    paymentMethod!: string;
    dateSale!: string;
    products!: [];
    totalPrice!: number;
    precioTotalOriginal?: number;
    state!: string;
    


    static createFromObject(obj: any): SaleModel {
        
      
        const newObj = new SaleModel();
        newObj.id = obj.id;
        newObj.nombreVendedor = obj.nombreVendedor;
        newObj.clientName = obj.nombreCliente;
        newObj.direccionCliente = obj.direccionCliente;
        newObj.paymentMethod = obj.paymentMethod;
        newObj.dateSale = obj.fechaVenta;
        newObj.products = obj.productos;
        newObj.totalPrice = obj.precioTotal;
        newObj.precioTotalOriginal = obj.precioTotalOriginal;
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