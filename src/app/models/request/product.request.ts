
export class ProductRequest {
    nombre!: string;
    descripcion!: string;
    categoria!: string;
    precioCompra!: number;
    precioVenta!: number;
    // cantidadEnStock!: string[];
    cantidadEnStock!: number;
    unidadDeMedida!: string;
    fechaDeCaducidad!: Date;
  
  
    static createFromObject(product: any): ProductRequest {
      const newObj = new ProductRequest();
      newObj.nombre = product.nameProduct;
      newObj.descripcion = product.description;
      newObj.categoria = product.category;
      newObj.precioCompra = product.buyPrice;
      newObj.precioVenta = product.salePrice;
      newObj.cantidadEnStock = product.Stock;
      newObj.unidadDeMedida = product.measure;
      // newObj.fechaDeCaducidad = product.startDate;
   
      return newObj;
    }
  }
  