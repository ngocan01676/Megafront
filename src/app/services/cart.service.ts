import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartModelPublic, CartModelServer } from '../model/cart.model';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { ProductModelServer, serverResponse } from '../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private SERVER_URL = environment.SERVER_URL;

  //data variable to store the cart information on the client's local storage
  private cartDataClient:CartModelPublic = {
    total:0,
    prodData:[
      {
        inCart:0,
        id:0
      }
    ]
  }

  //data variable to store information on the server
  private cartDataServer:CartModelServer = {
    total:0,
    data:[
      {
        product:undefined,
        numInCart:0
      }
    ]
  }

  //Observables for the components to subcribe
  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);
  constructor(
    private http:HttpClient,
    private productService:ProductService,
    private orderService:OrderService,
    private router:Router,
    private toastrService:ToastrService,
    private spinner:NgxSpinnerService
    
    ) {
    this.cartTotal$.next(this.cartDataServer.total);
    this.cartData$.next(this.cartDataServer);

    //get the information from local storage 
    let info = JSON.parse(String(localStorage.getItem('cart')));

    //check if the info variable is null or has some data in it 

    if (info != null && info != undefined && info.prodData.inCart != 0) {
      //local storage is not empty and has some information
      this.cartDataClient = info;
    }

    //loop through each entry an put it in the cartDataServer object
    this.cartDataClient.prodData.forEach(item => {
      this.productService.getProductById(item.id).subscribe(actualProductInfo => {
        if (this.cartDataServer.data[0].numInCart == 0) {
          this.cartDataServer.data[0].numInCart = item.inCart
          this.cartDataServer.data[0].product = actualProductInfo

          //TODO create calculateTotal fuction and replace it here
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
        } else {
          //cartDataServer already has some entry in it
          this.cartDataServer.data.push({
            numInCart:item.inCart,
            product:actualProductInfo
          });
          this.Calculate();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
        }
        this.cartData$.next({...this.cartDataServer});
      })
    });
  }

  addProductToCart(id:number,qty?:number) {
    this.productService.getProductById(id).subscribe(prod => {
      //TH1:Cart empty
      if (this.cartDataServer.data[0].numInCart == 0) {
        this.cartDataServer.data[0].product = prod;
        this.cartDataServer.data[0].numInCart = qty != undefined ? qty : 1;
        // TODO CALCULATE TOTAL AMOUNT
        this.cartDataClient.prodData[0].inCart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.prodData[0].id = Number(prod.id);
        this.Calculate();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
        this.cartData$.next({...this.cartDataServer});
        // TODO display A TOAST NOTIFICATION
        this.toastrService.success(`${prod.name} added to cart`,'Product Added',{
          timeOut:1500,
          progressBar:true,
          progressAnimation:'increasing',
          positionClass:'toast-top-right'
        });

      } else {
        //TH2:cart has some item
        let index = this.cartDataServer.data.findIndex(item => item.product.id == prod.id);
        if (index != -1) {
          //  a:item is already in cart
          if (qty != undefined && Number(qty) <= Number(prod.quantity)) {
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? (Number(this.cartDataServer.data[index].numInCart) + Number(qty)) : Number(prod.quantity);
          } else {
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? (this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart + 1) : Number(prod.quantity);
          }
          console.log(this.cartDataServer);
          this.cartDataClient.prodData[index].inCart = this.cartDataServer.data[index].numInCart;
          this.Calculate();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
          // TODO display A TOAST NOTIFICATION
          this.toastrService.success(`${prod.name} added to cart`,'Product Added',{
            timeOut:1500,
            progressBar:true,
            progressAnimation:'increasing',
            positionClass:'toast-top-right'
          });
        } else {
          //  b:item is not in cart
          this.cartDataServer.data.push({
            product:prod,
            numInCart:1
          });
          this.cartDataClient.prodData.push({
            id:Number(prod.id),
            inCart:1
          });
          // TODO display A TOAST NOTIFICATION
          this.toastrService.info(`${prod.name} quantity updated in the cart`,'Product Added',{
            timeOut:1500,
            progressBar:true,
            progressAnimation:'increasing',
            positionClass:'toast-top-right'
          });

          // TODO CALCULATE TOTAL AMOUNT
          this.Calculate();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
          this.cartData$.next({...this.cartDataServer});

        }
      }
    });
  }

  //update item cart
  updateCartItem(index:number,increase:boolean) {
    let data = this.cartDataServer.data[index];
    if (increase) {
      data.numInCart < data.product.quantity ? data.numInCart ++ : data.product.quantity;
      this.cartDataClient.prodData[index].inCart = data.numInCart
      // TODO CALCULATE TOTAL AMOUNT
      this.Calculate();
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
      this.cartData$.next({...this.cartDataServer});
    } else {
      data.numInCart --;
      if (data.numInCart < 1) {
       //TODO delete the product from cart
       this.cartData$.next({...this.cartDataServer});
      } else {
        this.cartData$.next({...this.cartDataServer});
        this.cartDataClient.prodData[index].inCart = data.numInCart;
        // TODO CALCULATE TOTAL AMOUNT
        this.Calculate();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
      }
    }
  }

  //delete product from cart
  deleteProductFromCart(index:number) {
    if (window.confirm('Are you sure you want to remove the item?')) {
      this.cartDataServer.data.splice(index,1);
      this.cartDataClient.prodData.splice(index,1);
      // TODO CALCULATE TOTAL AMOUNT
      this.Calculate();
      this.cartDataClient.total = this.cartDataServer.total;
      if (this.cartDataClient.total == 0) {
        this.cartDataClient = {
          total:0,
          prodData:[
            {
              inCart:0,
              id:0
            }
          ]
        }
        localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
      }
      if (this.cartDataServer.total == 0) {
        this.cartDataServer = {
          total:0,
          data:[
            {
              product:undefined,
              numInCart:0
            }
          ]
        }
        this.cartData$.next({...this.cartDataServer});
      } else {
        this.cartData$.next({...this.cartDataServer});
      }
    } else {
      //USER click cancel
      return;
    }
  }

  //calculate total

  private Calculate() {
    let total = 0;
    this.cartDataServer.data.forEach(item => {
      const { numInCart } = item;
      const { price } = item.product;
      total += numInCart * price;     
    });
    this.cartDataServer.total = total;
    this.cartTotal$.next(total);
  }

  //checkout
  checkOutFromCart(userId:number) {
    this.http.post<paymentMessageStatus>(`${this.SERVER_URL}/orders/payment`,null).subscribe((res) => {
      if (res.success) {
        this.resetServiceData();
        this.http.post<orderResponse>(`${this.SERVER_URL}/orders/new`,{
          userId:userId,
          products:this.cartDataClient.prodData
        }).subscribe((data:orderResponse) => {

          this.orderService.getOrderById(data.order_id).then((prod) => {
            if (data.success) {
              const navigationExtras:NavigationExtras = {
                state: {
                  message:data.message,
                  products:prod,
                  order_id:data.order_id,
                  total:this.cartDataClient.total
                }
              };
              //TODO MIDE SPINNER
              //this.spinner.hide().then();
              this.spinner.hide();
              this.router.navigate(['/thankyou'],navigationExtras).then(p => {
                this.cartDataClient =  {
                  total:0,
                  prodData:[
                    {
                      inCart:0,
                      id:0
                    }
                  ]
                };
                this.cartTotal$.next(0);
                localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
              })
            }
          })
        });
      } else {
        this.spinner.hide();
        this.router.navigateByUrl('/checkout').then();
        this.toastrService.error(`Sorry,false to book the order`,'Order status',{
          timeOut:1500,
          progressBar:true,
          progressAnimation:'increasing',
          positionClass:'toast-top-right'
        });
      }
    })
  }

  private resetServiceData() {
    this.cartDataServer = {
      total:0,
      data:[
        {
          product:undefined,
          numInCart:0
        }
      ]
    }
    this.cartData$.next({...this.cartDataServer});
  }
}

interface orderResponse {
  order_id: number;
  success: boolean;
  message: string;
  product:[
    {
      id: number,
      numInCart: string
    }
  ];
}

interface paymentMessageStatus {
  success:boolean
}