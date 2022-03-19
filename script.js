const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const API_key = '32c294b9724dd792e39e2f3e9f4016a4';

let dt = new Date();
// console.log(dt);

// This function will be called every one sec.
funcID = setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const year = time.getFullYear();
    const hour = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const _hours = (hour > 12) ? hour % 12 : hour;
    const ampm = (hour > 12) ? 'PM' : 'AM';
    timeEl.innerHTML = ((_hours < 10) ? ('0' + _hours) : _hours) + ':' + ((minutes < 10) ? ('0' + minutes) : minutes) + ' ' + `<span class="seconds">${((seconds < 10) ? ('0' + seconds) : seconds)}</><span id="am-pm">${ampm}</span>`;
    dateEl.innerHTML = days[day] + ', ' + months[month] + ' ' + date + ', ' + year;
}, 1000);

getWeatherData();
getCityWeatherData();
document.querySelector('.search-button').addEventListener('click', () => { search() });
document.querySelector('.search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        search();
    }
});

function getWeatherData() {
    navigator.geolocation.getCurrentPosition((success) => {
        // console.log(success);
        let { latitude, longitude } = success.coords;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&exclude=hourly,minutely&appid=${API_key}`).then(res => res.json()).then(data => {
            // console.log(data);
            showWeatherData(data);
        });
    });
}

function getCityWeatherData(city) {
    if (city === 'Current Location') getWeatherData();
    // console.log('Executing getCityWeatherData');
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`).then(resp => resp.json()).then(success => {
        // console.log('success is ',success);
        let { lat , lon } = success.coord;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=hourly,minutely&appid=${API_key}`).then(res => res.json()).then(data => {
            console.log(data);
            showWeatherData(data);
            updatedatetime(data);
        });
    });
}

function updatedatetime(data) {
    clearInterval(funcID);
    let timoff = data.timezone_offset;
    // console.log(timoff);
    // console.log(time);
    funcID = setInterval(() => {
        time = calcTime(timoff);
        const month = time.getMonth();
        const date = time.getDate();
        const day = time.getDay();
        const year = time.getFullYear();
        const hour = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const _hours = (hour > 12) ? hour % 12 : hour;
        const ampm = (hour > 12) ? 'PM' : 'AM';
        timeEl.innerHTML = ((_hours < 10) ? ('0' + _hours) : _hours) + ':' + ((minutes < 10) ? ('0' + minutes) : minutes) + ' ' + `<span class="seconds">${((seconds < 10) ? ('0' + seconds) : seconds)}</><span id="am-pm">${ampm}</span>`;
        dateEl.innerHTML = days[day] + ', ' + months[month] + ' ' + date + ', ' + year;
    }, 1000);
}

function showWeatherData(data) {
    let { humidity, pressure, sunrise, sunset, wind_speed } = data.current;

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = `${data.lat} N ${data.lon} E`;

    currentWeatherItemsEl.innerHTML =
        `<div class="weather-item">
            <div>Humidity</div>
            <div>${humidity} %</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${pressure} Pa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${wind_speed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${window.moment(sunrise*1000).format('hh:mm a')}</div>
        </div>
        <div class="weather-item">
            <div>Sunset</div>
            <div>${window.moment(sunset*1000).format('hh:mm a') }</div>
        </div>`;
    
    let otherDayForecast = '';
    data.daily.forEach((day, idx) => {
        if (idx == 7) return false;
        if (idx != 0) {
            otherDayForecast +=
                `<div class="weather-forecast-item">
                <div class="day">${window.moment(day.dt * 1000).format('dddd')}</div>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="icon">
                <div class="temp">Night - ${day.temp.night}&#176; C</div>
                <div class="temp">Day - ${day.temp.day}&#176; C</div>
                </div>`;
        }
        else {
            currentTempEl.innerHTML = `<img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="icon">
                <div class="other">
                    <div class="day">${window.moment(day.dt * 1000).format('dddd')}</div>
                    <div class="temp">Night - ${day.temp.night}&#176; C</div>
                    <div class="temp">Day - ${day.temp.day}&#176; C</div>
                </div> `
        }
    });
    weatherForecastEl.innerHTML = otherDayForecast;
}

function search() {
    getCityWeatherData(document.querySelector('.search').value);
    document.querySelector('.search').value = '';
    const html = `<button class="new-button" onClick="remove()">Get back to Current Location</button>`;
    // Grab the element containing your "two" class
    var isthere = document.querySelector('.new-button');
    // console.log(isthere);
    if (isthere === null) {
        const two = document.querySelector('.searchbar');
        two.insertAdjacentHTML('afterend', html);
    }
}

function remove() {
    // console.log('remove is executing');
    const two = document.querySelector('.new-button');
    two.remove();
    getWeatherData();
    clearInterval(funcID);
    funcID = setInterval(() => {
        time = new Date();
        const month = time.getMonth();
        const date = time.getDate();
        const day = time.getDay();
        const year = time.getFullYear();
        const hour = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const _hours = (hour > 12) ? hour % 12 : hour;
        const ampm = (hour > 12) ? 'PM' : 'AM';
        timeEl.innerHTML = ((_hours < 10) ? ('0' + _hours) : _hours) + ':' + ((minutes < 10) ? ('0' + minutes) : minutes) + ' ' + `<span class="seconds">${((seconds < 10) ? ('0' + seconds) : seconds)}</><span id="am-pm">${ampm}</span>`;
        dateEl.innerHTML = days[day] + ', ' + months[month] + ' ' + date + ', ' + year;
    }, 1000);
}

function calcTime(offset) {
    d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    nd = new Date(utc + (1000 * offset));
    return nd;
}