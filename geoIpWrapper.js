/*
 * Wrapper around http://j.maxmind.com/app/geoip.js written by Ben Morse
 * GIT: https://github.com/esromneb/MaxMind-GeoIp-Wrapper/
 * License: BSD 3-Clause License
 *
 * Requires JQuery and Jquery cookie https://github.com/carhartl/jquery-cookie
 */


var GeoIpWrapper = function () {
    this.loc = {default:{}};
    this.loc.default.latitude = '37.5630';
    this.loc.default.longitude = '-122.3255';
    this.loc.latitude = this.loc.default.latitude;
    this.loc.longitude = this.loc.default.longitude;

};

GeoIpWrapper.prototype.callback = null;

GeoIpWrapper.prototype.start = function () {
    this.check_cookie();
};

GeoIpWrapper.prototype.geoip_latitude = function () {
    return this.loc.latitude;
};

GeoIpWrapper.prototype.geoip_longitude = function () {
    return this.loc.longitude;
};

GeoIpWrapper.prototype.clear_cookie = function () {
    var jquerycookiejsonsettings = $.cookie.json;
    $.cookie.json = true;

    $.cookie('geoIpWrapper', null, {path:'/'});

    // set back to defaults (thus must be done after removing the cookie, or else it will throw)
    $.cookie.json = jquerycookiejsonsettings;
}

GeoIpWrapper.prototype.check_cookie = function () {

    // our cookie requires special settings
    var jquerycookiejsonsettings = $.cookie.json;
    $.cookie.json = true;

    var c = null;
    try {
        c = $.cookie('geoIpWrapper');
    }
    catch (e) {
        console.log("exception when reading cookie: " + e);
    }


    // we don't have a cached location
    if( c == null )
    {
        this.load_js_file();
    }
    else
    {
        // Load data in from cookie
        this.loc.latitude = c.latitude;
        this.loc.longitude = c.longitude;

        // Callback
        if (typeof(this.callback) == 'function') {
            this.callback();
        }
    }

    // set back to defaults (thus must be done after removing the cookie, or else it will throw)
    $.cookie.json = jquerycookiejsonsettings;
};


GeoIpWrapper.prototype.set_cookie = function () {

    // our cookie requires special settings
    var jquerycookiejsonsettings = $.cookie.json;
    $.cookie.json = true;

    // Expire cookie in 1 hour
    var date = new Date();
    var minutes = 60;
    date.setTime(date.getTime() + (minutes * 60 * 1000));


    var c = null;
    try {
        $.cookie('geoIpWrapper', this.loc, {path:'/',expires: date});
    }
    catch (e) {
        console.log("exception when writing cookie: " + e);
    }

    // set back to defaults (thus must be done after removing the cookie, or else it will throw)
    $.cookie.json = jquerycookiejsonsettings;
};


// Load our ip from js file
GeoIpWrapper.prototype.load_js_file = function () {

    var thisCopy = this;

    var success = function (data, textStatus, jqxhr)
    {
//        console.log(data); //data returned
//        console.log(textStatus); //success
//        console.log(jqxhr.status); //200

        thisCopy.parse_js_file();
    };

    $.getScript('http://j.maxmind.com/app/geoip.js', success);
};


GeoIpWrapper.prototype.parse_js_file = function () {
    try
    {
        this.loc.latitude = geoip_latitude();
        this.loc.longitude = geoip_longitude();

        this.set_cookie();
    }
    catch (e) {
        console.log("exception calling functions after js file loaded: " + e);

        // set to default, but don't set cookie
        this.loc.latitude = this.loc.default.latitude;
        this.loc.longitude = this.loc.default.longitude;
    }

    // Callback
    if (typeof(this.callback) == 'function') {
        this.callback();
    }
};



// Define global variable here, if you want to use this elsewhere, you can
var GeoIP = new GeoIpWrapper();

// Uncomment this to test loading the location every time
// GeoIP.clear_cookie();









// http://j.maxmind.com/app/geoip.js loads a file in the following format
//
//function geoip_country_code() { return 'US'; }
//function geoip_country_name() { return 'United States'; }
//function geoip_city()         { return 'San Mateo'; }
//function geoip_region()       { return 'CA'; }
//function geoip_region_name()  { return 'California'; }
//function geoip_latitude()     { return '37.5630'; }
//function geoip_longitude()    { return '-122.3255'; }
//function geoip_postal_code()  { return ''; }
//function geoip_area_code()    { return '650'; }
//function geoip_metro_code()   { return '807'; }
