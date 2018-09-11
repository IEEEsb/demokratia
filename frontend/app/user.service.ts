import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { SHA256 } from 'crypto-js';

import { User } from '../../models/UserModel';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

	constructor(private http: HttpClient) {

	}

	login(alias: string, password: string) {
		console.log(`alias: ${alias}, password: ${password}`);
		const body = {
			alias: alias,
			password: password === '' ? '' : SHA256(password).toString()
		};

		return this.http.post<User>('api/login', body)
		.pipe(
			tap((user) => this.userSubject.next(user)),
			catchError(this.handleError)
		);
	}

	getUser() {
		return this.userSubject.asObservable();
	}

	update() {
		this.http.get<User>('api/user')
		.pipe(catchError(this.handleError))
		.subscribe(
			(user) => {
				this.userSubject.next(user);
			}
		);
	}

	private handleError(error: HttpErrorResponse) {

		console.log(error);
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
