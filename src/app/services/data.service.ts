import { newOperationId } from '../shared/cash.utils';
import { SalesReportFilters, SalesReportResponse } from '../models/internal/report.model';
import { CashCurrent, CashJournal, CashMovement, CashPage, CashResponse, CashOpeningRequest, CashMovementRequest, CashClosingRequest } from '../models/internal/cash.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ExpenseModel, ExpenseOptions, ExpenseProviderPage } from '../models/internal/expense.model';
import { ExpenseFilters, ExpensePaymentRequest, ExpenseRequest } from '../models/request/expense.request';
import { ExpenseApiResponse, ExpenseListApiResponse, ExpenseResponse } from '../models/response/expense.response';
import { Injectable } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';


import { ProductResponse } from '../models/response/product.response';
import { SaleResponse } from '../models/response/sale.response';
import { DashboardResponse } from '../models/response/dashboard.response';
import { ProductRequest } from '../models/request/product.request';
import { SaleRequest } from '../models/request/sale.request';
import { SellerResponse } from '../models/response/seller.response';
import { SellerRequest } from '../models/request/seller.request';
import { ProviderResponse } from '../models/response/provider.response';
import { ProviderRequest } from '../models/request/provider.request';
import { SellerMonthlyStatsResponse } from '../models/request/seller_monthly_stats.response';



// const base_url = "http://localhost:8000/api";
const base_url = "https://almacenback.onrender.com/api";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  loadSalesReport(filters: SalesReportFilters, page = 1, xpage = 25): Observable<SalesReportResponse> {
    const params = this.reportParams(filters).set('page', page).set('xpage', xpage);
    return this.http.get<SalesReportResponse>(`${base_url}/reports/sales`, { params });
  }

  downloadSalesReport(filters: SalesReportFilters): Observable<Blob> {
    return this.http.get(`${base_url}/reports/sales/excel`, { params: this.reportParams(filters), responseType: 'blob' });
  }

  private reportParams(filters: SalesReportFilters): HttpParams {
    let params = new HttpParams();
    for (const key of ['fecha_desde', 'fecha_hasta', 'producto', 'categoria', 'ventas'] as const) {
      if (filters[key]) { params = params.set(key, filters[key]); }
    }
    return params;
  }


  loadExpenseOptions(): Observable<ExpenseApiResponse<ExpenseOptions>> {
    return this.http.get<ExpenseApiResponse<ExpenseOptions>>(`${base_url}/expenses/options`);
  }

  loadExpenseProviders(search = '', page = 1): Observable<ExpenseApiResponse<ExpenseProviderPage>> {
    const params = new HttpParams().set('search', search).set('page', page).set('xpage', 20);
    return this.http.get<ExpenseApiResponse<ExpenseProviderPage>>(`${base_url}/expenses/providers`, { params });
  }

  loadExpenses(page = 1, xpage = 10, filters: ExpenseFilters = {}): Observable<ExpenseResponse> {
    let params = new HttpParams().set('page', page).set('xpage', xpage);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) { params = params.set(key, value); }
    });
    return this.http.get<ExpenseListApiResponse>(`${base_url}/expenses`, { params })
      .pipe(map(response => ExpenseResponse.createFromObject(response)));
  }

  getExpense(id: string): Observable<ExpenseApiResponse<ExpenseModel>> {
    return this.http.get<ExpenseApiResponse<ExpenseModel>>(`${base_url}/expenses/${id}`);
  }

  saveExpense(data: ExpenseRequest, key = newOperationId()): Observable<ExpenseApiResponse<ExpenseModel>> {
    return this.http.post<ExpenseApiResponse<ExpenseModel>>(`${base_url}/expenses`, data, this.operationOptions(key));
  }

  updateExpense(id: string, data: ExpenseRequest, key = newOperationId()): Observable<ExpenseApiResponse<ExpenseModel>> {
    return this.http.put<ExpenseApiResponse<ExpenseModel>>(`${base_url}/expenses/${id}`, data, this.operationOptions(key));
  }

  payExpense(id: string, data: ExpensePaymentRequest, key = newOperationId()): Observable<ExpenseApiResponse<ExpenseModel>> {
    return this.http.put<ExpenseApiResponse<ExpenseModel>>(`${base_url}/expenses/${id}/pay`, data, this.operationOptions(key));
  }

  deleteExpense(id: string, motivo = "Anulación solicitada", key = newOperationId()): Observable<ExpenseApiResponse<ExpenseModel>> {
    return this.http.delete<ExpenseApiResponse<ExpenseModel>>(`${base_url}/expenses/${id}`, { ...this.operationOptions(key), body: { motivo } });
  }

  excelUploadResponse$ = new Subject<any>();

  constructor(private http: HttpClient) { }



  loadProducts(page: number = 1, perPage: number = 2000, local: any):Observable<ProductResponse> {
    const url = `${ base_url }/products?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<ProductResponse>(url).pipe(map(res => ProductResponse.createFromObject(res)));
  }

  
  loadAllSellers(page: number = 1, perPage: number = 5000, local:any):Observable<any> {
    const url = `${ base_url }/sellers?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<SellerResponse>(url).pipe(map(res => SellerResponse.createFromObject(res)));
  }

  loadAllProviders(page: number = 1, perPage: number = 5000, local:any):Observable<any> {
    const url = `${ base_url }/providers?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<ProviderResponse>(url).pipe(map(res => ProviderResponse.createFromObject(res)));
  }

  loadSales(page: number = 1, perPage: number = 5000, local:any):Observable<SaleResponse> {
    const url = `${ base_url }/sales?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<SaleResponse>(url).pipe(map(res => SaleResponse.createFromObject(res)));
  }

  loadSalesWithCredit(page: number = 1, perPage: number = 5000, local:any):Observable<SaleResponse> {
    const url = `${ base_url }/sales/credits?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<SaleResponse>(url).pipe(map(res => SaleResponse.createFromObject(res)));
  }

  loadDashboard(fechaInicio?: Date, fechaFin?: Date, local?: any) {

    let params = new HttpParams();
    if (fechaInicio) {
      params = params.set('fecha_inicio', fechaInicio.toISOString());
    }
    if (fechaFin) {
      params = params.set('fecha_fin', fechaFin.toISOString());
    }

    if(local) {
      params = params.set('local', local);
    }

    const url = `${ base_url }/dashboard`;
    return this.http.get<DashboardResponse>(url,  { params }).pipe(map(res => DashboardResponse.createFromObject(res)));
  }


  saveProduct(productData: ProductRequest):Observable<any> {

    const url = `${ base_url }/products`;
    console.log(productData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, productData ).pipe(map(res => console.log(res)));
  }

  saveSeller(sellerData: SellerRequest):Observable<any> {

    const url = `${ base_url }/sellers`;
    console.log(sellerData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, sellerData ).pipe(map(res => console.log(res)));
  }

  saveProvider(providerData: ProviderRequest):Observable<any> {

    const url = `${ base_url }/providers`;
    console.log(providerData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, providerData ).pipe(map(res => console.log(res)));
  }

  updateProductById(productId: any , productData:ProductRequest):Observable<any> {
    const url = `${ base_url }/products/${productId}`;
    return this.http.put<any>( url, productData ).pipe(map(res => console.log(res)));
  }

  updateSellerById(sellerId: any , sellerData:SellerRequest):Observable<any> {
    const url = `${ base_url }/sellers/${sellerId}`;
    return this.http.put<any>( url, sellerData ).pipe(map(res => console.log(res)));
  }

  updateProviderById(providerId: any , providerData:ProviderRequest):Observable<any> {
    const url = `${ base_url }/providers/${providerId}`;
    return this.http.put<any>( url, providerData ).pipe(map(res => console.log(res)));
  }

  private operationOptions(key: string) { return { headers: { 'Idempotency-Key': key } }; }

  updatStateSaleById(id: string, state: string, motivo = 'Corrección de cobro', key = newOperationId()): Observable<any> {
    return this.http.put<any>(`${base_url}/sales/state/${id}?state=${state}`, { motivo }, this.operationOptions(key));
  }

  updatePaymentSaleById(id: string, payment: { monto: number; metodoPago: string; fechaPago: string }, key = newOperationId()): Observable<any> {
    return this.http.put<any>(`${base_url}/sales/payment/${id}`, payment, this.operationOptions(key));
  }

  getSale(id: string): Observable<any> { return this.http.get<any>(`${base_url}/sales/${id}`); }

  updateSale(id: string, data: SaleRequest, key = newOperationId()): Observable<any> {
    return this.http.put<any>(`${base_url}/sales/${id}`, data, this.operationOptions(key));
  }

  updateProviderDebtById(providerId: any, deuda: number, monto: number): Observable<any> {
  const url = `${base_url}/providers/${providerId}/debt`;
  return this.http.put<any>(url, { deuda, monto }).pipe(map(res => console.log(res)));
}

  deleteProductById(productId: any):Observable<any> {
    const url = `${ base_url }/products/${productId}`;
    return this.http.delete<any>(url).pipe(map(res => console.log(res)));
  }

  deleteSellerById(sellerId: any):Observable<any> {
    const url = `${ base_url }/sellers/${sellerId}`;
    return this.http.delete<any>(url).pipe(map(res => console.log(res)));
  }

  deleteProviderById(providerId: any):Observable<any> {
    const url = `${ base_url }/providers/${providerId}`;
    return this.http.delete<any>(url).pipe(map(res => console.log(res)));
  }

  getSellerMonthlyStats(sellerName: string, month: number, year: number, local: any): Observable<SellerMonthlyStatsResponse> {
      const url = `${base_url}/sellers/${encodeURIComponent(sellerName)}/monthly-stats?local=${local}&year=${year}&month=${month}`;
      return this.http.get<SellerMonthlyStatsResponse>(url)
          .pipe(map(res => SellerMonthlyStatsResponse.createFromObject(res)));
  }

  
  saveSale(data: SaleRequest, key = newOperationId()): Observable<any> {
    return this.http.post<any>(`${base_url}/sales`, data, this.operationOptions(key));
  }

  deleteSaleById(id: string, motivo = 'Anulación solicitada', key = newOperationId()): Observable<any> {
    return this.http.delete<any>(`${base_url}/sales/${id}`, { ...this.operationOptions(key), body: { motivo } });
  }

  getCurrentCash(): Observable<CashResponse<CashCurrent>> {
    return this.http.get<CashResponse<CashCurrent>>(`${base_url}/cash/current`);
  }

  getCashJournal(id: string): Observable<CashResponse<CashJournal>> {
    return this.http.get<CashResponse<CashJournal>>(`${base_url}/cash/${id}`);
  }

  loadCashHistory(page = 1, xpage = 10, filters: Record<string, string> = {}): Observable<CashResponse<CashPage<CashJournal>>> {
    return this.http.get<CashResponse<CashPage<CashJournal>>>(`${base_url}/cash/history`,
      { params: this.cashParams(page, xpage, filters) });
  }

  loadCashMovements(id: string, page = 1, xpage = 10, filters: Record<string, string> = {}): Observable<CashResponse<CashPage<CashMovement>>> {
    return this.http.get<CashResponse<CashPage<CashMovement>>>(`${base_url}/cash/${id}/movements`,
      { params: this.cashParams(page, xpage, filters) });
  }

  openCash(data: CashOpeningRequest): Observable<CashResponse<CashJournal>> {
    return this.http.post<CashResponse<CashJournal>>(`${base_url}/cash/open`, data);
  }

  closeCash(id: string, data: CashClosingRequest): Observable<CashResponse<CashJournal>> {
    return this.http.post<CashResponse<CashJournal>>(`${base_url}/cash/${id}/close`, data);
  }

  cashMovement(id: string, type: 'income' | 'withdrawal', data: CashMovementRequest): Observable<CashResponse<CashMovement>> {
    return this.http.post<CashResponse<CashMovement>>(`${base_url}/cash/${id}/${type}`, data);
  }

  private cashParams(page: number, size: number, filters: Record<string, string>): HttpParams {
    let params = new HttpParams().set('page', page).set('xpage', size);
    Object.entries(filters).forEach(([key, value]) => { if (value) { params = params.set(key, value); } });
    return params;
  }

  dayliSalesByLocal(local: any):Observable<any> {
    // localhost:8000/api/sales/summary/daily
    const url = `${ base_url }/sales/summary/daily?local=${local}`;
    return this.http.get<any>(url).pipe(map(res => {return res;}));
  }

  uploadProductsExcel(file: File, local: any): Observable<any> {
    const url = `${base_url}/products/upload-excel`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('local', local);
    
    return this.http.post<any>(url, formData);
  }

  DownloadProductsExcel(local: any){
    const url = `${base_url}/products/download-excel?local=${local}`;

    this.http.get(url, { responseType: 'blob' }).subscribe((data: Blob) => {
      const objectUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `productos_local_${local}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    });
  }
}
