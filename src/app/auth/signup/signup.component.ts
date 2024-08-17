import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime } from 'rxjs';

function equalValues(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password === confirmPassword) {
    console.log('equal');
    return null;
  }
  console.log('not equal');
  return { passwordsNotEqual: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private destroyRef = inject(DestroyRef);
  checkSubmission = signal(false);
  myForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    passwords: new FormGroup(
      {
        password: new FormControl('', {
          validators: [Validators.required, Validators.minLength(6)],
        }),
        confirmPassword: new FormControl('', {
          validators: [Validators.required],
        }),
      },
      { validators: [equalValues] }
    ),
    firstName: new FormControl('', {
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      validators: [Validators.required],
    }),
    address: new FormGroup({
      street: new FormControl('', {
        validators: [Validators.required],
      }),
      number: new FormControl('', {
        validators: [Validators.required],
      }),
      postalCode: new FormControl('', {
        validators: [Validators.required],
      }),
      city: new FormControl('', {
        validators: [Validators.required],
      }),
    }),
    role: new FormControl('student', {
      validators: [Validators.required],
    }),
    source: new FormArray([
      new FormControl(false),
      new FormControl(false),
      new FormControl(false),
    ]),
    agree: new FormControl(false, { validators: [Validators.required] }),
  });

  get invalidEmail() {
    return (
      this.myForm.controls.email.touched &&
      this.myForm.controls.email.dirty &&
      this.myForm.controls.email.invalid
    );
  }

  // get invalidPassword() {
  //   return (
  //     this.myForm.controls.password.touched &&
  //     this.myForm.controls.password.dirty &&
  //     this.myForm.controls.password.invalid
  //   );
  // }

  // get passwordMatch() {
  //   return (
  //     this.myForm.controls.confirmPassword.value !==
  //       this.myForm.controls.password.value &&
  //     this.myForm.controls.confirmPassword.touched
  //   );
  // }

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
    console.log(this.myForm);
    if (this.myForm.invalid) {
      console.log('invalid');
      this.checkSubmission.set(true);
      return;
    }
    // this.myForm.reset();
  }
}
