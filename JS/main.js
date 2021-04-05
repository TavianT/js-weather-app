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
        let i = 0;
        this.currentWeatherContainerDisplay.style.display = "none";
        document.getElementById("searchContainer").style.marginBottom = "10px"
        this.searchedWeatherContainerDisplay.innerHTML = '';
        this.updateHeader(location);
        for (const day of dailyWeather) {
            if (i == dailyWeather.length - 1) {
                break;
            }
            i++;
            console.log(day);
            let dateString = this.getDate(day.dt);
            let div = document.createElement("div");
            div.appendChild(this.createWeatherElement("h4", dateString));
            div.appendChild(this.createWeatherElement("h5", day.weather[0].description));
            div.appendChild(this.createWeatherImg(day.weather[0].icon));
            div.appendChild(this.createWeatherElement("p", day.temp.day + '\xB0 Celsius'));
            div.appendChild(this.createWeatherElement("p", "Humidity: " + day.humidity));
            div.appendChild(this.createWeatherElement("p", day.wind_speed + " mph"));
            //div.appendChild(this.createWeatherElement(day))
            this.searchedWeatherContainerDisplay.appendChild(div);
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

    createWeatherElement(tag, data) {
        let element = document.createElement(tag);
        element.appendChild(document.createTextNode(data));
        return element;
    }
    createWeatherImg(data) {
        let element = document.createElement("img");
        element.src = "http://openweathermap.org/img/wn/" + data + "@2x.png";
        return element;
    }
    getDate(unixDate) {
        let date = new Date(unixDate * 1000); //JS works in ms
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let day = date.getDate()
        let ordinal = "" //either st, nd, rd, th
        switch (day) {
            case 1:
            case 21:
            case 31:
                ordinal = "st";
                break;
            case 2:
            case 22:
                ordinal = "nd";
            case 3:
            case 23:
                ordinal = "rd";
            default:
                ordinal = "th";
                break;
        }
        console.log("day: " + day);
        let month = months[date.getMonth()];
        console.log("month: " + month);
        return String(day + ordinal + " " + month);
    }

};

let app = new App();
app.start()