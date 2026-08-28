import { ExpenseModel, ExpenseSummary } from '../internal/expense.model';

export interface ExpenseApiResponse<T> {
  data: T;
  code: number;
  message: string;
}

export interface ExpenseListApiResponse extends ExpenseApiResponse<ExpenseModel[][]> {
  total: number;
  page: number;
  xpage: number;
  resumen: ExpenseSummary;
}

export class ExpenseResponse {
  data!: ExpenseModel[];
  total!: number;
  page!: number;
  xpage!: number;
  resumen!: ExpenseSummary;
  code!: number;
  message!: string;

  static createFromObject(response: ExpenseListApiResponse): ExpenseResponse {
    return Object.assign(new ExpenseResponse(), response, { data: response.data[0] || [] });
  }
}
