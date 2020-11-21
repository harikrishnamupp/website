/* eslint-disable no-underscore-dangle */
import React, { Fragment, useEffect, useState, useRef } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-sdk/services/geocoding'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Form, Input } from '~components/common/form'
import { Row, Col } from '~components/common/grid'
import facilitiesMapStyles from './facilities-map.module.scss'

const FacilitiesMap = ({ center, zoom }) => {
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
  mapboxgl.accessToken = data.site.siteMetadata.mapBoxToken
  const [activeFacility, setActiveFacility] = useState(false)
  const [query, setQuery] = useState(false)
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 })
  if (typeof window === 'undefined') {
    return null
  }

  const mapNode = useRef(null)
  const mapRef = useRef(null)

  const geocodingClient = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
  })
  useEffect(() => {
    const mapCenter = center
    const mapZoom = zoom

    // Token must be set before constructing map

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
      /* add sources
      Object.entries(sources).forEach(([id, source]) => {
        map.addSource(id, source)
      })

      // add layers
      layers.forEach(layer => {
        map.addLayer(layer)
      }) */
    })

    map.on('mousemove', e => {
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ]
      const features = map.queryRenderedFeatures(bbox, {
        layers: ['facilities'],
      })
      if (!features || !features.length) {
        setActiveFacility(false)
        return
      }
      setActiveFacility(features[0].properties)
      setTooltip(e.point)
    })

    return () => {
      map.remove()
    }
  }, [])

  return (
    <>
      <Form
        onSubmit={event => {
          event.preventDefault()
          geocodingClient
            .forwardGeocode({
              query,
              limit: 1,
            })
            .send()
            .then(response => {
              const feature = response.body.features.pop()
              mapRef.current.easeTo({
                center: feature.center,
                zoom: 7,
              })
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
          height: '80vh',
        }}
      >
        {activeFacility && (
          <div
            className={facilitiesMapStyles.tooltip}
            style={{ left: tooltip.x - 150, top: tooltip.y + 15 }}
          >
            <h3>{activeFacility.facilitynamenormalized}</h3>
            <address>
              {activeFacility.addresscms}
              <br />
              {activeFacility.citycms}, {activeFacility.state}
            </address>
            <p>
              <strong>Resident cases</strong> {activeFacility.residentpositives}
              <br />
              <strong>Resident deaths</strong> {activeFacility.residentdeaths}
              <br />
              <strong>Staff cases</strong> {activeFacility.staffpositive}
              <br />
              <strong>Staff deaths</strong> {activeFacility.staffdeaths}
            </p>
          </div>
        )}
        <div ref={mapNode} style={{ width: '100%', height: '100%' }} />
      </div>
    </>
  )
}

export default FacilitiesMap
