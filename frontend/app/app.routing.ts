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

import { AuthGuard, LoggedOutGuard, AdminGuard, ElectionExistGuard, PollExistGuard, CanVoteGuard, HasVotedGuard, AfterEndElectionGuard, AfterStartElectionGuard } from './guards.guard';


const routes: Routes = [
	{ path: 'login', component: LoginComponent, canActivate: [LoggedOutGuard]},
	{ path: 'elections', component: ElectionsViewerComponent, canActivate: [AuthGuard]},
	{ path: 'elections/add', component: ElectionsEditorComponent, canActivate: [AuthGuard, AdminGuard]},
	{ path: 'elections/:electionName', component: ElectionsEditorComponent, canActivate: [AuthGuard, AdminGuard, ElectionExistGuard]},
	{ path: 'elections/:electionName/polls', component: PollsEditorComponent, canActivate: [AuthGuard, AdminGuard, ElectionExistGuard]},
	{ path: 'elections/:electionName/polls/:pollName', component: PollsEditorComponent, canActivate: [AuthGuard, AdminGuard, ElectionExistGuard, PollExistGuard]},
	{ path: 'elections/:electionName/view', component: ElectionViewerComponent, canActivate: [AuthGuard, ElectionExistGuard]},
	{ path: 'elections/:electionName/vote', component: VoteComponent, canActivate: [AuthGuard, ElectionExistGuard, CanVoteGuard]},
	{ path: 'elections/:electionName/results', component: ResultsComponent, canActivate: [AuthGuard, ElectionExistGuard, AfterEndElectionGuard]},
	{ path: 'elections/:electionName/check', component: CheckComponent, canActivate: [AuthGuard, ElectionExistGuard, AfterStartElectionGuard, HasVotedGuard]},
	{ path: '**', redirectTo: 'login' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true, enableTracing: false })],
	exports: [RouterModule]
})
export class AppRoutingModule { }
