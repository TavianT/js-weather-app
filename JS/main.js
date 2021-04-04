"use strict";
class WeatherCall{
    constructor(api,lat,long,exclude="current,minutely,hourly,alerts") {
        this.api = api;
        this.lat = lat;
        this.long = long;
        this.exclude = exclude;
    }
}
class App {
    constructor() {
        this.searchBar = document.getElementById("searchBar");
        this.weatherList = document.getElementById("fiveDayWeatherList");
        this.searchForm = document.getElementById("searchForm");
        this.currentWeatherContainerDisplay =  document.getElementById("currentWeatherContainer");
        this.searchedWeatherContainerDisplay = document.getElementById("searchedWeatherContainer");
        this.searchStr = "";
        this.searchBar.addEventListener("keyup", (e) =>{
            this.searchStr = e.target.value;
        });
    }
    async start(){
        if (navigator.geolocation) {
            let currentLocation = await this.getPosition();
            let curWeatherCall = new WeatherCall("weather",currentLocation.coords.latitude,currentLocation.coords.longitude);
            let currentWeather = await this.getWeatherFromCoords(curWeatherCall, false);
            const msToMph = 2.237;
            document.getElementById("location").innerText = currentWeather.name;
            document.getElementById("weather").innerText = currentWeather.weather[0].description
            document.getElementById("icon").src =  "http://openweathermap.org/img/wn/" + currentWeather.weather[0].icon + "@2x.png"
            document.getElementById("temp").innerText = Math.floor(Number(currentWeather.main.temp)) + '\xB0 Celsius';
            document.getElementById("humidity").innerText = "Humidity: " + currentWeather.main.humidity
            document.getElementById("wind").innerText = "Wind: " + Number(currentWeather.wind.speed * msToMph).toFixed(2) + " mph";
            this.currentWeatherContainerDisplay.style.display = "block";
        }
    }

    getPosition() {
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej)
        });
    }
    
    getWeatherFromCoords(weatherCall, exclude) {
        let req = "http://api.openweathermap.org/data/2.5/"+ weatherCall.api + "?lat=" + weatherCall.lat + "&lon=" + weatherCall.long + "&appid=" + config.openweathermap + "&units=metric";
        if (exclude) {
            req += "&exclude=" + weatherCall.exclude;
        }
        return axios.get(req).then(response => response.data)

    }
    showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
              alert("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              alert("The request to get user location timed out.");
              break;
            case error.UNKNOWN_ERROR:
              alert("An unknown error occurred.");
              break;
          }
    }

    async submitSearch() {
        let formattedSearch = this.formatSearch(this.searchStr);
        let res = await this.getCoordsFromLocation(formattedSearch);
        console.log(res);
        //TODO: Get location name from res here anmd pass to update display
        let formattedLocation = res.results[0].formatted_address;
        let oneWeatherCall = new WeatherCall("onecall", res.results[0].geometry.location.lat, res.results[0].geometry.location.lng);
        let weather = await this.getWeatherFromCoords(oneWeatherCall, true);
        //console.log(weather);
        this.updateDisplayWithWeather(weather.daily, formattedLocation);
    }

    formatSearch(str) {
        return encodeURIComponent(str.trim());
    }

    getCoordsFromLocation(location) {
        let req = "https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key="+config.google;
        return axios.get(req).then(response => response.data)
    }

    updateDisplayWithWeather(dailyWeather, location) {
        this.currentWeatherContainerDisplay.style.display = "none";
        document.getElementById("searchContainer").style.marginBottom = "10px"
        this.updateHeader(location);
        for (const day of dailyWeather) {
            console.log(day);
        }
    }

    updateHeader(location){
        let oldLocation = document.getElementById("searchedLocation");
        if (typeof(oldLocation) != "undefined" && oldLocation != null) {
            oldLocation.remove();
        }
        let locationHeader = document.createElement("h4");
        locationHeader.appendChild(document.createTextNode(location));
        locationHeader.style.textAlign = "center"
        locationHeader.style.fontSize = "x-large";
        locationHeader.setAttribute("id", "searchedLocation");
        document.body.insertBefore(locationHeader, this.searchedWeatherContainerDisplay);
    }

};

let app = new App();
app.start()