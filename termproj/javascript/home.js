
var HomePage = function(){
    this.div = $('#homePage');
    this.zipcodeTxt = "";
    this.load();
}

HomePage.prototype.load = function() {
    
    if(!navigator.geolocation) {
        navigator.geolocation = {};
    }
    if(!navigator.geolocation.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition = this.handleNoGeolocation();
    }
    navigator.geolocation.getCurrentPosition(this.getZipcode);
    $("#zipcodeTxt").val(this.zipcodeTxt);
}

HomePage.prototype.handleNoGeolocation = function() {
	//Check if anything in local storage. Else, leave blank.



	this.zipcodeTxt = "";
}

HomePage.prototype.getZipcode(position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	
	//set up google maps api
	loadGoogleMapScript();
	

}

/*Load the Google Map API V3. Calls initializeGMScript after using "callback"
*/
function loadGoogleMapScript() {
    var gmScript = document.createElement("script");
    gmScript.type = "text/javascript";
    gmScript.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyCZGQVJhejmgfv4TdZJ1M0U4JXKweG4Bng&sensor=true&callback=initializeGMScript";
    document.body.appendChild(gmScript);
}

/*Function called once google api is loaded*/
function initializeGMScript() {

}