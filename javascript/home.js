
var HomePage = function(){
    this.div = $('#homePage');
    this.zipcodeTxt = "test";
    this.latlng;
    this.load();
}

HomePage.prototype.load = function() {
    
    if(!navigator.geolocation) {
        navigator.geolocation = {};
    }
    if(!navigator.geolocation.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition = this.handleNoGeolocation;
    }
    navigator.geolocation.getCurrentPosition(
    	this.getZipcode.bind(this), this.handleNoGeolocation.bind(this));

    //trigger search btn click on "enter" key
    $("#zipcodeTxt").keyup(function(e) {
        if (e.which === 13) {
            this.loadZipcodeSearch.bind(this);
        }
    }.bind(this));

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
    $("#zipcodeTxt").val(this.zipcodeTxt);



}

HomePage.prototype.getZipcode = function(position) {
	console.log("has geolocation, getting current location");
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;

	var geocoder = new google.maps.Geocoder();
	this.latlng = new google.maps.LatLng(lat, lng);

	geocoder.geocode({'latLng':this.latlng}, function(results, status) {
		if(status !== google.maps.GeocoderStatus.OK) {
			this.handleNoGeolocation();
			return;
		}

		var addrcomp = results[0].address_components;

        for(var i = 0; i < addrcomp.length; i++){
            if(addrcomp[i].types.indexOf("postal_code") > -1) {
                this.zipcodeTxt = addrcomp[i].short_name;
    			$("#zipcodeTxt").val(this.zipcodeTxt);
            	return;
            }
        }

	}.bind(this));


}


