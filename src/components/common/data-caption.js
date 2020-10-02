/* eslint-disable no-plusplus */
import React from 'react'
import { DateTime } from 'luxon'

const averageSize = 14

const getSpikes = data => {
  const spikes = []
  const getRange = (startIndex, endIndex) => {
    const many = []

    for (let i = startIndex; i < endIndex; i++) {
      many.push(typeof data[i] === 'undefined' ? null : data[i])
    }

    return many
  }

  data.forEach((item, index) => {
    if (index < averageSize) {
      return
    }
    if (
      item >=
      Math.max(...getRange(index - averageSize / 2, index + averageSize / 2))
    ) {
      spikes.push({ value: item, index })
    }
  })
  return spikes
}

const DataCaption = ({ data, label }) => {
  const spikes = getSpikes(data.map(item => item.value))
  return (
    <div className="a11y-only">
      On {DateTime.fromJSDate(data[0].date).toFormat('LLLL d, yyyy')}, there
      were {data[0].value} {label}.{' '}
      {spikes && (
        <>
          There largest changes of {label} are:
          <ul>
            {spikes.map(spike => (
              <li key={`${label}-spike-${spike.index}`}>
                {DateTime.fromJSDate(data[spike.index].date).toFormat(
                  'LLLL d, yyyy',
                )}
                : {Math.round(spike.value)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default DataCaption
