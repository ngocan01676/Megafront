import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private products:any[] = []
  private SERVER_URL = environment.SERVER_URL;
  constructor(private http:HttpClient) { }

  getOrderById(id:number) {
    return this.http.get<ProductResponseModel[]>(this.SERVER_URL+'/orders/'+id).toPromise();
  }
}

interface ProductResponseModel {
  id:number,
  title:string,
  description:string,
  price:number,
  quantityOrdered:number,
  image:string
}