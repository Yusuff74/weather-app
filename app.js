// // // const date = new Date();
// // // console.log(date)
// // // const options = { 
// // //     weekday: 'long',
// // //     year: 'numeric',
// // //     month: 'long',
// // //     day: 'numeric'
// // //   };
  
// // // const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
// // // console.log(formattedDate); // Output: "Tuesday" (or the current day of the week)

// // // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// // // console.log(timeZone); // Output: "America/New_York" (or the current user's time zone)
const cityName = document.getElementById('city-name')
const city = document.getElementById('city')
const weatherIcon = document.querySelector('.weather-icon')
const weekCard = document.querySelector('.week-card')
const dayCardTemplate = document.querySelector('.day-card-template')

const getCityData = (city) => {
  const API_key = '91dc777c8ffb82365d42aaa332675181'
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`
  fetch(url)
  .then(Response => Response.json())
  .then(data => {
    console.log(data)
    getData(data)
    console.log(getData(data))
  })
}


const getData = (data) => {
  const lat = data.coord.lat
  const lon = data.coord.lon
  getWeatherData(lat, lon)
}


const getWeatherData = (lat, lon) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,precipitation_sum,precipitation_probability_max,windspeed_10m_max&current_weather=true&timeformat=unixtime&timezone=auto`
  fetch(url)
  .then(Response => Response.json())
  .then(Data => {
    console.log(Data)
    console.log(parseDailyWeather(Data))
    console.log(parseHourlyWeather(Data))
    
    const weatherInfo = {
      current: renderCurrentWeather(Data),
      daily: parseDailyWeather(Data),
      hourly: parseHourlyWeather(Data)
    }
    renderHourlyWeather(weatherInfo.hourly)
  console.log(renderDailyWeather(weatherInfo.daily))
  })
}



const getCityName =  cityName.onclick = () => {
  cityText = city.value
  getCityData(cityText)
}

const ICON_MAP = new Map()

const addMapping = (values, icon) => {
  values.forEach(value => {
    ICON_MAP.set(value, icon)
  })
}

addMapping([0, 1], "sun")
addMapping([2], "cloud-sun")
addMapping([3], "cloud")
addMapping([45, 48], "smog")
addMapping(
  [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
  "cloud-showers-heavy"
)
addMapping([71, 73, 75, 77, 85, 86], "snowflake")
addMapping([95, 96, 99], "cloud-bolt")

const getIconUrl = (iconCode) => {
  return `images/${ICON_MAP.get(iconCode)}.svg`
}

const renderCurrentWeather = (daily) =>{
  const currentIcon = document.querySelector('.weather-icon')
  currentIcon.src = getIconUrl(daily.current_weather.weathercode)
  document.querySelector('.cur-temp').textContent = Math.round(daily.current_weather.temperature)
  document.querySelector('.current-temp-high').textContent = Math.round(daily.daily.temperature_2m_max[0])
  document.querySelector('.current-temp-low').textContent = Math.round(daily.current_weather.temperature)
  document.querySelector('.current-temp-wind').textContent = Math.ceil(daily.current_weather.windspeed)
  document.querySelector('.current-temp-hum').textContent = Math.round(daily.hourly.relativehumidity_2m[0])
  document.querySelector('.current-temp-precip').textContent = Math.round(daily.daily.precipitation_sum[0])
}

const parseDailyWeather = (times) => {
  return times.daily.time.map((time, index)=>{
    return {
      timeStamp: time * 1000,
      temp: Math.round(times.daily.temperature_2m_max[index]),
      iconCode: times.daily.weathercode[index]
    }
  })
}

const dayFormatter = new Intl.DateTimeFormat(undefined, {weekday: 'long'})

const renderDailyWeather = (daily) => {
  weekCard.innerHTML = ''
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true)
    element.querySelector('.weather-day-icon').src = getIconUrl(day.iconCode)
    element.getElementById('day-template').textContent = dayFormatter.format(day.timeStamp)
    element.getElementById('temp-template').textContent = day.temp

    weekCard.appendChild(element)
  });
}

const parseHourlyWeather = (hour) => {
  return hour.hourly.time
    .map((time, index) => {
      return {
        timestamp: time * 1000,
        iconCode: hour.hourly.weathercode[index],
        temp: Math.round(hour.hourly.temperature_2m[index]),
        humidity: Math.round(hour.hourly.relativehumidity_2m[index]),
        windSpeed: Math.round(hour.hourly.windspeed_10m[index]),
        precip: Math.round(hour.hourly.precipitation[index] * 100) / 100,
      }
    })
    .filter(({ timestamp }) => timestamp >= hour.current_weather.time * 1000)
}

const setValue = (selector, value, { parent = document } = {}) => {
  parent.querySelector(`[data-${selector}]`).textContent = value
}

const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" })
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")
const renderHourlyWeather = (hourly) => {
  hourlySection.innerHTML = ""
  hourly.forEach(hour => {
    const element = hourRowTemplate.content.cloneNode(true)
    setValue("temp", hour.temp, { parent: element })
    setValue("Humidity", hour.humidity, { parent: element })
    setValue("wind", hour.windSpeed, { parent: element })
    setValue("precip", hour.precip, { parent: element })
    setValue("day", dayFormatter.format(hour.timestamp), { parent: element })
    setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode)
    hourlySection.append(element)
  })
}
