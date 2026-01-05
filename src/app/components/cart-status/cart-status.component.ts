import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { AuthService } from '../../auth.service';
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrls: ['./cart-status.component.css'],
  imports: [CommonModule, RouterLink],
  standalone: true
})
export class CartStatusComponent implements OnInit {

  totalPrice: number = 0.00;
  totalQuantity: number = 0;
  currentUser: User | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.updateCartStatus();
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  updateCartStatus() {
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/products');
    });
  }
}
