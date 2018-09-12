import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, delay, catchError } from 'rxjs/operators';

import { LoadingService } from './loading.service';

import { Election } from '../../models/Election';

@Injectable({
	providedIn: 'root'
})
export class ElectionService {

	private elections: Election[] = [];
	private timeout = 250;

	private electionsSubject: Subject<Election[]> = new Subject<Election[]>();
	private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private http: HttpClient, private loadingService: LoadingService) {

	}

	getElections() {
		return this.electionsSubject.asObservable();
	}

	getLoading() {
		return this.loadingSubject.asObservable();
	}

	addElection(election: Election) {
		this.loadingService.setLoading();
		return this.http.post<Election>('api/elections/', election)
		.pipe(
			delay(this.timeout),
			tap((election) => {
				election = this.parseElection(election);
				this.elections = this.elections.concat([election]);
				this.electionsSubject.next(this.elections);
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	deleteElection(electionName: string) {
		this.loadingService.setLoading();
		return this.http.delete('api/elections/' + electionName)
		.pipe(
			delay(this.timeout),
			tap(() => {
				const electionIndex = this.elections.findIndex(election => election.name === electionName);
				this.elections.splice(electionIndex, 1);
				this.electionsSubject.next(this.elections);
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	getElection(electionName: string) {
		this.loadingService.setLoading();
		return this.http.get<Election>('api/elections/' + electionName)
		.pipe(
			delay(this.timeout),
			tap((election) => {
				election = this.parseElection(election);
				const electionIndex = this.elections.findIndex(election => election.name === electionName);
				if (electionIndex < 0) {
					this.elections = this.elections.concat([election]);
				} else {
					this.elections[electionIndex] = election;
				}
				this.electionsSubject.next(this.elections);
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	updateElection(election: Election) {
		election = Object.assign({}, election);
		this.loadingService.setLoading();
		delete election.censusSize;
		delete election.createdDate;
		delete election.polls;
		return this.http.patch('api/elections/' + election.name, election)
		.pipe(
			delay(this.timeout),
			tap(() => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	addPoll(electionName: string, poll: any) {
		this.loadingService.setLoading();
		if (!poll.description) {
			delete poll.description;
		}
		return this.http.post<any>('api/elections/' + electionName + '/polls/', poll)
		.pipe(
			delay(this.timeout),
			tap(() => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	updatePoll(electionName: string, poll: any) {
		this.loadingService.setLoading();
		if (!poll.description) {
			delete poll.description;
		}
		return this.http.patch<any>('api/elections/' + electionName + '/polls/' + poll.name, poll)
		.pipe(
			delay(this.timeout),
			tap(() => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	deletePoll(electionName: string, pollName: string) {
		this.loadingService.setLoading();
		return this.http.delete('api/elections/' + electionName + '/polls/' + pollName)
		.pipe(
			delay(this.timeout),
			tap(() => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	addCandidacy(electionName: string, pollName: string, candidacy: any) {
		this.loadingService.setLoading();
		return this.http.post<any>('api/elections/' + electionName + '/polls/' + pollName + '/candidates', candidacy)
		.pipe(
			delay(this.timeout),
			tap(() => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	deleteCandidacy(electionName: string, pollName: string, alias: string) {
		this.loadingService.setLoading();
		return this.http.delete<any>('api/elections/' + electionName + '/polls/' + pollName + '/candidates/' + alias)
		.pipe(
			delay(this.timeout),
			tap(() => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	getPotentialCandidates(electionName: string) {
		this.loadingService.setLoading();
		return this.http.get<any>('api/elections/' + electionName + '/electable')
		.pipe(
			delay(this.timeout),
			tap((candidates) => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	canVote(electionName: string) {
		this.loadingService.setLoading();
		return this.http.get('api/elections/' + electionName + '/can_vote')
		.pipe(
			delay(this.timeout),
			map(() => true),
			tap(() => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	vote(electionName: string, choices: any) {
		this.loadingService.setLoading();
		return this.http.post<any>('api/elections/' + electionName + '/vote', {'choices': choices})
		.pipe(
			delay(this.timeout),
			tap((secret) => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	results(electionName: string) {
		this.loadingService.setLoading();
		return this.http.get<any>('api/elections/' + electionName + '/results')
		.pipe(
			delay(this.timeout),
			tap((results) => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	check(electionName: string, token: string) {
		this.loadingService.setLoading();
		return this.http.get<any>('api/elections/' + electionName + '/check/' + token)
		.pipe(
			delay(this.timeout),
			tap((choices) => {
				this.loadingService.unsetLoading();
			}),
			catchError(this.handleError.bind(this))
		);
	}

	update() {
		this.loadingService.setLoading();
		this.http.get<Election[]>('api/elections')
		.pipe(
			delay(this.timeout),
			catchError(this.handleError.bind(this))
		)
		.subscribe(
			(elections) => {
				elections = elections.map(this.parseElection);
				this.elections = elections;
				this.electionsSubject.next(this.elections);
				this.loadingService.unsetLoading();
			}
		);
	}

	parseElection(election) {
		election.createdDate = new Date(election.createdDate);
		election.startDate = new Date(election.startDate);
		election.endDate = new Date(election.endDate);
		return election;
	}

	private handleError(error: HttpErrorResponse) {

		this.loadingService.unsetLoading();
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
