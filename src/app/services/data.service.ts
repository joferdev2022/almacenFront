import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';


import { ProductResponse } from '../models/response/product.response';
import { SaleResponse } from '../models/response/sale.response';
import { DashboardResponse } from '../models/response/dashboard.response';



const base_url = "http://localhost:8000/api";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }



  loadProducts(page: number = 1, perPage: number = 100):Observable<ProductResponse> {
    const url = `${ base_url }/products?page=${ page }&xpage=${ perPage }`;
    return this.http.get<ProductResponse>(url).pipe(map(res => ProductResponse.createFromObject(res)));
  }

  loadSales(page: number = 1, perPage: number = 100):Observable<SaleResponse> {
    const url = `${ base_url }/sales?page=${ page }&xpage=${ perPage }`;
    return this.http.get<SaleResponse>(url).pipe(map(res => SaleResponse.createFromObject(res)));
  }

  loadDashboard() {
    const url = `${ base_url }/dashboard`;
    return this.http.get<DashboardResponse>(url).pipe(map(res => DashboardResponse.createFromObject(res)));
  }
}
