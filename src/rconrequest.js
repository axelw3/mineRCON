"use strict";
const EventEmitter = require("events").EventEmitter;

module.exports = class RCONRequest{
	constructor(type,resolve,reject){
		this.type = type;
		this._events = new EventEmitter();
		this.res = [];
	}
	on(eventType, listener){
		this._events.on(eventType, listener);
		return;
	}
}