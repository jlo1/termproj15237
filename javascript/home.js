
var HomePage = function(){
    this.div = $('#homePage');
    this.zipcodeTxt = "";
    this.load();
}

HomePage.prototype.load = function() {
    /*
    if(!navigator.geolocation) {
        navigator.geolocation = {};
    }
    if(!navigator.geolocation.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition = this.handleNoGeolocation();
    }
    navigator.geolocation.getCurrentPosition(this.getZipcode);
*/
	this.handleNoGeolocation();
    $("#zipcodeTxt").val(this.zipcodeTxt);

    $("#zipcodeBtn").on(window.util.eventstr, this.loadZipcodeSearch.bind(this));

}

HomePage.prototype.loadZipcodeSearch = function () {
	this.zipcodeTxt = $("#zipcodeTxt").val();
	window.localStorage.localRootsZipcode = JSON.stringify(this.zipcodeTxt);
}


HomePage.prototype.handleNoGeolocation = function() {
	console.log("no geolocation");
	//Check if anything in local storage. Else, leave blank.
	if(typeof(window.localStorage)==="undefined") {
		this.zipcodeTxt = "";
		return;
	}
	if(typeof(window.localStorage.localRootsZipcode) === "undefined") {
		this.zipcodeTxt = "";
		return;
	}

	var lastZipCode = JSON.parse(window.localStorage.localRootsZipcode);
	if (lastZipCode !== "") {
		this.zipcodeTxt = lastZipCode;
	}


}

HomePage.prototype.getZipcode = function(position) {
	console.log("has geolocation, getting current location");
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;

	//set up google maps api
	loadGoogleMapScript();



}

/*Load the Google Map API V3. Calls initializeGMScript after using "callback"
*/
HomePage.prototype.loadGoogleMapScript = function() {
    var gmScript = document.createElement("script");
    gmScript.type = "text/javascript";
    gmScript.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyCZGQVJhejmgfv4TdZJ1M0U4JXKweG4Bng&sensor=true&callback=initializeGMScript";
    document.body.appendChild(gmScript);
}

/*Function called once google api is loaded*/
function initializeGMScript() {

}