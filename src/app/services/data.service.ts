import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';


import { ProductResponse } from '../models/response/product.response';
import { SaleResponse } from '../models/response/sale.response';
import { DashboardResponse } from '../models/response/dashboard.response';
import { ProductRequest } from '../models/request/product.request';
import { SaleRequest } from '../models/request/sale.request';



const base_url = "https://almacenback.onrender.com/api";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }



  loadProducts(page: number = 1, perPage: number = 2000, local: any):Observable<ProductResponse> {
    const url = `${ base_url }/products?page=${ page }&xpage=${ perPage }&local=${local}`;
    return this.http.get<ProductResponse>(url).pipe(map(res => ProductResponse.createFromObject(res)));
  }

  loadSales(page: number = 1, perPage: number = 5000, local:any):Observable<SaleResponse> {
    const url = `${ base_url }/sales?page=${ page }&xpage=${ perPage }&local=${local}`;
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

    const url = `${ base_url }/dashboard`;
    return this.http.get<DashboardResponse>(url,  { params }).pipe(map(res => DashboardResponse.createFromObject(res)));
  }


  saveProduct(productData: ProductRequest):Observable<any> {

    const url = `${ base_url }/products`;
    console.log(productData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, productData ).pipe(map(res => console.log(res)));
  }

  updateProductById(productId: any , productData:ProductRequest):Observable<any> {
    const url = `${ base_url }/products/${productId}`;
    return this.http.put<any>( url, productData ).pipe(map(res => console.log(res)));
  }

  deleteProductById(productId: any):Observable<any> {
    const url = `${ base_url }/products/${productId}`;
    return this.http.delete<any>(url).pipe(map(res => console.log(res)));
  }

  
  saveSale(saleData: SaleRequest):Observable<any> {

    const url = `${ base_url }/sales`;
    console.log(saleData);
    
    // return this.http.post<any>( url, productData ).pipe(map(res => ResponseCustomer.createFromObject(res)));
    return this.http.post<any>( url, saleData ).pipe(map(res => console.log(res)));
  }
  deleteSaleById(saleId: any):Observable<any> {
    const url = `${ base_url }/sales/${saleId}`;
    return this.http.delete<any>(url).pipe(map(res => console.log(res)));
  }
}
