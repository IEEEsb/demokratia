import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilsService } from 'angular-ieeesb-lib';
import { UserService } from '../user.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

	error: String;

	constructor(private utilsService: UtilsService, private userService: UserService, private router: Router) { }

	ngOnInit() {
		this.utilsService.getParams().subscribe((params) => {
			if (!params) return;

			if (params.token) {
				this.userService.login(params.token).subscribe((user) => {
					this.router.navigate(['/']);
					this.utilsService.setParams(null);
				});
			}
		});
	}

}
