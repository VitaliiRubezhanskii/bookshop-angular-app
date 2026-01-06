import { Component, Input, Output, EventEmitter } from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-credit-card-form',
    templateUrl: './credit-card-form.component.html',
    styleUrls: ['./credit-card-form.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    standalone: true
})
export class CreditCardFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() months: number[] = [];
  @Input() years: number[] = [];
  @Output() yearChanged = new EventEmitter<void>();
}
