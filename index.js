"use strict";
const EventEmitter = require("events").EventEmitter;
const RCONSocket = require("./src/socket");
const RCONPacket = require("./src/packet");

class mineRCON {
	constructor(ip, port, timeout){
		this._events = new EventEmitter();
		
		this._ip = ip;
		this._port = port;
		
		this._socket = new RCONSocket(this._ip, this._port, timeout, this._events);
		this.connected = false;
		
		this._lastId = 0;
	}
	connect(pw){
		return this._socket.connect().then(res=>{
			return this._auth(pw);
		},err=>{
			throw err;
		});
	}
	_auth(pw){
		return new Promise((resolve,reject)=>{
			return this.send(pw, "LOGIN").then(res=>{
				// Authenticated successfully
				this.connected = true;
				this._events.emit("ready");
				resolve();
			},err=>{
				this.connected = false;
				this._events.emit("error",err);
				reject(err);
			});
		});
	}
	disconnect(){
		return this._socket.disconnect();
	}
	destroy(){
		return this._socket.close();
	}
	send(cmd, type="CMD"){
		let id = (this._lastId+1)%RCONPacket.MAX_ID;
		let packet = new RCONPacket(RCONPacket.Types[type], id);
		this._lastId = id;
		
		packet.write(cmd);
		
		// send data
		return this._socket.send(packet);
	}
	on(type,callback){
		this._events.on(type,callback);
	}
}

module.exports = mineRCON;