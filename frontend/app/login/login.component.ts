import { Component, OnInit } from '@angular/core';

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

	constructor(private userService: UserService) {
	}

	ngOnInit() {
	}

	login() {
		this.userService.login(this.user.alias, this.user.password).subscribe(
			(data: User) => {
				this.error = null;
				console.log(data);
			},
			error => {
				console.log(error);
				this.error = error;
			}
		);
	}
}
