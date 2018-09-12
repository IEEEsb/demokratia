import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ElectionService } from '../election.service';

import { Election } from '../../../models/Election';


@Component({
	selector: 'app-elections-editor',
	templateUrl: './elections-editor.component.html',
	styleUrls: ['./elections-editor.component.less']
})
export class ElectionsEditorComponent implements OnInit {

	editing = false;
	election: Election = {};

	constructor(private electionService: ElectionService, private router: Router, private route: ActivatedRoute) {
	}

	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params['electionName']) {
				this.editing = true;
				this.electionService.getElection(params['electionName']).subscribe(
					(election) => {
						this.election = election;
					},
					(error) => {
					}
				)
			} else {
				this.editing = false;
				this.election.startDate = new Date();
				this.election.endDate = new Date();
				this.election.endDate.setMonth(this.election.startDate.getMonth() < 11 ? this.election.startDate.getMonth() + 1 : 0);
			}
		});
	}

	delete(index: number) {
		this.electionService.deletePoll(this.election.name, this.election.polls[index].name).subscribe(
			() => {
				this.election.polls.splice(index, 1);
			},
			(error) => {

			}
		);
	}

	submit() {
		if(this.editing) {
			this.electionService.updateElection(this.election).subscribe(
				() => {
				},
				(error) => {

				}
			);
		} else {
			this.electionService.addElection(this.election).subscribe(
				(election) => {
					this.router.navigate(['/elections/' + election.name]);
				},
				(error) => {

				}
			);
		}
	}

	get formValid() {
		return true;
	}

}
