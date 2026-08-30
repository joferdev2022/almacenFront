import { OperationAudit } from './cash.model';


export interface SalePayment {
  id?: string; monto: number; metodoPago?: string; fecha: string; fechaPago?: string;
  tipo?: string; anulado?: boolean;
}

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
    saldoPendiente?: number;
    anulado = false;
    motivoAnulacion?: string;
    auditoria: OperationAudit[] = [];
    pagos: SalePayment[] = [];
    get paymentSummary(): string {
      const receipts = this.pagos.filter(payment => !payment.anulado);
      if (receipts.length) {
        return [...new Set(receipts.map(payment => payment.metodoPago || 'Sin registrar'))].join(' / ');
      }
      return this.state === 'credito' ? 'Pendiente de cobro' : this.paymentMethod || 'Sin registrar';
    }

    


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
        newObj.saldoPendiente = obj.saldoPendiente;
        newObj.anulado = obj.anulado || false;
        newObj.motivoAnulacion = obj.motivoAnulacion;
        newObj.auditoria = obj.auditoria || [];
        newObj.pagos = obj.pagos || [];
    
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