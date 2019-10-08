import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { LoadingService, UtilsService } from 'angular-ieeesb-lib';

import { SHA256 } from 'crypto-js';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	constructor(private http: HttpClient, private loadingService: LoadingService, private utilsService: UtilsService) {

	}

	getAuthData() {
		this.loadingService.setLoading();
		return this.http.get<any>('api/auth')
			.pipe(
				tap((data) => {
					this.loadingService.unsetLoading();
				}),
				catchError(this.utilsService.handleError.bind(this))
			);
	}

	login(token) {
		this.loadingService.setLoading();
		return this.http.post<any>('api/login/', { token })
			.pipe(
				tap((data) => {
					this.userSubject.next(data.user);
					this.loadingService.unsetLoading();
				}),
				catchError(this.utilsService.handleError.bind(this))
			);
	}

	logout() {
		this.loadingService.setLoading();
		return this.http.post<any>('api/logout/', {})
			.pipe(
				tap((data) => {
					this.userSubject.next(null);
					this.loadingService.unsetLoading();
				}),
				catchError(this.utilsService.handleError.bind(this))
			);
	}

	getUser() {
		return this.http.get<any>('api/user')
			.pipe(catchError(this.handleError));
	}

	update() {
		this.http.get<any>('api/user')
			.pipe(catchError(this.handleError))
			.subscribe(
				(user) => {
					this.userSubject.next(user);
				}
			);
	}

	private handleError(error: HttpErrorResponse) {

		let errorText;
		if (error.error instanceof ProgressEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.message);
			errorText = 'Error en la red';
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);

			switch (error.error.code) {
				case 'wrong_user_pass':
					errorText = 'Usuario/Contraseña incorrectos';
					break;

				case 'invalid_parameters':
					errorText = `Parámetros inválidos`;
					break;

				default:
					errorText = 'Error desconocido';
					break;
			}
		}
		// return an observable with a user-facing error message
		return throwError(errorText);
	}
}
