import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { UserService } from './user.service';
import { ElectionService } from './election.service';
import { UtilsService } from 'angular-ieeesb-lib';

const config = require('../../config.json');

@Injectable({
	providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {

	constructor(private userService: UserService, private utilsService: UtilsService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return new Promise((resolve, reject) => {
			this.userService.getUser().subscribe(
				(user) => resolve(true),
				(e) => {
					this.userService.getAuthData().subscribe((data) => {
						const query = this.utilsService.objectToQuerystring({
							callback: `${config.host}/%23/login`,
							service: data.service,
							scope: data.scope.join(','),
						})
						window.location.replace(`${data.server}/#/login${query}`);
					});
				}
			);
		});
	}
}


@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {

	constructor(private userService: UserService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			this.userService.getUser().subscribe(
				(user) => {
					if (user) {
						resolve(true);
					} else {
						resolve(false);
						this.router.navigate(['/login']);
					}
				},
				(error) => {
					resolve(false);
				}
			);
		});
	}
}

@Injectable({
	providedIn: 'root'
})
export class LoggedOutGuard implements CanActivate {

	constructor(private userService: UserService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			this.userService.getUser().subscribe(
				(user) => {
					if (user) {
						resolve(false);
						this.router.navigate(['/elections']);
					} else {
						resolve(true);
					}
				},
				(error) => {
					resolve(true);
				}
			);
		});
	}
}

@Injectable({
	providedIn: 'root'
})
export class AdminGuard implements CanActivate {

	constructor(private userService: UserService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			this.userService.getUser().subscribe(
				(user) => {
					if (user.roles.includes('admin')) {
						resolve(true);
					} else {
						resolve(false);
						this.router.navigate(['/login']);
					}
				},
				(error) => {
					resolve(false);
				}
			);
		});
	}
}

@Injectable({
	providedIn: 'root'
})
export class ElectionExistGuard implements CanActivate {

	constructor(private electionService: ElectionService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			if (route.params['electionName']) {
				this.electionService.getElection(route.params['electionName']).subscribe(
					(election) => {
						resolve(true);
					},
					(error) => {
						resolve(false);
					}
				);
			} else {
				resolve(false);
			}
		});
	}
}

@Injectable({
	providedIn: 'root'
})
export class PollExistGuard implements CanActivate {

	constructor(private electionService: ElectionService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			if (route.params['electionName']) {
				this.electionService.getElection(route.params['electionName']).subscribe(
					(election) => {
						const pollIndex = election.polls.findIndex(poll => poll.name === route.params['pollName']);
						if (pollIndex >= 0) {
							resolve(true);
						} else {
							resolve(false);
							this.router.navigate(['/elections/' + election.name]);
						}
					},
					(error) => {
						resolve(false);
						this.router.navigate(['/elections']);
					}
				);
			} else {
				resolve(false);
				this.router.navigate(['/elections']);
			}
		});
	}
}

@Injectable({
	providedIn: 'root'
})
export class CanVoteGuard implements CanActivate {

	constructor(private electionService: ElectionService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			if (route.params['electionName']) {
				this.electionService.getElection(route.params['electionName']).subscribe(
					(election) => {
						this.electionService.canVote(election.name).subscribe(
							() => {
								resolve(true);
							},
							(error) => {
								resolve(false);
								this.router.navigate(['/elections/' + election.name + '/view']);
							}
						);
					},
					(error) => {
						resolve(false);
						this.router.navigate(['/elections/']);
					}
				);
			} else {
				resolve(false);
				this.router.navigate(['/elections/']);
			}
		});
	}
}

@Injectable({
	providedIn: 'root'
})
export class HasVotedGuard implements CanActivate {

	constructor(private electionService: ElectionService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			if (route.params['electionName']) {
				this.electionService.getElection(route.params['electionName']).subscribe(
					(election) => {
						this.electionService.canVote(election.name).subscribe(
							() => {
								resolve(false);
								this.router.navigate(['/elections/' + election.name + '/view']);
							},
							(error) => {
								resolve(true);
							}
						);
					},
					(error) => {
						resolve(false);
						this.router.navigate(['/elections/']);
					}
				);
			} else {
				resolve(false);
				this.router.navigate(['/elections']);
			}
		});
	}
}

@Injectable({
	providedIn: 'root'
})
export class AfterEndElectionGuard implements CanActivate {

	constructor(private electionService: ElectionService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			if (route.params['electionName']) {
				this.electionService.getElection(route.params['electionName']).subscribe(
					(election) => {
						const now = new Date();
						if (now > election.endDate) {
							resolve(true);
						} else {
							resolve(false);
							this.router.navigate(['/elections/' + election.name + '/view']);
						}
					},
					(error) => {
						resolve(false);
						this.router.navigate(['/elections/']);
					}
				);
			} else {
				resolve(false);
				this.router.navigate(['/elections']);
			}
		});
	}
}

@Injectable({
	providedIn: 'root'
})
export class AfterStartElectionGuard implements CanActivate {

	constructor(private electionService: ElectionService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>((resolve, reject) => {
			if (route.params['electionName']) {
				this.electionService.getElection(route.params['electionName']).subscribe(
					(election) => {
						const now = new Date();
						if (now > election.startDate) {
							resolve(true);
						} else {
							resolve(false);
							this.router.navigate(['/elections/' + election.name + '/view']);
						}
					},
					(error) => {
						resolve(false);
						this.router.navigate(['/elections/']);
					}
				);
			} else {
				resolve(false);
				this.router.navigate(['/elections']);
			}
		});
	}
}
