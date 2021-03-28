"use strict";

/*Control*/
var player = {}; // Global Variable.
var playerStructure = { /*the structure of the player*/
	yt: function(type, ID, whetherToLoop, whetherAutoGetUpToDate){
		this.server = "yt";
		
		/*Config the YT Player*/
		let playerVars = {
			controls: 0,
			disablekb: 1, /* disablekb is to remove all the keyboard shortcuts (especially NUMBER). Add back or change some of them later. */
			iv_load_policy:3,
			rel: 0,
			fs: 0,
		}
		if(type=="List"){
			playerVars.listType = "playlist";
			playerVars.list = ID;
		}
		if(whetherToLoop == true){
			playerVars.loop= "1";
			if(type=="Video"){
				playerVars.playlist = ID;
			}
		}

		/*Create the YT Player*/
		this.body = new YT.Player("ytPlayer", {
			height: "100%",
			width: "100%",
			videoId: (type=="Stream" || type=="Video")?ID:"",
			playerVars: playerVars,
			events:{
				"onReady": (event)=>{
					/*autoplay & try to get up-to-date*/
					this.body.playVideo();
					this.body.toggledEventID = []; /**/
				},
				"onStateChange": (whetherAutoGetUpToDate)?(event)=>{
					var state = event.data;
					if(
						state == -1 /*unstarted*/ ||
						state == YT.PlayerState.PAUSED ||
						state == YT.PlayerState.CUED
					){
						/*Here we use a weird way to detect if an event has been triggered or not. If true, than ignore it. We couldn't use this.body.removeEventListener("onStateChange", func) because this part of the api seems to be broken.*/
						var ID = Date.now();
						var func = (event) => {
							if(this.body.toggledEventID.includes(ID)){
								return;
							}

							var state = event.data;
							if(
								state == YT.PlayerState.PLAYING ||
								state == YT.PlayerState.BUFFERING
							){
								this.body.getUpToDate();
							}
							this.body.toggledEventID.push(ID);
							return;
						};
						this.body.addEventListener("onStateChange", func);
						return;
					}
				}:(event)=>{}
			}
		});
		
		/*the united and universal functions*/
		this.dom = document.querySelector("ytPlayer");
		this.destroy = ()=>{
			this.body.destroy();
		};
		this.volume = (vol)=>{
			if(typeof(vol)=="NUMBER" && 0<=vol && vol<=100){
				this.body.setVolume(vol);
			}
			return this.body.getVolume();
			/*A known issue: The returned value isn't the new volume but the old one.*/
		}
		this.mute = (state) =>{
			if(typeof(state)!="undefined"){
				if(["on", true, 1, "1"].includes(state)){
					this.body.mute();
				}else if(["off", false, 0, "0"].includes(state)){
					this.body.unMute();
				}else if("switch"){
					(this.body.isMuted())?this.body.unMute():this.body.mute();
				}
			}
			return this.body.isMuted();
		}
		
		/*video control shortcuts*/
		this.body.playAndPause = ()=>{
			if(this.body.getPlayerState() == YT.PlayerState.PAUSED){
				this.body.playVideo();
			}else{
				this.body.pauseVideo();
			}
		};
		this.body.getUpToDate = () => {
			this.body.setPlaybackRate(2);/*Once it gets to the newest, the video would pause for seconds and auto-set the speed to 1*/
			createNotifi("adjusting", "正在縮短時間差，請稍待……");
		}
		window.addEventListener('keydown', (event)=>{
			switch(event.key){
				/*Volume Up*/
				case "+":
				case "ArrowRight":
					var vol = this.body.getVolume();
					this.body.setVolume(vol + 5);
					createNotifi(
						"volume",
						"Vol:" + ((vol<=95)?(vol + 5):(100)) + "%",
						5, {
							display: "inline",
							position: "fixed",
							top: "2.5vh",
							left: "2.5vh",
					});
					break;

				/*Volume Down*/
				case "-":
				case "ArrowLeft":
					var vol = this.body.getVolume();
					this.body.setVolume(vol + 5);
					this.body.setVolume(vol - 5);
					createNotifi(
						"volume",
						"Vol:" + ((vol>=5)?(vol - 5):(0)) + "%",
						5, {
							display: "inline",
							position: "fixed",
							top: "2.5vh",
							left: "2.5vh",
					});
					break;

				/*Pause & Play*/
				case " ":
					this.body.playAndPause();
					break;

				/*FullScreen*/
				case "f":
					fullscreen("switch");

				/*Clean the notification*/
				case "Escape":
					cleanAllNotifi();
			}
		});
		//return this;
	}
};

function fullscreen(newState){
	if(typeof(newState) !== "undefined"){
		if(newState == true || newState == "on"){ //turn on fullscreen
			document.documentElement.requestFullscreen();
		}else if(newState == false || newState == "off"){ //turn off fullscreen
			document.exitFullscreen();
		}if(newState == "switch"){ //switch fullscreen
			if(!document.fullscreenElement){
				document.documentElement.requestFullscreen();
			}else{
				document.exitFullscreen();
			}
		}
	}
	return (!document.fullscreenElement)?false:true; //return fullscreen state
}