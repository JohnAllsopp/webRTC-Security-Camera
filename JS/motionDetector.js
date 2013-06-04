//© John Allsopp (@johnallsopp) 2013
//http://wwebdirections.org

//motion detector uses window.DeviceMotionEvent to detect whether the device is in motion
//if DeviceMotionEvent is not supported, uses DeviceOrientationEvent

//call motionDetector.start with a callback function as the argument to start the motion detector
//call motionDetector.end to stop

var motionDetector = {
	
	motionInterval: 300, //interval in ms between motion events (we don't want to respond to every event, drains batteries)
	lastMotionEvent: 0, // as yet we've had none, keeps track of when we had the last motion event
	callback: null, //a callback function to be called when a shake is detected. pass this in the .start function
	lastBeta: 0, //the last beta reading
	lastGamma: 0, //the last gamma reading
	noDetectionCallback: null, //a function to be called if there's no support for device motion or orientation
	 
	start: function(callbackFunction){
		//start the motionDetector	
		//pass a function as the argument to be called when motion is detected
				
		motionDetector.callback = callbackFunction //install the callback you want called to respond to device movement
		
		if (window.DeviceMotionEvent) {
			//devicemotion is a better way to detect motion, so we listen for this if it is supported
			//Desktop FFox 18+ reports support, but doesn't actually listen
			window.addEventListener('devicemotion', motionDetector.motionHandler, false)
		}
		
		else if (window.DeviceOrientationEvent) {
			//Chrome Desktop supports orientaton events but not motion events at least as far as in v29
			//only where the device has accelerometers (for exmple MacBook Pro but *not* MacBook Air)
			window.addEventListener('deviceorientation', motionDetector.orientationHandler, false)
		}
		
		else {
			//call a callback if it's been installed
			if (motionDetector.noDetectionCallback) {
				motionDetector.noDetectionCallback()
			}
			
		}

	},
	
	stop: function(){
		//stop the motionDetector	
		window.removeEventListener('deviceorientation', motionDetector.orientationHandler, false)		
		window.removeEventListener('devicemotion', motionDetector.motionHandler, false)		
	},
	
	checkMotionUsingMotion: function(motionData){
		//this checks whether the device is moving 
		//it's called by the devicemotion event listener
		
		//motionData is the deviceMotionEvent received by the event listener
		
		//algorithm shamelessly ripped off from 
		//http://stackoverflow.com/questions/8310250/how-to-count-steps-using-an-accelerometer

		var threshold = 1.2; //we can calibrate sentivity to motion, the lower the more sensitive 
		var inMotion = false; //this will be true if the device is in motion
		
		var acX = Math.abs(motionData.acceleration.x)
		var acY = Math.abs(motionData.acceleration.y)
		var acZ = Math.abs(motionData.acceleration.z)
		
		if ((acX > threshold) || (acY > threshold) || (acZ > threshold)) {
			inMotion = true
		}
		
		if (inMotion) {
			//call the callback
			if (motionDetector.callback) {
				motionDetector.callback()
			}
		}		
	},
	
	checkMotionUsingOrientation: function(orientationData){
		//detect motion using change in orientation
		 
		var threshold = .7; //sensitivity, the lower the more sensitive
		var inMotion = false;
		
		var betaChange = Math.abs(orientationData.beta - motionDetector.lastBeta) //change in beta since last orientation event
		var gammaChange = Math.abs(orientationData.gamma - motionDetector.lastGamma) //change in gamma since last orientation event
				
		inMotion = (betaChange >= threshold ) || (gammaChange >= threshold)
		//if the change is greater than the threshold in either beta or gamma, we've moved 

		if (inMotion) {
			//call the callback
			if (motionDetector.callback) {
				motionDetector.callback()
			}
		}
		
		motionDetector.lastBeta = orientationData.beta;
		motionDetector.lastGamma = orientationData.gamma;
		//now we remember the most recent beta and gamma readings for comparing the next time
			
	},
	
	orientationHandler: function (orientationData){
		//an event handler for the deviceOrientation event
		
		var today = new Date();
		//we don't want to execute this everytime we get an event, as they are far too frequent
		//so we throttle based on the value of motionDetector.motionInterval

		if((today.getTime() - motionDetector.lastMotionEvent) > motionDetector.motionInterval){	
			motionDetector.checkMotionUsingOrientation(orientationData)
			motionDetector.lastMotionEvent = today.getTime()
		}
	},

	motionHandler: function (motionData){
		//an event handler for the deviceOrientation event
		
		var today = new Date();
		//we don't want to execute this everytime we get an event, as they are far too frequent
		//do we throttle based on the value of motionDetector.motionInterval

		if((today.getTime() - motionDetector.lastMotionEvent) > motionDetector.motionInterval){	
			motionDetector.checkMotionUsingMotion(motionData)
			motionDetector.lastMotionEvent = today.getTime()
		}
	}

}