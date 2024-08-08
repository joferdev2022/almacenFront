export class ProductoVenta {
  productoId!: string;
  cantidad!: number;
  precioUnitario!: number;
  productName!: string;
}

export class SaleRequest {
    nombreCliente!: string;
    precioTotal!: number;
    estado!: string;
    productos!: ProductoVenta[];
  
  
    static createFromObject(sale: any): SaleRequest {
      const newObj = new SaleRequest();
      newObj.nombreCliente = sale.nombreCliente;
      newObj.precioTotal = sale.precioTotal;
      newObj.estado = sale.estado;
      newObj.productos = sale.productos.map((product: any) => {
        const productoVenta = new ProductoVenta();
        productoVenta.productoId = product.productoId;
        productoVenta.cantidad = product.cantidad;
        productoVenta.precioUnitario = product.precioUnitario;
        productoVenta.productName = product.productName;
        return productoVenta;
      });
        
      return newObj;
    }
  }
  