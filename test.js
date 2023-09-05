"use strict";
const mineRCON = require("./");

const HOST = "127.0.0.1";
const PORT = 25575;
const PASSWORD = "password";

let rcon = new mineRCON(HOST, PORT);


// Set listeners
rcon.on("ready",()=>{
	console.log("Connected!");
});

rcon.on("close",()=>{
	console.log("Disconnected.");
});

rcon.on("error",err=>{
	//console.log("Got error:",err);
});

// Run tests
rcon.connect(PASSWORD)
.then(res=>{
	return rcon.send("list");
},err=>{throw err;})
.then(players=>{
	console.log("Players online:",players);
	return rcon.disconnect();
},err=>{throw err;})
.then(()=>{
	return new Promise((resolve,reject)=>{
		setTimeout(()=>{
			rcon.connect(PASSWORD).then(resolve,reject);
		},1000);
	});
},err=>{throw err;})
.then(()=>{
	return rcon.send("say Hello world!");
},err=>{throw err;})
.then(()=>{
	return rcon.destroy();
},err=>{throw err;}).then(()=>{
	console.log("Done!");
},err=>{throw err;}).catch(e=>{
	console.log("An error occured!");
	console.error(e);
});