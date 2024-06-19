
export class ProductModel {

    id!: string;
    name!: string;
    description!: string;
    category!: string;
    priceBuy!: number;
    priceSale!: number;
    stock!: number;
    
    measure!: string;
    proovId!: string;
    expirationDate!: string;
    creationDate!: string;

    static createFromObject(obj: any): ProductModel {
        const newObj = new ProductModel();
        newObj.id = obj.id;
        newObj.name = obj.nombre;
        newObj.description = obj.descripcion;
        newObj.category = obj.categoria;
        newObj.priceBuy = obj.precioCompra;
        newObj.priceSale = obj.precioVenta;
        newObj.stock = obj.cantidadEnStock;
        newObj.measure = obj.unidadDeMedida;
        newObj.proovId = obj.proveedorId;
        newObj.expirationDate = obj.fechaDeCaducidad;
        newObj.creationDate = obj.fechaDeCreacion;
        return newObj;
      }
    
      static createFromObjects(_objs: any): Array<ProductModel> {
        // console.log(_objs)
        const newObjs = [];
        if (_objs instanceof Array) {
          for (const item of _objs) {
            // console.log("item",item);
            newObjs.push(ProductModel.createFromObject(item));
            // console.log(newObjs);
            
          }
        }

        return newObjs;
      }
    
}