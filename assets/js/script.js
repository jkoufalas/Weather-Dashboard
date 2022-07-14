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
    cityName = $( "#citySearch" ).val().trim();
    //if no input, then flag as such
    if(!cityName.length){
      //alert('No entry');
      $('#noEntry').modal('show');
      return;
    }

    //this portion makes the first letter of each work uppercase so that the search will find them
    var temp = cityName.split(' ');
      cityName = '';
      for(var i = 0; i<temp.length;i++){
        var temp1 = temp[i].split('');
        temp1[0] = temp1[0].toUpperCase();
        cityName = cityName + ' ' + temp1.join('');
      }
      cityName = cityName.trim();
    getCityLocation(cityName);
};

//when a user selects a previous search button
var buttonClickHistory = function (event) {
  //get the attribute from the buttons parent
  var searchHistoryAttr = event.target.parentElement.getAttribute('name');
  //only ensuring that a button in the area with a name attribute can proceed
  if (searchHistoryAttr) {
    cityName = searchHistoryAttr;
    //get location to display
    getCityLocation(cityName);
  }
};


var getCityLocation = function (name) {
  var appID = '84e2a935f8a48c606fa12412a6f8a2d6';
  var apiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + name + '&appid='+appID;
  
  //get city lat long from name
  fetch(apiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    if(!data[0].length){
      if (name === data[0].name){
        //set lat long data from fetch
        lat = data[0].lat;
        long = data[0].lon;
        //add the search to history
        addToHistory(name);
        //get the forcast for the city lat long
        getWeather();
        
      }else{
        //if the name doesnt match that queried
        $('#cityDNE').modal('show');
        return;
      }
    }else{
      //if the search for a city resulted in no matches from the fetch
      $('#cityDNE').modal('show');
    }
  });
};

var getWeather = function(){
  var appID = '84e2a935f8a48c606fa12412a6f8a2d6';
  var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon='+long+'&units=metric&appid='+appID;

  //get weather from city
  fetch(apiUrl)
  .then(function (response) {
    return response.json().then(function (data) {
      var date = moment().format("DD-MM-YYYY");
      var weatherArr5day = [];
      if (response.ok) {
        //setup todays forcast object
        todayForcast = {
          date: moment().format("DD/MM/YYYY"),
          icon: data.current.weather[0].icon,
          temp: data.current.temp,
          wind: data.current.wind_speed,
          humidity: data.current.humidity,
          uv: data.current.uvi
        };
        //add 5 day forcast to array 
        for(var i =0;i<5;i++){
          var dayForcast = {
          date: moment().add(i+1, 'days').format("DD/MM/YYYY"),
          icon: data.daily[i].weather[0].icon,
          temp: data.daily[i].temp.max,
          wind: data.daily[i].wind_speed,
          humidity: data.daily[i].humidity
          };
          //add day object to 5 day array
          weatherArr5day.push(dayForcast);
        }
        //process results of fetch
        processWeather(weatherArr5day);
      }
    })
  });

};

var processWeather = function (weatherArr5day){
  //reset/empty forcast cards
  forcastList.empty();

  //update page with todays forcast in jumbotron
  todayCityItm.innerHTML = cityName + ' ' + todayForcast.date + ' <div id="icon" style="display: inline"><img id="wicon" src="https://openweathermap.org/img/w/' + todayForcast.icon + '.png" alt="Weather icon"></div>';
  todayTempItm.textContent = 'Temp: ' + todayForcast.temp + '°C';
  todayWindItm.textContent = 'Wind: ' + todayForcast.wind + ' KPH';
  todayHumidityItm.textContent = 'Humidity: ' + todayForcast.humidity + ' %';
  todayUVItmVal.text(todayForcast.uv);
  //this figures out the colour of the box for the level of UV index
  todayUVItmVal.removeClass();
  if(todayForcast.uv < 2){
    todayUVItmVal.addClass('uv_low px-2 py-1 rounded');
  }else if (todayForcast.uv < 6){
    todayUVItmVal.addClass('uv_medium px-2 py-1 rounded');
  }else{
    todayUVItmVal.addClass('uv_high px-2 py-1 rounded');
  }
  
  //this part updates the 5 day forcast cards
  for(var i = 0;i < weatherArr5day.length;i++){
    
    //creates the card
    var containerList = document.createElement("div");

    //sets up the text to add to each card
    var printDate = weatherArr5day[i].date;
    var printIcon = '<div id="icon"><img id="wicon" src="https://openweathermap.org/img/w/' + weatherArr5day[i].icon + '.png" alt="Weather icon"></div>';
    var printTemp = "Temp: " + weatherArr5day[i].temp+ '°C';
    var printWind = "Wind: " + weatherArr5day[i].wind + ' KPH';
    var printHumidity = "Humidity: " + weatherArr5day[i].humidity + ' %';

    //styles the card
    containerList.classList.add('card', 'text-white', 'bg-primary', 'col-md', 'ml-3', 'mt-3', 'p-1');

    //creates the card body
    var cardBody = document.createElement("div");

    //card title
    var cardTitle = document.createElement("h5");
    cardTitle.textContent = printDate;
    cardTitle.classList.add('card-title');

    //weather icon
    var cardIcon = document.createElement("h6");
    cardIcon.classList.add('justify-content-left');
    cardIcon.innerHTML = printIcon;

    //temperature
    var cardTemp = document.createElement("h6");
    cardTemp.classList.add('justify-content-left', 'lh-2');
    cardTemp.textContent = printTemp;

    //wind speed
    var cardWind = document.createElement("h6");
    cardWind.classList.add('justify-content-left', 'lh-2');
    cardWind.textContent = printWind;

    //humidity
    var cardHumidity = document.createElement("h6");
    cardHumidity.classList.add('justify-content-left', 'lh-2');
    cardHumidity.textContent = printHumidity;

    //adds structure to card
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardIcon);
    cardBody.appendChild(cardTemp);
    cardBody.appendChild(cardWind);
    cardBody.appendChild(cardHumidity);
    containerList.appendChild(cardBody);

    //adds card to DOM
    forcastList.append(containerList);
    
  };
  //all data setup, now reset cityName for next search
  cityName = '';
  
  //show the forcast area after all info created
  forcastSectionBlock.show();



};

//add city name to search area buttons
var addToHistory = function (cityName){
  //this block sets up test to see if city is already part of the search list
  var uniqueName = true;
  searchHistoryListjQ.children()
    .each(function () {
      if($(this).attr("name") === cityName){
        uniqueName = false;
      }
    });


//if the city is already part of the search list then return and dont add
if(!uniqueName){
  return;
}

  //create list element to hold button
  var li = document.createElement("li");
  li.setAttribute("name", cityName);
  li.classList.add('d-flex', 'align-items-center', 'pt-1');
  
  // create button
  var button = document.createElement("button");
  // populate the buttons text with the option
  button.textContent = cityName;
  button.classList.add('btn', 'btn-secondary', 'btn-block');

  //add button to list element
  li.appendChild(button);
  //add list element to search area DOM
  searchHistoryList.appendChild(li);

  //maintain list of city names 
  searchHistoryLocalStorageList.push(cityName);
  //update local storage with city name history
  localStorage.setItem("searchHistory", JSON.stringify(searchHistoryLocalStorageList));

}

//search listner
submitEl.addEventListener("submit", submitSearch); 
//listener from history
searchHistoryList.addEventListener('click', buttonClickHistory);


init();
