import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['address-form.component.css']
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
