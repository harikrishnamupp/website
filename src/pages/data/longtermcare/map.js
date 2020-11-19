import React, { useEffect, useRef } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

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

  return <div ref={mapNode} style={{ width: '100%', height: '100%' }} />
}

const LTCMapPage = () => {
  return (
    <Layout title="Sample LTC Map">
      <div
        style={{
          position: 'relative',
          flex: ' 1 0 auto',
          width: '100%',
          height: 500,
        }}
      >
        <Map center={[-97, 38]} zoom={3} />
      </div>
    </Layout>
  )
}

export default LTCMapPage
