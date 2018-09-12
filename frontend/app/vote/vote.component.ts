import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ElectionService } from '../election.service';

import { Election } from '../../../models/Election';

@Component({
	selector: 'app-vote',
	templateUrl: './vote.component.html',
	styleUrls: ['./vote.component.less']
})
export class VoteComponent implements OnInit {

	election: Election;

	selectedPoll = -1;
	choices = [];
	token: string;

	error = '';

	constructor(private electionService: ElectionService, private router: Router, private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params['electionName']) {
				this.electionService.getElection(params['electionName']).subscribe(
					(election) => {
						this.election = election;
						this.electionService.canVote(this.election.name).subscribe(
							() => {
							},
							(error) => {
								this.router.navigate(['/elections/' + this.election.name + '/view']);
							}
						);
						this.selectedPoll = 0;
						for (const poll of this.election.polls) {
							this.choices.push({
								'poll': poll.name,
								'candidate': null
							});
						}
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

	getUserName(pollName: string, userId: string) {
		if (userId) {
			const pollIndex = this.election.polls.findIndex(poll => poll.name === pollName);
			return this.election.polls[pollIndex].candidacies[this.election.polls[pollIndex].candidacies.findIndex(c => c.user._id === userId)].user.name;
		} else {
			return 'Voto en blanco';
		}
	}

	previous() {
		if (this.selectedPoll === -1) {
			this.selectedPoll = this.election.polls.length - 1;
		} else {
			this.selectedPoll -= 1;
		}
	}

	next() {
		if (this.selectedPoll === this.election.polls.length - 1) {
			this.selectedPoll = -1;
		} else {
			this.selectedPoll += 1;
		}
	}

	submit() {
		if (confirm('¿Estás seguro de tu elección?')) {
			this.electionService.vote(this.election.name, this.choices).subscribe(
				(secret) => {
					this.token = secret.secret;
				},
				(error) => {

				}
			);
		}
	}

}
