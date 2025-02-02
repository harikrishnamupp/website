import React from 'react'

import { isCombined } from './utils'
import Percent from '~components/pages/race/dashboard/percent'
import { FormatDate, FormatItemList } from '~components/utils/format'

import RacialDataSmallCard from '~components/pages/data/cards/small/view-racial-data-small-card'
import DataAsGraphicSmallCard from '~components/pages/data/cards/small/data-as-graphic-small-card'

import styles from './notes-and-downloads.module.scss'

const getDataCompletenessNote = (
  combined,
  separate,
  combinedTestHosp,
  separateTestHosp,
) => {
  /**
   * Generates a note about data completeness for this state.
   */
  const stateIsCombined = isCombined(combined, separate)
  const dataObject = stateIsCombined ? combined : separate
  const testHospObject = stateIsCombined ? combinedTestHosp : separateTestHosp

  if (stateIsCombined) {
    return (
      <>
        As of{' '}
        <FormatDate
          date={dataObject.lastCheckDate.value}
          format="LLLL d, yyyy"
        />
        , {dataObject.name} has reported race/ethnicity data for{' '}
        <Percent number={parseFloat(testHospObject.knownRaceEthTest)} /> of
        tests, <Percent number={parseFloat(dataObject.knownRaceEthPos)} /> of
        cases, <Percent number={parseFloat(testHospObject.knownRaceEthHosp)} />{' '}
        of hospitalizations, and{' '}
        <Percent number={parseFloat(dataObject.knownRaceEthDeath)} /> of deaths.
      </>
    )
  }
  if (!stateIsCombined) {
    if (
      parseFloat(testHospObject.knownRaceHosp) === 0 &&
      parseFloat(testHospObject.knownEthHosp) === 0 &&
      parseFloat(testHospObject.knownRaceTest) === 0 &&
      parseFloat(testHospObject.knownEthTest) === 0
    ) {
      /**
       * Special case to make the copy shorter.
       *
       * State reports race and ethnicity separately and does not report
       * hospitalizations or tests.
       */
      return (
        <>
          As of{' '}
          <FormatDate
            date={dataObject.lastCheckDate.value}
            format="LLLL d, yyyy"
          />
          , {dataObject.name} has reported race data for{' '}
          <Percent number={parseFloat(dataObject.knownRacePos)} /> of cases and{' '}
          <Percent number={parseFloat(dataObject.knownRaceDeath)} /> of deaths,
          and ethnicity for{' '}
          <Percent number={parseFloat(dataObject.knownEthPos)} /> of cases and{' '}
          <Percent number={parseFloat(dataObject.knownEthDeath)} /> of deaths.{' '}
          {dataObject.name} does not report either race or ethnicity data for
          tests or hospitalizations.
        </>
      )
    }
    return (
      <>
        As of{' '}
        <FormatDate
          date={dataObject.lastCheckDate.value}
          format="LLLL d, yyyy"
        />
        , {dataObject.name} has reported race data for{' '}
        <Percent number={parseFloat(testHospObject.knownRaceTest)} /> of tests,{' '}
        <Percent number={parseFloat(dataObject.knownRacePos)} /> of cases,{' '}
        <Percent number={parseFloat(testHospObject.knownRaceHosp)} /> of
        hospitalizations, and{' '}
        <Percent number={parseFloat(dataObject.knownRaceDeath)} /> of deaths,
        and ethnicity data for{' '}
        <Percent number={parseFloat(testHospObject.knownEthTest)} /> of tests,{' '}
        <Percent number={parseFloat(dataObject.knownEthPos)} /> of cases,{' '}
        <Percent number={parseFloat(testHospObject.knownEthHosp)} /> of
        hospitalizations, and{' '}
        <Percent number={parseFloat(dataObject.knownEthDeath)} /> of deaths.
      </>
    )
  }
  return ''
}

const getSmallNNote = notes => {
  /**
   * Gets the full text of the "Small N" note, with relevant
   * race / ethnicity groups.
   */
  const fullNameDict = {
    blackSmallN: 'Black or African American',
    asianSmallN: 'Asian',
    aianSmallN: 'American Indian or Alaska Native',
    nhpiSmallN: 'Native Hawaiian or Other Pacific Islander',
    whiteSmallN: 'White',
    latinXSmallN: 'Hispanic or Latino',
  }

  const smallNCategories = Object.keys(notes)
    .filter(
      note =>
        typeof note === 'string' &&
        note.endsWith('SmallN') &&
        notes[note] === true,
    )
    .map(note => fullNameDict[note])
  return (
    <>
      {notes.smallNNote}{' '}
      <FormatItemList items={smallNCategories} keys={smallNCategories} />
    </>
  )
}

const getNotes = (combined, separate, combinedTestHosp, separateTestHosp) => {
  /**
   * Creates a list of notes for this state's data.
   */
  const notesObject = isCombined(combined, separate) ? combined : separate
  let hasSmallNNote = false

  if (notesObject === undefined || notesObject === null) {
    return []
  }

  let notesList = Object.keys(notesObject)
    .map(note => {
      if (note === 'smallNNote' && notesObject.smallNNote != null) {
        hasSmallNNote = true
        return null
      }
      if (note === 'latinxNote' || note === 'mutExclNote') {
        // these will be concatenated below
        return null
      }
      if (note !== null && note.includes('Note')) {
        return notesObject[note]
      }
      return null
    })
    .filter(
      noteContent => noteContent != null && typeof noteContent === 'string',
    )

  if (notesObject.latinxNote === null) {
    notesList.unshift(notesObject.mutExclNote)
  } else {
    // combine latinxNote and mutExclNote
    notesList.unshift(`${notesObject.latinxNote} ${notesObject.mutExclNote}`)
  }

  notesList.unshift(
    getDataCompletenessNote(
      combined,
      separate,
      combinedTestHosp,
      separateTestHosp,
    ),
  )

  if (hasSmallNNote) {
    notesList = [
      ...notesList.slice(0, notesList.length - 1),
      getSmallNNote(notesObject), // splice smallNNote as the second to last note
      notesList[notesList.length - 1],
    ]
  }

  return notesList
}

const NotesAndDownloads = ({
  slug,
  stateAbbreviation,
  stateName,
  combinedData,
  separateData,
  combinedTestHosp,
  separateTestHosp,
}) => {
  const notesList = getNotes(
    combinedData,
    separateData,
    combinedTestHosp,
    separateTestHosp,
  )

  return (
    <div className={styles.container}>
      <div className={styles.notes}>
        <h4>Notes</h4>
        <ul>
          {notesList.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
      <div className={styles.downloadsContainer}>
        <h4>Download dataset</h4>
        <div className={styles.links}>
          {/** todo update the href to the state's crdt csv */}
          <a
            href={`/data/download/${slug}-race-ethnicity-historical.csv`}
            aria-label={`Download ${stateName}'s racial data data as CSV`}
          >
            CSV
          </a>
          {/** todo update the href to the state's metadata */}
          {/** 
          <Link to="/data/api" aria-label={`Download ${stateName}'s Metadata`}>
            Metadata
          </Link>
           */}
        </div>
        <div className={styles.smallCards}>
          <RacialDataSmallCard
            stateAbbreviation={stateAbbreviation}
            stateName={stateName}
            content="View racial data dashboard"
          />
          <DataAsGraphicSmallCard
            stateAbbreviation={stateAbbreviation}
            stateName={stateName}
          />
        </div>
      </div>
    </div>
  )
}

export default NotesAndDownloads
