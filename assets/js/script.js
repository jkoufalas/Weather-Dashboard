var searchHistoryList = document.querySelector("#search-History");
var searchHistoryListjQ = $('#search-History');

var submitEl = document.querySelector("#search-form");
var forcastList = $('#5dayForecast');
var todayForcastList = $('#todaysForecast');
var forcastSectionBlock = $('#forcastSection');

var todayCityItm = document.querySelector("#todayCity");
var todayTempItm = document.querySelector("#todayTemp");
var todayWindItm = document.querySelector("#todayWind");
var todayHumidityItm = document.querySelector("#todayHumidity");
var todayUVItm = document.querySelector("#todayUV");
var todayUVItmVal = $('#todayUV_value');

var lat;
var long;
var fromSearch;
var todayForcast;
var cityName;
var searchHistoryLocalStorageList = [];



var init = function (){
  //hide the initial results area as no city has yet been selected
  forcastSectionBlock.hide();

  //initialise the local storage
  searchHistoryLocalStorageList = [];
  var localStorageHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if(!!localStorageHistory){
    for (var currentSearch in localStorageHistory) {
      //get each city name from local storage and add to history button area
      currentVal = localStorageHistory[currentSearch];
      addToHistory(currentVal);
    }
  }
}

  function submitSearch(event) {
    event.preventDefault();
    //get user input
    cityName = $( "#citySearch" ).val();
    //if no input, then flag as such
    if(!cityName.length){
      //alert('No entry');
      $('#noEntry').modal('show');
      return;

    }
    var temp = cityName.split(' ');
    if (temp.length > 1){
      cityName = '';
      for(var i = 0; i<temp.length;i++){
        var temp1 = temp[i].split('');
        temp1[0] = temp1[0].toUpperCase();
        cityName = cityName + ' ' + temp1.join('');
      }
      cityName = cityName.trim();

    }else{
      temp = cityName.split('');
      temp[0] = temp[0].toUpperCase();
      cityName = temp.join('');
    }

    fromSearch = true;
    weatherArr5day = [];
 
    
    getCityLocation(cityName);
};

var buttonClickHistory = function (event) {
  var searchHistoryAttr = event.target.parentElement.getAttribute('name');

  if (searchHistoryAttr) {
    cityName = searchHistoryAttr;
    getCityLocation(cityName);
  }
};


var getCityLocation = function (name) {
  var appID = '84e2a935f8a48c606fa12412a6f8a2d6';
  var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + name + '&appid='+appID;
  

  fetch(apiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    if(!data[0].length){
      if (name === data[0].name){
        lat = data[0].lat;
        long = data[0].lon;
        if(fromSearch){
          addToHistory(name);
        };
        getWeather();
      }else{
        $('#cityDNE').modal('show');
        return;
      }
    }else{
      $('#cityDNE').modal('show');
    }
  });
};

var getWeather = function(){
  var appID = '84e2a935f8a48c606fa12412a6f8a2d6';
  var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon='+long+'&units=metric&appid='+appID;

  fetch(apiUrl)
  .then(function (response) {
    return response.json().then(function (data) {
      var date = moment().format("DD-MM-YYYY");
      var weatherArr5day = [];
      if (response.ok) {

        todayForcast = {
          date: moment().format("DD/MM/YYYY"),
          icon: data.current.weather[0].icon,
          temp: data.current.temp,
          wind: data.current.wind_speed,
          humidity: data.current.humidity,
          uv: data.current.uvi
        };
        for(var i =0;i<5;i++){
          var dayForcast = {
          date: moment().add(i+1, 'days').format("DD/MM/YYYY"),
          icon: data.daily[i].weather[0].icon,
          temp: data.daily[i].temp.max,
          wind: data.daily[i].wind_speed,
          humidity: data.daily[i].humidity
          };
          weatherArr5day.push(dayForcast);
        }
        processWeather(weatherArr5day);
      }
    })
  });

};

var processWeather = function (weatherArr5day){
  forcastList.empty();

  todayCityItm.innerHTML = cityName + ' ' + todayForcast.date + ' <div id="icon" style="display: inline"><img id="wicon" src="http://openweathermap.org/img/w/' + todayForcast.icon + '.png" alt="Weather icon"></div>';
  todayTempItm.textContent = 'Temp: ' + todayForcast.temp + '°C';
  todayWindItm.textContent = 'Wind: ' + todayForcast.wind + ' KPH';
  todayHumidityItm.textContent = 'Humidity: ' + todayForcast.humidity + ' %';
  todayUVItmVal.text(todayForcast.uv);
  todayUVItmVal.removeClass();
  if(todayForcast.uv < 2){
    todayUVItmVal.addClass('uv_low px-2 py-1 rounded');
  }else if (todayForcast.uv < 6){
    todayUVItmVal.addClass('uv_medium px-2 py-1 rounded');
  }else{
    todayUVItmVal.addClass('uv_high px-2 py-1 rounded');
  }
  
  
  

  for(var i = 0;i < weatherArr5day.length;i++){
    var containerList = document.createElement("div");
    var printDate = weatherArr5day[i].date;
    var printIcon = '<div id="icon"><img id="wicon" src="http://openweathermap.org/img/w/' + weatherArr5day[i].icon + '.png" alt="Weather icon"></div>';
    var printTemp = "Temp: " + weatherArr5day[i].temp+ '°C';
    var printWind = "Wind: " + weatherArr5day[i].wind + ' KPH';
    var printHumidity = "Humidity: " + weatherArr5day[i].humidity + ' %';

    containerList.classList.add('card', 'text-white', 'bg-primary', 'col-md', 'ml-3', 'mt-3', 'p-1');

    var cardBody = document.createElement("div");
    //cardBody.classList.add('card-body');

    var cardTitle = document.createElement("h5");
    cardTitle.textContent = printDate;
    cardTitle.classList.add('card-title');

    var cardIcon = document.createElement("h6");
    cardIcon.classList.add('justify-content-left');
    cardIcon.innerHTML = printIcon;

    var cardTemp = document.createElement("h6");
    cardTemp.classList.add('justify-content-left', 'lh-2');
    cardTemp.textContent = printTemp;

    var cardWind = document.createElement("h6");
    cardWind.classList.add('justify-content-left', 'lh-2');
    cardWind.textContent = printWind;

    var cardHumidity = document.createElement("h6");
    cardHumidity.classList.add('justify-content-left', 'lh-2');
    cardHumidity.textContent = printHumidity;

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardIcon);
    cardBody.appendChild(cardTemp);
    cardBody.appendChild(cardWind);
    cardBody.appendChild(cardHumidity);

    containerList.appendChild(cardBody);
    forcastList.append(containerList);
    forcastSectionBlock.show();
    cityName = '';
  };



};

var addToHistory = function (cityName){
  var uniqueName = true;
  searchHistoryListjQ.children()
    .each(function () {
      if($(this).attr("name") === cityName){
        uniqueName = false;
      }
    });


  
if(!uniqueName){
  return;
}

  var li = document.createElement("li");
  li.setAttribute("name", cityName);

  li.classList.add('d-flex', 'align-items-center', 'pt-1');
  // create button
  var button = document.createElement("button");
  // populate the buttons text with the option
  button.textContent = cityName;
  button.classList.add('btn', 'btn-secondary', 'btn-block');
  li.appendChild(button);
  searchHistoryList.appendChild(li);

  searchHistoryLocalStorageList.push(cityName);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistoryLocalStorageList));

}

submitEl.addEventListener("submit", submitSearch); 
searchHistoryList.addEventListener('click', buttonClickHistory);


init();
//0-2 gree <5 orange 
