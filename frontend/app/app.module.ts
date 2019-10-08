import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from './user.service';
import { ElectionService } from './election.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';

import { AppRoutingModule } from './app.routing';
import { ElectionsViewerComponent } from './elections-viewer/elections-viewer.component';
import { ElectionsEditorComponent } from './elections-editor/elections-editor.component';
import { LoaderComponent } from './loader/loader.component';
import { DateRangePickerComponent } from './date-range-picker/date-range-picker.component';
import { PollsEditorComponent } from './polls-editor/polls-editor.component';
import { ElectionViewerComponent } from './election-viewer/election-viewer.component';
import { VoteComponent } from './vote/vote.component';
import { CheckComponent } from './check/check.component';
import { ResultsComponent } from './results/results.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		ElectionsViewerComponent,
		ElectionsEditorComponent,
		LoaderComponent,
		DateRangePickerComponent,
		PollsEditorComponent,
		ElectionViewerComponent,
		VoteComponent,
		CheckComponent,
		ResultsComponent
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		AppRoutingModule,
		FontAwesomeModule,
		FormsModule,
		ReactiveFormsModule,
		NgbModule
	],
	providers: [
		UserService,
		ElectionService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
