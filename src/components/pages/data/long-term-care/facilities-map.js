/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState, useRef } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-sdk/services/geocoding'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Form, Input } from '~components/common/form'
import { Row, Col } from '~components/common/grid'
import facilitiesMapStyles from './facilities-map.module.scss'

const FacilityDetails = ({ facility }) => (
  <>
    <h3>{facility.facilitynamenormalized}</h3>
    <address>
      {facility.addresscms}
      <br />
      {facility.citycms}, {facility.state}
    </address>
    <p>
      <strong>Resident cases</strong> {facility.residentpositives}
      <br />
      <strong>Resident deaths</strong> {facility.residentdeaths}
      <br />
      <strong>Staff cases</strong> {facility.staffpositive}
      <br />
      <strong>Staff deaths</strong> {facility.staffdeaths}
    </p>
  </>
)

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
  const [mapLayer, setMapLayer] = useState('Cases')
  const layers = ['Cases', 'Deaths']
  if (typeof window === 'undefined') {
    return null
  }

  const mapNode = useRef(null)
  const mapRef = useRef(null)

  const geocodingClient = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
  })

  const selectFacility = event => {
    const bbox = [
      [event.point.x - 5, event.point.y - 5],
      [event.point.x + 5, event.point.y + 5],
    ]
    const features = mapRef.current.queryRenderedFeatures(bbox, {
      layers: [layers[0]],
    })
    if (!features || !features.length) {
      setActiveFacility(false)
      return
    }
    setActiveFacility(features[0].properties)
    setTooltip(event.point)
  }

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
      map.setLayoutProperty('Deaths', 'visibility', 'none')
    })

    map.on('mousemove', event => {
      selectFacility(event)
    })

    map.on('click', event => {
      selectFacility(event)
    })

    return () => {
      map.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      return
    }
    layers.forEach(layer => {
      mapRef.current.setLayoutProperty(
        layer,
        'visibility',
        layer === mapLayer ? 'visible' : 'none',
      )
    })
  }, [mapLayer])

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
      <Row className={facilitiesMapStyles.legend}>
        <Col width={[4, 3, 6]}>
          <div className={facilitiesMapStyles.toggle}>
            {layers.map(layer => (
              <button
                className={layer === mapLayer && facilitiesMapStyles.active}
                type="button"
                onClick={() => {
                  setMapLayer(layer)
                }}
              >
                {layer}
              </button>
            ))}
          </div>
        </Col>
        <Col width={[4, 3, 6]}>
          <p>
            Long-term care facilities{' '}
            <span className={facilitiesMapStyles.noOutbreak}>
              not experiencing
            </span>{' '}
            and{' '}
            <span className={facilitiesMapStyles.outbreak}>
              experiencing an outbreak
            </span>
            .
          </p>
        </Col>
      </Row>
      <div
        style={{
          position: 'relative',
          flex: ' 1 0 auto',
          width: '100%',
          height: '80vh',
        }}
      >
        {activeFacility && (
          <>
            <div
              className={facilitiesMapStyles.tooltip}
              style={{ left: tooltip.x - 150, top: tooltip.y + 15 }}
            >
              <FacilityDetails facility={activeFacility} />
            </div>
            <div
              className={facilitiesMapStyles.modal}
              aria-modal
              aria-label={activeFacility.facilitynamenormalized}
            >
              <div className={facilitiesMapStyles.content}>
                <button
                  type="button"
                  className={facilitiesMapStyles.close}
                  onClick={event => {
                    event.preventDefault()
                    setActiveFacility(false)
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <FacilityDetails facility={activeFacility} />
              </div>
            </div>
          </>
        )}
        <div ref={mapNode} style={{ width: '100%', height: '100%' }} />
      </div>
    </>
  )
}

export default FacilitiesMap
