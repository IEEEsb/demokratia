import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.less']
})
export class LoaderComponent implements OnInit {

	@Input() loading: boolean;

	constructor() { }

	ngOnInit() {
	}

}
