import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { ProductModelServer, serverResponse } from '../model/product.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProductService {

  SERVER_URL = environment.SERVER_URL;
  constructor(private http:HttpClient) { }
  showMessage():void {
    console.log("Service called");
  }

  // getAllProduct(numberOfResult:number = 10):Observable<serverResponse> {
  //   return this.http.get<serverResponse>(this.SERVER_URL + '/products',{
  //     params: {
  //       limit:numberOfResult.toString()
  //     }
  //   }).pipe(
  //     map((res: serverResponse) => {
  //       return res || {}
  //     }),
  //   );
  getAllProduct(numberOfResult:number = 10) {
    return this.http.get<serverResponse>(this.SERVER_URL + '/products',{
      params: {
        limit:numberOfResult.toString()
      }
    }).pipe(
      map((res: serverResponse) => {
        return res || {}
      }),
    );
  }

  //get product by id
  getProductById(id:number):Observable<ProductModelServer> {
    return this.http.get<ProductModelServer>(this.SERVER_URL+'/products/'+id);
  }

  //get product from category 
  getProductFromCategory(category:string):Observable<ProductModelServer[]> {
    return this.http.get<ProductModelServer[]>(this.SERVER_URL+'/products/'+category);
  }
}
