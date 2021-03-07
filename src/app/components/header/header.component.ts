import { Component, HostListener, OnInit } from '@angular/core';
import { CartModelServer } from 'src/app/model/cart.model';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  cartData:CartModelServer;
  cartTotal:number
  //sticky header
  isSticky = false;
  lastScrollTop = 0;
  navbarHeight;
  //end sticky
  constructor(public cartService:CartService) { }

  ngOnInit(): void {

    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });

    this.cartService.cartData$.subscribe(data => {
      this.cartData = data;
    })

    //sticky header
    this.navbarHeight = document.getElementById("header").offsetHeight;
  }

  // @HostListener('scroll', ['$event']) // for scroll events of the current element
  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    var lastScrollTop = 0;
    var doc = document.documentElement;
    var st = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    var body = document.body,
    html = document.documentElement;
    var heightDoc = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
    if (st > lastScrollTop && st > this.navbarHeight){
      // Scroll Down
      this.isSticky = true;
    } else {
      // Scroll Up
      if (st > this.navbarHeight) {
        if(st + window.innerHeight < heightDoc) {
          this.isSticky = false;
        }
      }
      if (st == 0) {
        this.isSticky = false;
      }
    }
    lastScrollTop = st;
  }

}
