//© John Allsopp (@johnallsopp) 2013
//http://wwebdirections.org

//use this to take a snapshot from a device's camera if it supports getUserMedia
//initialize the videoCamera with videoCamera.initialize, passing a video and canvas element 
//call videoCamera.takeSnapshot to take a snapshot. It returns a dataURL of the snapshot

var videoCamera = {
	videoStream: null, //the video stream from the browser
	videoElement: null, //the video element in the page
	snapShotCanvas: null, //the canvas element where we'll grab the snapshot to
	streamFailedCallback: null, //set a stream failed callback if you want to get notified of failure to get a local stream
	
	initialize: function(video, canvas) {
		//initialize the videoStream, with a video element and canvas on the page
		//algorithm adapted from https://developer.mozilla.org/en-US/docs/WebRTC/navigator.getUserMedia
		
		if (!navigator.getMedia) {
			//handle browser prefixes
			navigator.getMedia = ( navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia);
		}

		videoCamera.videoElement = video;
		videoCamera.snapShotCanvas = canvas;
		//we'll be using these elements to get the video stream, and capture snapshots of the video

		navigator.getMedia({video: true}, videoCamera.getVideoStream, videoCamera.getStreamFailed);
		//call getUserMedia, giving it a success and failure callback
		//this initializes the video stream
	},
	
	getVideoStream: function(stream) {
		//success callback for getUserMedia
		videoCamera.videoElement.src = window.URL.createObjectURL(stream);
		videoCamera.videoStream = stream;		
	},

	getStreamFailed: function() {
		//failure callback for getUserMedia - crude but will do for the demo
		
		if (videoCamera.streamFailedCallback) {
			//if we've been passed a callback, call it
			videoCamera.streamFailedCallback()
		}
		
		else {
			//otherwise, show an alert
			alert("Sorry, getUserMedia doesn't seem to be supported in this browser. Try Chrome or Firefox")
		}
	},

	takeSnapshot: function () {
		//take a snaphot from the videostream and pass it back as a dataURL
		if (videoCamera.videoStream) {
			//if we are getting a stream then

			var context = videoCamera.snapShotCanvas.getContext('2d')
			// we get the 2D context of the canvas, and use the video element to draw an image into it
			context.drawImage(videoCamera.videoElement, 0, 0);

			//let's add a timestamp
			var now = new Date();
			var theTime = now.getDate() + ":" + (now.getMonth() + 1) + ":" 
			+ now.getFullYear() + ":" + now.getHours() + "h:" + now.getMinutes() +"m";
			context.font="20px monaco";
			context.fillStyle = "white";
			context.strokeStyle = "black";
			context.fillText("taken at: " + theTime, 10, 30);
			
			var shot = videoCamera.snapShotCanvas.toDataURL('image/png');
			//we now grab the image as dataURL
			
			return shot;
			// return the dataURL
		}
	}
}