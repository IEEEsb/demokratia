import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LoadingService {

	private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor() { }

	getLoading() {
		return this.loadingSubject.asObservable();
	}

	setLoading() {
		this.loadingSubject.next(true);
	}

	unsetLoading() {
		this.loadingSubject.next(false);
	}
}
