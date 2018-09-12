import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

import { ElectionService } from '../election.service';

import { Election } from '../../../models/Election';
import { Poll } from '../../../models/Poll';

@Component({
	selector: 'app-polls-editor',
	templateUrl: './polls-editor.component.html',
	styleUrls: ['./polls-editor.component.less']
})
export class PollsEditorComponent implements OnInit {

	editing = false;
	election: Election;
	poll: Poll;
	candidacies: any = [];

	potentialCandidates: any = [];

	constructor(private electionService: ElectionService, private router: Router, private route: ActivatedRoute) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params['electionName']) {
				this.electionService.getElection(params['electionName']).subscribe(
					(election) => {
						this.election = election;
						if (params['pollName']) {
							this.editing = true;
							const pollIndex = this.election.polls.findIndex(poll => poll.name === params['pollName']);
							if (pollIndex >= 0) {
								this.poll = this.election.polls[pollIndex];
							} else {
								this.router.navigate(['/elections/' + this.election.name]);
							}
						} else {
							this.editing = false;
							this.poll = {};
						}

						this.electionService.getPotentialCandidates(this.election.name).subscribe((candidates) => {
							this.potentialCandidates = candidates.users;
						});


					},
					(error) => {
					}
				);
			}
		});

	}

	search = (text$: Observable<string>) =>
	text$.pipe(
		debounceTime(200),
		distinctUntilChanged(),
		map(term => term.length < 2 ? [] : this.potentialCandidates.filter(v =>
			this.poll.candidacies.findIndex(candidacy => candidacy.user.alias === v.alias) < 0
			&&
			(
				v.alias.toLowerCase().indexOf(term.toLowerCase()) > -1
				||
				v.name.toLowerCase().indexOf(term.toLowerCase()) > -1
			)
		).map(v => `${v.alias}`).slice(0, 10))
	)


	addTempCandidate(event: NgbTypeaheadSelectItemEvent) {
		if (this.poll.candidacies.findIndex(candidacy => candidacy.user.alias === event.item) >= 0 || this.potentialCandidates.findIndex(candidate => candidate.alias === event.item) < 0) {
			return event.preventDefault();
		}
		const candidateIndex = this.potentialCandidates.findIndex(candidate => candidate.alias === event.item);

		const candidacy = this.potentialCandidates[candidateIndex];
		candidacy.proposal = '';
		this.potentialCandidates.splice(candidateIndex, 1);
		this.candidacies.push(candidacy);
	}

	deleteTempCandidacy(index: number) {
		this.potentialCandidates.push(this.candidacies[index]);
		this.candidacies.splice(index, 1);
	}

	addCandidacy(index: number) {
		let candidacy = this.candidacies[index];
		this.electionService.addCandidacy(this.election.name, this.poll.name, candidacy).subscribe(
			() => {
				candidacy = this.candidacies[index];
				candidacy.user = {
					'name': candidacy.name,
					'alias': candidacy.alias
				};
				candidacy.name = undefined;
				candidacy.alias = undefined;
				this.poll.candidacies.push(candidacy);
				this.candidacies.splice(index, 1);
			},
			(error) => {

			}
		);
	}

	deleteCandidacy(alias: string) {
		const candidacyIndex = this.poll.candidacies.findIndex(candidate => candidate.user.alias === alias);
		this.electionService.deleteCandidacy(this.election.name, this.poll.name, alias).subscribe(() => {
			this.poll.candidacies.splice(candidacyIndex, 1);
			this.electionService.getPotentialCandidates(this.election.name).subscribe((candidates) => {
				this.potentialCandidates = candidates.users;
			});
		});
	}

	submit() {
		if (this.editing) {
			this.electionService.updatePoll(this.election.name, this.poll).subscribe(
				() => {
				},
				(error) => {

				}
			);
		} else {
			this.electionService.addPoll(this.election.name, this.poll).subscribe(
				() => {
					this.router.navigate(['/elections/' + this.election.name + '/polls/' + this.poll.name]);
				},
				(error) => {

				}
			);
		}

	}

}
