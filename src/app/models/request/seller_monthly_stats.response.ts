import { SellerMonthlyStatsModel } from "../internal/seller_monthly_stats.model";

export class SellerMonthlyStatsResponse {
    message!: string;
    data!: SellerMonthlyStatsModel;
    code!: number;

    static createFromObject(responseData_: any): SellerMonthlyStatsResponse {
        const newObj = new SellerMonthlyStatsResponse();
        newObj.code = responseData_.code;
        newObj.message = responseData_.message;
        newObj.data = responseData_ && SellerMonthlyStatsModel.createFromObject(responseData_);

        return newObj;
    }
}