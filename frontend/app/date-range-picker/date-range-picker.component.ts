import { Component, OnInit, OnChanges, SimpleChanges, SimpleChange, Input, Output, EventEmitter } from '@angular/core';

import { NgbDateStruct, NgbCalendar, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
!one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
!one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
	selector: 'app-date-range-picker',
	templateUrl: './date-range-picker.component.html',
	styleUrls: ['./date-range-picker.component.less']
})
export class DateRangePickerComponent implements OnInit, OnChanges {

	@Input() startDate: Date;
	@Input() endDate: Date;

	@Output() startDateChange = new EventEmitter<Date>();
	@Output() endDateChange = new EventEmitter<Date>();

	dateState = 0;

	hoveredDate: NgbDateStruct;
	fromDate: NgbDateStruct;
	toDate: NgbDateStruct;

	fromTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};
	toTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};

	getTime(date: Date): NgbTimeStruct {
		return { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() };
	}

	setTime(date: Date, time: NgbTimeStruct) {
		date.setHours(time.hour);
		date.setMinutes(time.minute);
		date.setSeconds(time.second);
		return date;
	}

	getDate(date: Date): NgbDateStruct {
		return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
	}

	setDate(date: Date, dateStruct: NgbDateStruct): Date {
		date.setFullYear(dateStruct.year);
		date.setMonth(dateStruct.month - 1);
		date.setDate(dateStruct.day);
		return date;
	}

	constructor(calendar: NgbCalendar) {
		this.fromDate = calendar.getToday();
		this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
	}

	ngOnInit() {

	}


	ngOnChanges(changes: SimpleChanges) {
		if (changes.startDate && this.startDate) {
			this.fromTime = this.getTime(this.startDate);
			this.fromDate = this.getDate(this.startDate);
		}
		if (changes.endDate && this.endDate) {
			this.toTime = this.getTime(this.endDate);
			this.toDate = this.getDate(this.endDate);
		}
	}

	onDateSelection(date: NgbDateStruct) {
		if (this.dateState === 0) {
			this.fromDate = date;
			this.toDate = null;
			this.dateState = 1;
		} else {
			this.toDate = date;
			this.dateState = 0;
			this.updateDate();
		}
	}

	updateDate() {
		if (this.fromDate) {
			let date = new Date();
			date = this.setDate(date, this.fromDate);
			date = this.setTime(date, this.fromTime);
			this.startDateChange.emit(date);
		}

		if (this.toDate) {
			let to = new Date();
			to = this.setDate(to, this.toDate);
			to = this.setTime(to, this.toTime);
			this.endDateChange.emit(to);
		}
	}

	isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
	isInside = date => after(date, this.fromDate) && before(date, this.toDate);
	isFrom = date => equals(date, this.fromDate);
	isTo = date => equals(date, this.toDate);

}
