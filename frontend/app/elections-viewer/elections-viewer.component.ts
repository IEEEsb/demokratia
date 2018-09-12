import { Component, OnInit } from '@angular/core';

import { ElectionService } from '../election.service';
import { UserService } from '../user.service';

import { Election } from '../../../models/Election';
import { User } from '../../../models/UserModel';

@Component({
	selector: 'app-elections-viewer',
	templateUrl: './elections-viewer.component.html',
	styleUrls: ['./elections-viewer.component.less']
})
export class ElectionsViewerComponent implements OnInit {

	elections: Election[] = [];
	user: User;

	constructor(private electionService: ElectionService, private userService: UserService) {

	}

	ngOnInit() {
		this.electionService.getElections().subscribe(
			(elections) => this.elections = elections
		);
		this.electionService.update();

		this.userService.getUser().subscribe(
			(user) => this.user = user
		);
	}

	delete(index) {
		if (confirm('¿Seguro que quieres borrarlo?')) {
			this.electionService.deleteElection(this.elections[index].name).subscribe(
				() => {
				},
				(error) => {

				}
			);
		}
	}

}
