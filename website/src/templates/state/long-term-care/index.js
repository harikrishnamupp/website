import React from 'react'
import { graphql } from 'gatsby'
import marked from 'marked'
import LongTermCarePreamble from '~components/pages/state/long-term-care/preamble'
import LongTermCareSummaryTable from '~components/pages/state/long-term-care/summary-table'
import LongTermCareFacilities from '~components/pages/state/long-term-care/facilities'
import LongTermCareBarChart from '~components/pages/state/long-term-care/chart'
import LongTermCareAlertNote from '~components/pages/state/long-term-care/alert-note'
import Layout from '~components/layout'

export default ({ pageContext, path, data }) => {
  const state = pageContext
  const { slug } = state.childSlug
  return (
    <Layout
      title={`${state.name}: Long-term care`}
      returnLinks={[
        { link: '/data' },
        { link: `/data/state/${slug}`, title: state.name },
      ]}
      description={`Cumulative and outbreak data on cases and deaths in nursing homes, assisted living, and other long-term-care facilities in ${state.name}.`}
      path={path}
    >
      {data.aggregate.nodes.length ? (
        <>
          <LongTermCarePreamble
            state={state.state}
            stateSlug={state.childSlug.slug}
            stateName={state.name}
            overview={data.covidStateInfo.childLtc.current}
            assessment={data.covidGradeStateAssessment.ltc}
            showFacilities
          />
          <LongTermCareBarChart data={data.aggregate.nodes} />
          {data.covidLtcNotes.alerts && (
            <LongTermCareAlertNote>
              {data.covidLtcNotes.alerts}
            </LongTermCareAlertNote>
          )}
          <h2 id="facilities">Facilities</h2>
          <LongTermCareFacilities stateSlug={slug} stateAbbr={state.state} />
          <h2 id="summary">Summary</h2>
          <LongTermCareSummaryTable
            aggregate={data.aggregate.nodes[0]}
            outbreak={data.outbreak.nodes[0]}
          />
          <h2 id="notes">State notes</h2>
          <div
            dangerouslySetInnerHTML={{
              __html: marked(data.covidLtcNotes.notes),
            }}
          />
        </>
      ) : (
        <LongTermCareAlertNote>
          {state.name} does not report long-term care data.
        </LongTermCareAlertNote>
      )}
    </Layout>
  )
}

export const query = graphql`
  query($state: String!) {
    covidStateInfo(state: { eq: $state }) {
      childLtc {
        current {
          date
          total_cases
          total_death
          outbrkfac_alf
          outbrkfac_ltc
          outbrkfac_other
          outbrkfac_nh
        }
      }
    }
    aggregate: allCovidLtcStates(
      sort: { fields: date, order: DESC }
      filter: { state_abbr: { eq: $state }, data_type: { eq: "Aggregate" } }
    ) {
      nodes {
        date
        posstaff_other
        posstaff_nh
        posstaff_ltc
        posstaff_alf
        posres_other
        posres_nh
        posres_ltc
        posres_alf
        posresstaff_other
        posresstaff_nh
        posresstaff_ltc
        posresstaff_alf
        deathstaff_other
        deathstaff_nh
        deathstaff_ltc
        deathstaff_alf
        deathres_other
        deathres_nh
        deathres_ltc
        deathres_alf
        deathresstaff_other
        deathresstaff_nh
        deathresstaff_ltc
        deathresstaff_alf
        data_type
      }
    }
    covidGradeStateAssessment(state: { eq: $state }) {
      ltc
    }
    outbreak: allCovidLtcStates(
      sort: { fields: date, order: DESC }
      filter: { state_abbr: { eq: $state }, data_type: { eq: "Outbreak" } }
      limit: 1
    ) {
      nodes {
        date
        posstaff_other
        posstaff_nh
        posstaff_ltc
        posstaff_alf
        posres_other
        posres_nh
        posres_ltc
        posres_alf
        posresstaff_other
        posresstaff_nh
        posresstaff_ltc
        posresstaff_alf
        deathstaff_other
        deathstaff_nh
        deathstaff_ltc
        deathstaff_alf
        deathres_other
        deathres_nh
        deathres_ltc
        deathres_alf
        deathresstaff_other
        deathresstaff_nh
        deathresstaff_ltc
        deathresstaff_alf
        data_type
      }
    }
    covidLtcNotes(state: { eq: $state }) {
      notes
      alerts
    }
  }
`
