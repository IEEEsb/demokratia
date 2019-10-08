import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ElectionsViewerComponent } from './elections-viewer/elections-viewer.component';
import { ElectionsEditorComponent } from './elections-editor/elections-editor.component';
import { ElectionViewerComponent } from './election-viewer/election-viewer.component';
import { PollsEditorComponent } from './polls-editor/polls-editor.component';
import { VoteComponent } from './vote/vote.component';
import { ResultsComponent } from './results/results.component';
import { CheckComponent } from './check/check.component';

import { LoggedInGuard, LoggedOutGuard, AdminGuard, ElectionExistGuard, PollExistGuard, CanVoteGuard, HasVotedGuard, AfterEndElectionGuard, AfterStartElectionGuard } from './guards.guard';


const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'elections', component: ElectionsViewerComponent, canActivate: [LoggedInGuard] },
	{ path: 'elections/add', component: ElectionsEditorComponent, canActivate: [LoggedInGuard, AdminGuard] },
	{ path: 'elections/:electionName', component: ElectionsEditorComponent, canActivate: [LoggedInGuard, AdminGuard, ElectionExistGuard] },
	{ path: 'elections/:electionName/polls', component: PollsEditorComponent, canActivate: [LoggedInGuard, AdminGuard, ElectionExistGuard] },
	{ path: 'elections/:electionName/polls/:pollName', component: PollsEditorComponent, canActivate: [LoggedInGuard, AdminGuard, ElectionExistGuard, PollExistGuard] },
	{ path: 'elections/:electionName/view', component: ElectionViewerComponent, canActivate: [LoggedInGuard, ElectionExistGuard] },
	{ path: 'elections/:electionName/vote', component: VoteComponent, canActivate: [LoggedInGuard, ElectionExistGuard, CanVoteGuard] },
	{ path: 'elections/:electionName/results', component: ResultsComponent, canActivate: [LoggedInGuard, ElectionExistGuard, AfterEndElectionGuard] },
	{ path: 'elections/:electionName/check', component: CheckComponent, canActivate: [LoggedInGuard, ElectionExistGuard, AfterStartElectionGuard, HasVotedGuard] },
	{ path: '**', redirectTo: 'elections' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true, enableTracing: false })],
	exports: [RouterModule]
})
export class AppRoutingModule { }
