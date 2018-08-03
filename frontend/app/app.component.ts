import { Component, OnInit } from '@angular/core';

import { UserService } from './user.service';

import { User } from '../../models/UserModel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

	private user: User;
	constructor(private userService: UserService) {

	}

	ngOnInit() {
		this.userService.getUser().subscribe(
			(user) => {
				this.user = user;
			}
		);
	}
}
