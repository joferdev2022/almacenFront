
export class SellerModel {

    id!: string;
    nombreVendedor!: string;
    aliasVendedor!: string;
    // direccionCliente?: string;
    // dateSale!: string;
    // products!: [];
    // totalPrice!: number;
    // precioTotalOriginal?: number;
    // state!: string;
    


    static createFromObject(obj: any): SellerModel {
        const newObj = new SellerModel();
        newObj.id = obj.id;
        newObj.nombreVendedor = obj.nombreVendedor;
        newObj.aliasVendedor = obj.aliasVendedor;
        // newObj.clientName = obj.nombreCliente;
        // newObj.direccionCliente = obj.direccionCliente;
        // newObj.dateSale = obj.fechaVenta;
        // newObj.products = obj.productos;
        // newObj.totalPrice = obj.precioTotal;
        // newObj.precioTotalOriginal = obj.precioTotalOriginal;
        // newObj.state = obj.estado;
    
        return newObj;
      }
    
      static createFromObjects(_objs: any): Array<SellerModel> {
        // console.log(_objs)
        const newObjs = [];
        if (_objs instanceof Array) {
          for (const item of _objs) {
            // console.log("item",item);
            newObjs.push(SellerModel.createFromObject(item));
            // console.log(newObjs);
            
          }
        }

        return newObjs;
      }
    
}