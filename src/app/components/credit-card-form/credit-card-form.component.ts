import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-credit-card-form',
  templateUrl: './credit-card-form.component.html',
  styleUrls: ['./credit-card-form.component.css']
})
export class CreditCardFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() months: number[] = [];
  @Input() years: number[] = [];
  @Output() yearChanged = new EventEmitter<void>();
}
