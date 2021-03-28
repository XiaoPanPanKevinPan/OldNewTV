/*Channel Manager*/
function switchChannel(number){
	channel = presetChannelList[number]; //get info of the channel
	if(typeof(channel)=="undefined"){
		console.log("ERR: The required channel doesn't exist.");
		return -1;
	}
	if(channel.server = "yt"){
		let loop = false, ytAutoUpToDate = false;
		if(channel.ytType == "List" || channel.ytType == "Video"){
			loop = true;
		}else if(channel.ytType == "Stream"){
			ytAutoUpToDate = true;
		}else{
			console.log("ERR: \"ytType\" should be one of [\"List\", \"Video\", \"Stream\"], instead of \"%s\".", channel.ytType);
			return -1;
		}
		
		if(player.server = "yt"){
			player.destroy();
		}
		
		player =  new playerStructure.yt(channel.ytType, channel.ytCode, loop, ytAutoUpToDate);
		console.log("O K: NewChannel!");
		return 0;
	}
	console.log("ERR: \"server\" should be one of [\"yt\"(, \"m3u8\")], instead of \"%s\".", channel.server);
	return -1;
}

var newChannelNumber = ""; /*the number of video*/
window.addEventListener("keydown", (event)=>{/*when user is switching the channel*/
	whetherChangedNumberString = true;
	if(
		!event.ctrlKey &&
		!event.altKey &&
		!event.shiftKey &&
		!event.metaKey &&  ["0","1","2","3","4","5","6","7","8","9"].includes(event.key)
	){/*type in number*/
		newChannelNumber += event.key;
	}else{/*remove number at the end*/
		switch(event.key){
			case "Delete":
				newChannelNumber = "";
				break;
			case "Backspace":
				newChannelNumber = newChannelNumber.slice(0, newChannelNumber.length-1);
				break;
			case "Enter":
				whetherChangedNumberString = false;
				cleanAllNotifi();
				if(switchChannel(newChannelNumber)==0 /*Success*/){
					createNotifi(
						"newChannelNumber",
						"OK",
						3, {
							display: "inline",
							position: "fixed",
							top: "2.5vh",
							right: "2.5vh",
							"background-color": "rgba(0,255,0,0.5)"
					});
				}else{/* -1, failed*/
					createNotifi(
						"newChannelNumber",
						"Not Exists",
						3, {
							display: "inline",
							position: "fixed",
							top: "2.5vh",
							right: "2.5vh",
							"background-color": "rgba(255,0,0,0.5)"
					});
				}
				newChannelNumber = "";
				break;
			default:
				whetherChangedNumberString = false;
		}
	}
	/*show the number on the screen*/
	if(whetherChangedNumberString == true){
		createNotifi(
			"newChannelNumber",
			newChannelNumber,
			5, {
				display: "inline",
				position: "fixed",
				top: "2.5vh",
				right: "2.5vh"
		});
	}
});