import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ElectionService } from '../election.service';

import { Election } from '../../../models/Election';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.less']
})
export class ResultsComponent implements OnInit {

	election: Election;

	results: any[];

	error: String = "";

	constructor(private electionService: ElectionService, private router: Router, private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params['electionName']) {
				this.electionService.getElection(params['electionName']).subscribe(
					(election) => {
						this.election = election;
						this.electionService.results(this.election.name).subscribe(
							(results) => {
								this.results = results;
							},
							(error) => {
							}
						)
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

}
