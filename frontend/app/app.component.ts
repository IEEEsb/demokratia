import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { LoadingService } from './loading.service';
import { UserService } from './user.service';

import { User } from '../../models/UserModel';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

	user: User;
	loading: boolean;
	constructor(private location: Location, private router: Router, private userService: UserService, private loadingService: LoadingService) {

	}

	ngOnInit() {
		this.loadingService.getLoading().subscribe(
			(loading) => {
				this.loading = loading;
			}
		);
		this.userService.getUser().subscribe(
			(user) => {
				this.user = user;
			}
		);
		this.userService.update();
	}

	back() {
		this.location.back();
	}

	logout() {
		this.userService.logout().subscribe(
			() => {
				this.router.navigate(['/login']);
			},
			(error) => {
				this.router.navigate(['/login']);
			}
		);

	}
}
