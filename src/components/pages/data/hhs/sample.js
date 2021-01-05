import React, { useState } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { DateTime } from 'luxon'
import { geoPath, geoAlbersUsa } from 'd3-geo'
import { Slider } from '@reach/slider'
import { BarChart } from '~components/charts/bar-chart'
import colors from '~scss/colors.module.scss'
import statesOutline from '~data/visualization/state-populations.json'
import hospitals from '~data/visualization/hhs-timeseries.json'
import style from './sample.module.scss'

const Chart = ({ activeDate, daily, dailyAverage }) => {
  return (
    <BarChart
      data={daily}
      lineData={dailyAverage}
      fill={colors.colorBlueberry200}
      lineColor={colors.colorBlueberry400}
      height={200}
      width={1100}
      marginBottom={40}
      marginLeft={60}
      marginRight={30}
      marginTop={10}
      xTicks={6}
      showTicks={6}
      activeDate={DateTime.fromISO(activeDate).toJSDate()}
      activeColor={colors.colorStrawberry200}
      lastXTick
    />
  )
}

const Hospital = ({ feature, path, dateIndex }) => {
  const center = path.centroid(feature)
  if (!center[0]) {
    return null
  }
  const hospitalColor = (() => {
    if (feature.properties.occupancy[dateIndex] > 0.3) {
      return colors.colorBlueberry500
    }
    if (feature.properties.occupancy[dateIndex] > 0.2) {
      return colors.colorBlueberry400
    }
    if (feature.properties.occupancy[dateIndex] > 0.1) {
      return colors.colorBlueberry300
    }
    if (feature.properties.occupancy[dateIndex] > 0.0001) {
      return colors.colorBlueberry200
    }
    return colors.colorHoney400
  })()
  return (
    <circle
      cx={center[0]}
      cy={center[1]}
      className={style.hospital}
      style={{
        fill: hospitalColor,
        stroke: hospitalColor,
      }}
      r={feature.properties.inpatients[dateIndex] / 8}
    />
  )
}

const Map = ({ dateIndex }) => {
  const mapWidth = 1100
  const mapHeight = 500

  const projection = geoAlbersUsa().fitExtent(
    [
      [0, 0],
      [mapWidth, mapHeight],
    ],
    statesOutline,
  )
  const path = geoPath().projection(projection)

  return (
    <svg width={mapWidth} height={mapHeight} style={{ overflow: 'visible' }}>
      {statesOutline.features.map(state => (
        <path
          key={`path-${state.properties.NAME}`}
          d={path(state)}
          className={style.state}
        />
      ))}
      {hospitals.features.map(feature => (
        <Hospital feature={feature} path={path} dateIndex={dateIndex} />
      ))}
    </svg>
  )
}

const Sample = () => {
  const weeks = hospitals.weeks.sort((a, b) => (a > b ? 1 : -1))
  const [currentDate, setCurrentDate] = useState(weeks[0])
  const [currentDateIndex, setCurrentDateIndex] = useState(0)
  const data = useStaticQuery(graphql`
    {
      allCovidUsDaily(
        filter: { date: { gt: "2020-07-30" } }
        sort: { fields: date, order: DESC }
      ) {
        nodes {
          date
          hospitalizedCurrently
        }
      }
    }
  `)
  const { nodes } = data.allCovidUsDaily

  const daily = nodes
    .map(({ date, hospitalizedCurrently }) => ({
      date: DateTime.fromISO(date).toJSDate(),
      value: hospitalizedCurrently,
    }))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
  const dailyAverage = []
  daily.forEach(({ date }, key) => {
    if (key >= daily.length - 7) {
      return
    }
    let average = 0
    for (let i = 0; i < 7; i += 1) {
      average += daily[key + i].value
    }
    dailyAverage.push({
      date,
      value: average / 7,
    })
  })
  daily.splice(-7, 7)

  return (
    <>
      <p>
        Current hospitalized:{' '}
        {
          daily.find(
            ({ date }) =>
              date.getTime() ===
              DateTime.fromISO(currentDate)
                .toJSDate()
                .getTime(),
          ).value
        }
      </p>
      <p>
        Seven-day average:{' '}
        {Math.round(
          dailyAverage.find(
            ({ date }) =>
              date.getTime() ===
              DateTime.fromISO(currentDate)
                .toJSDate()
                .getTime(),
          ).value,
        )}
      </p>
      <div className={style.slider}>
        <Slider
          min={0}
          max={hospitals.weeks.length - 1}
          step={1}
          onChange={value => {
            setCurrentDateIndex(value)
            setCurrentDate(weeks[value])
          }}
        />
      </div>
      <Chart
        activeDate={currentDate}
        daily={daily}
        dailyAverage={dailyAverage}
      />
      <Map date={currentDate} dateIndex={currentDateIndex} />
    </>
  )
}

export default Sample
