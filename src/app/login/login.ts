import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

import { UsuarioService } from '../core/services/usuario.service';
import { LoginRequest } from '../core/models/usuario.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  loginForm: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submitted = false;
  errorMessage = '';
  cargando = false;

  readonly imagenes = [
    'quesos/sf-principal.jpg',
    'quesos/sf-1.jpg',
    'quesos/sf-2.jpg',
    'quesos/sf-3.jpg',
    'quesos/sf-4.jpg',
    'quesos/sf-5.jpg',
    'quesos/sf-6.jpg',
    'quesos/sf-7.jpg',
  ];

  indiceActual = 0;
  private intervalo: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.intervalo = setInterval(() => {
      this.indiceActual = (this.indiceActual + 1) % this.imagenes.length;
    }, 3500);
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  irA(indice: number): void {
    this.indiceActual = indice;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) return;

    this.cargando = true;
    const request: LoginRequest = this.loginForm.value as LoginRequest;

    this.usuarioService.login(request).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.codigo !== 0) {
          this.errorMessage = response.mensaje;
        }
      },
      error: (err: Error) => {
        this.cargando = false;
        this.errorMessage = err.message;
      }
    });
  }
}
