"use strict";
const Socket = require("net").Socket;
const RCONError = require("./rconerror");
const RCONRequest = require("./rconrequest");
const RCONPacket = require("./packet");

module.exports = class RCONSocket{
	constructor(host, port, timeout, events){
		this._events = events;
		this._timeout = timeout;
		this._port = port;
		this._host = host;
		
		this._requests = new Map();
		
		this._socket = new Socket();
		this._socket.on("error",err=>{
			events.emit("error",err);
		});
		this._socket.on("data",data=>this._rx(data));
		this._socket.on("close",hadError=>{
			if(hadError) events.emit("error",new RCONError("Socket transmission error."));
			events.emit("close");
		});
	}
	connect(pw){
		return new Promise((resolve,reject)=>{
			this._socket.connect({
				port:this._port,
				host:this._host
			},()=>{
				resolve();
			});
		});
	}
	disconnect(){
		return new Promise((resolve,reject)=>{
			this._socket.once("error",reject);
			this._socket.once("end",resolve);
			this._socket.end();
		});
	}
	close(){
		return new Promise((resolve,reject)=>{
			this._socket.once("error",reject);
			this._socket.once("close",resolve);
			this._socket.destroy();
		});
	}
	send(packet){
		// send raw data
		return new Promise((resolve,reject)=>{
			let req = new RCONRequest(packet.type);
			this._requests.set(packet.id,req);
			
			req.on("response",data=>{
				resolve(data.toString("ascii"));
			});
			
			req.on("error",err=>reject(err));
			
			this._socket.write(packet.data.toString("binary"), "binary");
		});
	}
	_rx(data){
		// receive data
		let packet = RCONPacket.parse(data);
		if(packet.id == -1){
			let reqs = Array.from(this._requests.values());
			// find most recent login attempt
			for(let i = reqs.length - 1; i >= 0; i--){
				if(reqs[i].type == RCONPacket.Types["LOGIN"]) reqs[i]._events.emit("error",new RCONError("Authentication failed."));
			}
		}else if(this._requests.has(packet.id)){
			let req = this._requests.get(packet.id);
			req.res.push(packet._body);
			// TODO: Handle multipart responses
			req._events.emit("response",packet._body);
		}else{
			this._events.emit("error",new RCONError("Received package with invalid id."));
		}
	}
}