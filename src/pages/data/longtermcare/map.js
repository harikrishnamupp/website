/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState, useRef } from 'react'
import algoliasearch from 'algoliasearch'
import { graphql, useStaticQuery } from 'gatsby'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Form, Input } from '~components/common/form'
import { Row, Col } from '~components/common/grid'
import Layout from '~components/layout'

const Map = ({ center, zoom }) => {
  const data = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            mapBoxToken
          }
        }
      }
    `,
  )
  const [facilities, setFacilities] = useState(false)
  const [query, setQuery] = useState(false)
  const client = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY,
  )
  const index = client.initIndex('test_ltc_geo_facilities')
  if (typeof window === 'undefined') {
    return null
  }

  const mapNode = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    const mapCenter = center
    const mapZoom = zoom

    // Token must be set before constructing map
    mapboxgl.accessToken = data.site.siteMetadata.mapBoxToken

    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: `mapbox://styles/covidtrackingproject/ckfeoswng0hc219o24blw5utn`,
      center: mapCenter,
      zoom: mapZoom,
    })
    mapRef.current = map
    window.map = map // for easier debugging and querying via console

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      console.log('map onload')
      /* add sources
      Object.entries(sources).forEach(([id, source]) => {
        map.addSource(id, source)
      })

      // add layers
      layers.forEach(layer => {
        map.addLayer(layer)
      }) */
    })

    return () => {
      map.remove()
    }
  }, [])

  useEffect(() => {
    if (!facilities || !facilities.length) {
      return
    }
    facilities.forEach(facility => {
      if (typeof facility._geoloc === 'undefined') {
        return
      }
      const marker = new mapboxgl.Marker()
        .setLngLat([facility._geoloc.lng, facility._geoloc.lat])
        .addTo(mapRef.current)
      console.log(marker)
    })
  }, [facilities])

  return (
    <>
      <Form
        onSubmit={event => {
          event.preventDefault()
          console.log(query)
          index
            .search('', {
              aroundLatLng: '37.5706625, -81.4748938',
              aroundRadius: 1000000,
              distinct: true,
            })
            .then(({ hits }) => {
              setFacilities(hits)
            })
        }}
        noMargin
      >
        <Row>
          <Col width={[3, 3, 8]}>
            <Input
              type="text"
              label="Search facilities"
              placeholder="Enter a city or zip code"
              hideLabel
              onChange={event => {
                setQuery(event.target.value)
              }}
            />
          </Col>
          <Col width={[1, 3, 4]}>
            <button type="submit">Search</button>
          </Col>
        </Row>
      </Form>
      <div
        style={{
          position: 'relative',
          flex: ' 1 0 auto',
          width: '100%',
          height: 500,
        }}
      >
        <div ref={mapNode} style={{ width: '100%', height: '100%' }} />
      </div>
    </>
  )
}

const LTCMapPage = () => (
  <Layout title="Sample LTC Map">
    <Map center={[-97, 38]} zoom={3} />
  </Layout>
)

export default LTCMapPage
