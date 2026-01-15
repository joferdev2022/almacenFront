export class SellerMonthlyStatsModel {
    vendedor!: string;
    mes!: number;
    año!: number;
    totalVentas!: number;
    montoTotal!: number;
    comisionTotalEstimada!: number;
    ventas!: Array<any>;

    static createFromObject(obj: any): SellerMonthlyStatsModel {
        const newObj = new SellerMonthlyStatsModel();
        newObj.vendedor = obj.vendedor;
        newObj.mes = obj.mes;
        newObj.año = obj.año;
        newObj.totalVentas = obj.totalVentas;
        newObj.montoTotal = obj.montoTotal;
        newObj.comisionTotalEstimada = obj.comisionTotalEstimada;
        newObj.ventas = obj.ventas || [];

        return newObj;
    }
}