
export class ProviderModel {

    id!: string;
    nombreProvider!: string;
    numeroProvider!: string;
    deudaInicial!: number;
    deudaActual!: number;
    estadoProvider!: string;
    fechaCreacion!: string;
    fechaUltimoPago!: string;
    pagos: Array<{ [key: string]: any }> = [];
    // local!: number;
    // direccionCliente?: string;
    // dateSale!: string;
    // products!: [];
    // totalPrice!: number;
    // precioTotalOriginal?: number;
    // state!: string;
    


    static createFromObject(obj: any): ProviderModel {
        const newObj = new ProviderModel();
        newObj.id = obj.id;
        newObj.nombreProvider = obj.nombreProvider;
        newObj.numeroProvider = obj.numeroProvider;
        newObj.deudaInicial = obj.deudaInicial;
        newObj.deudaActual = obj.deudaActual;
        newObj.estadoProvider = obj.estadoProvider;
        newObj.fechaCreacion = obj.fechaCreacion;
        newObj.fechaUltimoPago = obj.fechaUltimoPago;
        newObj.pagos = obj.pagos || []; 
        // newObj.clientName = obj.nombreCliente;
        // newObj.direccionCliente = obj.direccionCliente;
        // newObj.dateSale = obj.fechaVenta;
        // newObj.products = obj.productos;
        // newObj.totalPrice = obj.precioTotal;
        // newObj.precioTotalOriginal = obj.precioTotalOriginal;
        // newObj.state = obj.estado;
    
        return newObj;
      }
    
      static createFromObjects(_objs: any): Array<ProviderModel> {
        // console.log(_objs)
        const newObjs = [];
        if (_objs instanceof Array) {
          for (const item of _objs) {
            // console.log("item",item);
            newObjs.push(ProviderModel.createFromObject(item));
            // console.log(newObjs);
            
          }
        }

        return newObjs;
      }
    
}