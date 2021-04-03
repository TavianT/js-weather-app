"use strict";
class App {
    constructor() {
        this.searchBar = document.getElementById("searchBar");
        this.weatherList = document.getElementById("fiveDayWeatherList");
        this.searchStr = "";
        this.searchBar.addEventListener('keyup', (e) =>{
            this.searchStr = e.target.value;
            console.log(this.searchStr);
        });
    }
    async start(){
        if (navigator.geolocation) {
            let currentLocation = await this.getPosition();
            let currentWeather = await this.getWeatherFromCoords(currentLocation);
            console.log(currentWeather);
            const msToMph = 2.237;
            document.getElementById("location").innerText = currentWeather.name;
            document.getElementById("weather").innerText = currentWeather.weather[0].description
            document.getElementById("icon").src =  "http://openweathermap.org/img/wn/" + currentWeather.weather[0].icon + "@2x.png"
            document.getElementById("temp").innerText = Math.floor(Number(currentWeather.main.temp)) + '\xB0 Celsius';
            document.getElementById("humidity").innerText = "Humidity: " + currentWeather.main.humidity
            document.getElementById("wind").innerText = "Wind: " + Number(currentWeather.wind.speed * msToMph).toFixed(2) + " mph";
            document.getElementById("currentWeatherContainer").style.display = "block"
        }
    }

    getPosition() {
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej)
        });
    }
    
    getWeatherFromCoords(position) {
        let req = "http://api.openweathermap.org/data/2.5/weather?lat="+position.coords.latitude+"&lon="+position.coords.longitude+"&appid=8f5e7b12e6cc251e84a440925910f743&units=metric";
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


};

let app = new App();
app.start()