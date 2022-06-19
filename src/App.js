import styled from "@emotion/styled";
import { ThemeProvider } from '@emotion/react'
import { ReactComponent as DayCloudyIcon } from "./images/day-cloudy.svg";
import { ReactComponent as RainIcon } from "./images/rain.svg";
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg'
import { ReactComponent as RefreshIcon } from './images/refresh.svg'
import { ReactComponent as LoadingIcon } from './images/loading.svg'
import { useState, useEffect } from "react";
import { formatTime } from './commons/helper'

// css
const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#ffffff',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};



const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
  border-radius:3%
`;

const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const DayCloudy = styled(DayCloudyIcon)`
  flex-basis: 30%;
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};
  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    /* STEP 2：使用 rotate 動畫效果在 svg 圖示上 */
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')};.
  }
  /* STEP 1：定義旋轉的動畫效果，並取名為 rotate */
  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
`;

const AUTHORIZATION_KEY = 'CWB-C03223CF-F9F4-43BE-B863-696E611185B0'
const LOCATION_NAME = '臺北'



function App() {

  const [currentTheme, setCurrentTheme] = useState('light')
  const [currentElement, setCurrentElement] = useState({
    locationName: '',
    description: '',
    rainPossibility: 0,
    temperature: 0,
    windSpeed: 0,
    observationTime: new Date(),
    isLoading: true,
    comfortability: '',
    weatherCode: 0,
  })

  // 解構賦值
  const { observationTime, locationName, description, windSpeed, temperature, rainPossibility, isLoading } = currentElement;

  useEffect(() => { fetchCurrentWeather(); fetchWeatherForecast() }, [])


  // fetch API
  const fetchCurrentWeather = () => {
    setCurrentElement(prevState => {
      return { ...prevState, isLoading: true }
    })
    fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&format=JSON&locationName=${LOCATION_NAME}`)
      .then(res => res.json()).then(data => {
        // STEP 1：取資料
        const locationData = data.records.location[0];
        // STEP 2：過濾資料
        const weatherElements = locationData.weatherElement.reduce((prev, curr) => {
          // 判斷陣列內有無 'WDSD', 'TEMP' 
          if (['WDSD', 'TEMP'].includes(curr.elementName)) { prev[curr.elementName] = curr.elementValue; }
          return prev;
        }, {})
        // console.log(weatherElements)   {WDSD: '3.50', TEMP: '23.70'}
        // STEP 2：更新資料
        setCurrentElement(prevState => ({
          ...prevState,
          locationName: locationData.locationName,
          windSpeed: weatherElements.WDSD,
          temperature: weatherElements.TEMP,
          observationTime: locationData.time.obsTime,
          isLoading: false

        }))
      })

  }

  const fetchWeatherForecast = () => {

    fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}`)
      .then(res => res.json()).then(data => {

        // 取某縣市的資料
        const locationData = data.records.location[0]
        const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
          // 只保留 'Wx','PoP','CI' 
          if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {

            neededElements[item.elementName] = item.time[0].parameter
          }
          return neededElements
        })

        console.log(weatherElements);
        setCurrentElement(prevState => ({
          ...prevState,
          description: weatherElements.CI.parameterName,

          rainPossibility: weatherElements.PoP.parameterName,
        }))
      })
  }


  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container >
        {/* {console.log('render, isLoading', isLoading)} */}
        <WeatherCard>
          <Location>{locationName}</Location>
          <Description>{description}</Description>
          <CurrentWeather>
            <Temperature>{Math.round(temperature)}<Celsius>°C</Celsius></Temperature>
            <DayCloudyIcon />
          </CurrentWeather>
          <AirFlow>
            <AirFlowIcon />{windSpeed} m/h
          </AirFlow>
          <Rain>
            <RainIcon />{rainPossibility}%
          </Rain>
          <Refresh onClick={fetchCurrentWeather} isLoading={isLoading}>
            最後觀測資料：{formatTime(observationTime)}
            {isLoading ? <LoadingIcon /> : <RefreshIcon />}
          </Refresh>
        </WeatherCard>
      </Container>
    </ThemeProvider>
  );
}

export default App;