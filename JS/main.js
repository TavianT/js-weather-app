"use strict";
class App {
    constructor() {}
    start(){
        if (navigator.geolocation) {
            let currentWeather = navigator.geolocation.getCurrentPosition(this.getWeatherFromCoords, this.showError);
            console.log(currentWeather);
            document.getElementById("weather").innerText = Math.floor(Number(currentWeather));
        }
    }
    
    getWeatherFromCoords(position) {
        let res = 0;
        let req = "http://api.openweathermap.org/data/2.5/weather?lat="+position.coords.latitude+"&lon="+position.coords.longitude+"&appid=8f5e7b12e6cc251e84a440925910f743&units=metric";
        axios.get(req)
        .then(function (response){
            console.log(response.data)
            res = response.data.main.temp;
        })
        .catch(function(error){
            console.error(error);
        })
        return res;
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