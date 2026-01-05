import { Component, Input, Output, EventEmitter } from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['address-form.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class AddressFormComponent {
  @Input() formGroupName!: string;
  @Input() parentForm!: FormGroup;
  @Input() countries: any[] = [];
  @Input() states: any[] = [];
  @Input() title: string = '';
  @Output() countryChanged = new EventEmitter<void>();

  get formGroup(): FormGroup {
    return this.parentForm.get(this.formGroupName) as FormGroup;
  }
}
