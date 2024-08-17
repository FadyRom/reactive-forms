import { Component, DestroyRef, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, of } from 'rxjs';

function containsQuestionMark(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }
  return { doesNotContainQuestionMark: true };
}

function emailIsUnique(control: AbstractControl) {
  if (control.value !== 'test@example.com') {
    return of(null);
  }
  return of({ notUnique: true });
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private destroyRef = inject(DestroyRef);

  myForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
      asyncValidators: [emailIsUnique],
    }),
    password: new FormControl('', {
      validators: [
        Validators.minLength(6),
        Validators.required,
        containsQuestionMark,
      ],
    }),
  });

  get emailInvalid() {
    return (
      this.myForm.controls.email.touched &&
      this.myForm.controls.email.dirty &&
      this.myForm.controls.email.invalid
    );
  }

  get passwordInvalid() {
    return (
      this.myForm.controls.password.touched &&
      this.myForm.controls.password.dirty &&
      this.myForm.controls.password.invalid
    );
  }

  get addQuestionMark() {
    return containsQuestionMark;
  }

  ngOnInit() {
    const savedForm = window.localStorage.getItem('saved-login-form');
    if (savedForm) {
      const loadedForm = JSON.parse(savedForm);
      // this.myForm.controls.email = loadedForm.email
      //or we can do this using this method
      this.myForm.patchValue({
        email: loadedForm.email,
      });
    }

    const sub = this.myForm.valueChanges.pipe(debounceTime(500)).subscribe({
      next: (value) =>
        window.localStorage.setItem(
          'saved-login-form',
          JSON.stringify({ email: value.email })
        ),
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }

  onSubmit() {
    console.log(this.myForm.value.email);
  }
}
