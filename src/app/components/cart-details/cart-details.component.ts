import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(private cartService: CartService,
              private router: Router) { }

  ngOnInit(): void {
    this.listCartDetails();
  }

  listCartDetails() {

    // get a handle to the cart items
    this.cartItems = this.cartService.cartItems;

    // subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    // subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

    // compute cart total price and quantity
    this.cartService.computeCartTotals();
  }

  incrementQuantity(theCartItem: CartItem) {
    this.cartService.addToCart(theCartItem);
  }

  decrementQuantity(theCartItem: CartItem) {
    this.cartService.decrementQuantity(theCartItem);
  }

  remove(theCartItem: CartItem) {
    this.cartService.remove(theCartItem);
  }

  get subtotal() {
    return this.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  get tax() {
    return this.subtotal * 0.10;
  }

  get total() {
    return this.subtotal + this.tax;
  }

  updateCart() {
    console.log('Cart updated');
    // Update cart logic (e.g. local storage, backend)
  }

  removeItem(item: any) {
    this.cartItems = this.cartItems.filter(i => i !== item);
  }

  clearCart() {
    this.cartItems = [];
  }

  checkout() {
    console.log('Checkout:', this.cartItems);
    // Implement actual checkout logic
  }
  goToShop() {
    // Use Angular router to navigate
    this.router.navigate(['/products']); // or your shop route
  }

}
