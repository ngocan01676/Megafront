import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ProductModelServer } from 'src/app/model/product.model';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute,ParamMap  } from '@angular/router';
import { map } from 'rxjs/operators';
declare let $:any;
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})

export class ProductComponent implements OnInit,AfterViewInit {
  
  id:number;
  product:any;
  thumbImages:any[] = [];
  @ViewChild('quantity') quantityInput;
  constructor(
    private productService:ProductService,
    private cartService:CartService,
    private router:ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.router.paramMap.pipe(
      map((param: ParamMap) => {
        // @ts-ignore
        return param.params.id;
      })
    ).subscribe(prodId => {
      this.id = prodId;
      this.productService.getProductById(this.id).subscribe(prod => {
        this.product = prod;
        console.log(prod);
        if (prod.images !== null) {
          this.thumbImages = prod.images.split(';');
          // console.log(this.thumbImages);
        }
      });
    });
  }
  
  ngAfterViewInit():void {
    // Product Main img Slick
    $('#product-main-img').slick({
      infinite: true,
      speed: 300,
      dots: false,
      arrows: true,
      fade: true,
      asNavFor: '#product-imgs',
    });

    // Product imgs Slick
    $('#product-imgs').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: true,
      centerMode: true,
      focusOnSelect: true,
      centerPadding: 0,
      vertical: true,
      asNavFor: '#product-main-img',
      responsive: [{
        breakpoint: 991,
        settings: {
          vertical: false,
          arrows: false,
          dots: true,
        }
      },
      ]
    });

    // Product img zoom
    var zoomMainProduct = document.getElementById('product-main-img');
    if (zoomMainProduct) {
      $('#product-main-img .product-preview').zoom();
    }
  }
  Increase() {
    let value = parseInt(this.quantityInput.nativeElement.value);
    if (this.product.quantity >= 1){
      value++;

      if (value > this.product.quantity) {
        // @ts-ignore
        value = this.product.quantity;
      }
    } else {
      return;
    }

    this.quantityInput.nativeElement.value = value.toString();
  }

  Decrease() {
    let value = parseInt(this.quantityInput.nativeElement.value);
    if (this.product.quantity > 0){
      value--;

      if (value <= 0) {
        // @ts-ignore
        value = 0;
      }
    } else {
      return;
    }
    this.quantityInput.nativeElement.value = value.toString();
  }
  addToCart(id:number) {
    console.log(this.quantityInput.nativeElement.value);
    this.cartService.addProductToCart(id, this.quantityInput.nativeElement.value);
  }
}
