"use strict";
const RCONError = require("./rconerror.js");

class RCONPacket {
	constructor(type,id){
		if(Object.values(RCONPacket.Types).includes(type)){
			this.id = id;
			this.type = type;
			
			let head = Buffer.allocUnsafe(12);
			head.writeInt32LE(0,0);
			head.writeInt32LE(this.id, 4);
			head.writeInt32LE(this.type, 8);
			
			this._header = head;
			this._body = null;
			
			this.data = null;
		}else{
			throw new RCONError("Couldn't generate RCONPacket: Unknown packet type.");
		}
	}
	write(data){
		let buf = Buffer.from(data);
		this._header.writeInt32LE(buf.length + 10, 0);
		let nulbuf = Buffer.alloc(2);
		nulbuf.writeInt16LE(0,0);
		this._body = buf;
		this.data = Buffer.concat([
			this._header,
			buf,
			nulbuf
		]);
		return this.data;
	}
	static parse(data){
		let head = data.subarray(0,12);
		let packet = new RCONPacket(head.readInt32LE(8),head.readInt32LE(4));
		packet.write(data.subarray(12));
		return packet;
	}
}

Object.defineProperty(RCONPacket, "Types", {
	value:{
		RES: 0x00,
		CMD: 0x02,
		LOGIN: 0x03
	},
	writable:false
});

Object.defineProperty(RCONPacket, "MAX_ID", {
	value:(2**32/2),
	writable:false
});

module.exports = RCONPacket;