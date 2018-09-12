import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { UserService } from '../user.service';

import { User } from '../../../models/UserModel';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

	user: User = {
		alias: '',
		password: ''
	};

	error = null;

	constructor(private userService: UserService, private router: Router) {

	}

	ngOnInit() {

	}

	login() {
		this.userService.login(this.user.alias, this.user.password).subscribe(
			(data: User) => {
				this.error = null;
				this.router.navigate(['/elections']);
			},
			error => {
				this.error = error;
			}
		);
	}
}
