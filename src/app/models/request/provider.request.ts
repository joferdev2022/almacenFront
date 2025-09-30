
export class ProviderRequest {
    nombreProvider!: string;
    numeroProvider!: string;
    deudaInicial!: number;
    deudaActual!: number;
    estadoProvider!: string;
    local!: number;
  
    static createFromObject(provider: any): ProviderRequest {
      const newObj = new ProviderRequest();
      newObj.nombreProvider = provider.nombreProvider;
      newObj.numeroProvider = provider.numeroProvider;
      newObj.deudaInicial = provider.deudaInicial;
      newObj.deudaActual = provider.deudaActual;
      newObj.estadoProvider = provider.estadoProvider;
      newObj.local = provider.local;
      // newObj.fechaDeCaducidad = product.startDate;
   
      return newObj;
    }
  }
  