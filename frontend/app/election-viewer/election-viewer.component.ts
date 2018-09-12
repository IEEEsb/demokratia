import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ElectionService } from '../election.service';

import { Election } from '../../../models/Election';

@Component({
	selector: 'app-election-viewer',
	templateUrl: './election-viewer.component.html',
	styleUrls: ['./election-viewer.component.less']
})
export class ElectionViewerComponent implements OnInit {

	election: Election ;
	currentDate: Date = new Date();

	error = '';

	constructor(private electionService: ElectionService, private router: Router, private route: ActivatedRoute) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params['electionName']) {
				this.electionService.getElection(params['electionName']).subscribe(
					(election) => {
						this.election = election;
					},
					(error) => {
						this.error = 'Esas elecciones no existen';
						this.router.navigate(['/elections']);
					}
				);
			} else {
				this.router.navigate(['/elections']);
			}
		});
	}

}
