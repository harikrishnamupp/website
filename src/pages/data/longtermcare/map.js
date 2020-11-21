import React from 'react'
import Layout from '~components/layout'
import FacilitiesMap from '~components/pages/data/long-term-care/facilities-map'

const LTCMapPage = () => (
  <Layout title="Sample LTC Map">
    <FacilitiesMap center={[-97, 38]} zoom={3} />
  </Layout>
)

export default LTCMapPage
