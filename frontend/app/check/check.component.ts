import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ElectionService } from '../election.service';

import { Election } from '../../../models/Election';

@Component({
	selector: 'app-check',
	templateUrl: './check.component.html',
	styleUrls: ['./check.component.less']
})
export class CheckComponent implements OnInit {

	election: Election;

	token: string = "";
	choices: any[];

	error: String = "";

	constructor(private electionService: ElectionService, private router: Router, private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params['electionName']) {
				this.electionService.getElection(params['electionName']).subscribe(
					(election) => {
						this.election = election;
					},
					(error) => {
						console.log("Error: ", error);
						this.error = "Esas elecciones no existen";
						this.router.navigate(['/elections']);
					}
				)
			} else {
				this.router.navigate(['/elections']);
			}
		});
	}

	submit() {
		this.electionService.check(this.election.name, this.token).subscribe(
			(choices) => {
				this.choices = choices.choices;
			},
			(error) => {
				this.error = "¡Token inválido!"
			}
		);
	}

}
