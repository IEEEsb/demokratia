import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SHA256 } from 'crypto-js';

import { User } from '../../models/UserModel';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient) {

	}

	login(alias: string, password: string) {

		const body = {
			alias: alias,
			password: SHA256(password).toString()
		};

		return this.http.post<User>('api/login', body)
		.pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {

		console.log(error);
		let errorText;
		if (error.error instanceof ProgressEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.message);
			errorText = 'Error en la red';
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);

			switch (error.error.error) {
				case 'wrong_user_pass':
				errorText = 'Combinación Usuario/Contraseña incorrecta';
				break;

				case 'invalid_parameters':
				const parameters = error.error.violations.map((violation) => violation.field[0]);
				errorText = `Parámetros inválidos: ${parameters.join(',')}`;
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
