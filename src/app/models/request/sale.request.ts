export class ProductoVenta {
  productoId!: string;
  cantidad!: number;
  precioUnitario!: number;
  precioBuy!:number;
  productName!: string;
}

export class SaleRequest {
    nombreVendedor!: string;
    nombreCliente!: string;
    direccionCliente!: string;
    paymentMethod!: string;
    precioTotal!: number;
    estado!: string;
    productos!: ProductoVenta[];
    local!: number;
  
  
    static createFromObject(sale: any): SaleRequest {
      const newObj = new SaleRequest();
      newObj.nombreVendedor = sale.nombreVendedor;
      newObj.nombreCliente = sale.nombreCliente;
      newObj.direccionCliente = sale.direccionCliente;
      newObj.paymentMethod = sale.paymentMhetod;
      newObj.precioTotal = sale.precioTotal;
      newObj.estado = sale.estado;
      newObj.local = sale.local;
      newObj.productos = sale.productos.map((product: any) => {
        const productoVenta = new ProductoVenta();
        productoVenta.productoId = product.productoId;
        productoVenta.cantidad = product.cantidad;
        productoVenta.precioUnitario = product.precioUnitario;
        productoVenta.precioBuy = product.precioBuy ? product.precioBuy: 0;
        productoVenta.productName = product.productName;
        return productoVenta;
      });
        
      return newObj;
    }
  }
  