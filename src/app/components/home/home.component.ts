import { Component, OnInit } from '@angular/core';
import { ProductModelServer, serverResponse } from 'src/app/model/product.model';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { ProductComponent } from '../product/product.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private productServices:ProductService,private cartService:CartService) { }
  products:ProductModelServer [] = [];

  ngOnInit(): void {
    this.productServices.getAllProduct(12).subscribe((prods:serverResponse) => {
      console.log(prods.products)
      console.log(prods.products[0].id)
      this.products = prods.products;
    })
  }
  addToCart(productId:number) {
    this.cartService.addProductToCart(productId)
  }
}
