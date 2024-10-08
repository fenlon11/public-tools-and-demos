import PropTypes from 'prop-types'
import { useRef, useEffect, useState, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import MarkerList from '../MarkerList'
import { AppContext } from '../Context/AppContext';
import { addUserLocationPulse } from './pulse';

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export const accessToken = (mapboxgl.accessToken =
  'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2lqbmp1MzNhMDBud3VvbHhqbjY1cnV2cCJ9.uGJJU2wgtXzcBNc62vY4_A')

const Map = ({ setData, onLoad, activeFeature, setActiveFeature, searchResult, denyLocation }) => {
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [features, setFeatures] = useState();
  const { activeLocation } = useContext(AppContext);
  let hoveredFeatureId = null;

  let mapRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/examples/cm0foo08s01tn01qq2dzccr6i', 
      center:  [
        -97.76095065780527,
        39.15132376255781
        ],
      zoom: 4
    }))

    map.addControl(new mapboxgl.NavigationControl())

    map.on('load', () => {
      onLoad(map)
      setMapLoaded(true)
      // Add circles to all store-locations
      map.addSource('stores', {
        type: 'vector',
        url: 'mapbox://examples.store-locations-clustering'
      });


      map.addLayer({
        id: 'store-locations',
        source: 'stores',
        'source-layer': 'store-locations',
        type: 'circle',
        paint: {
          'circle-color': "#006241",
          'circle-radius': [  
            'case',  
            ['boolean', ['feature-state', 'hover'], true],  
            6,  
            9
          ],
          'circle-stroke-color': "#FFFFFF",
          'circle-stroke-width': [
            'case',  
            ['boolean', ['feature-state', 'hover'], true],  
            2,  
            3

          ],
          "circle-radius-transition": {
            "duration": 300,
            "delay": 0
          },
          "circle-stroke-width-transition": {
            "duration": 300,
            "delay": 0
          }
        },
      });

      // When the user moves their mouse over the 'store-locations' layer, update the
      // feature state for the feature under the mouse
      map.on('mousemove', 'store-locations', function(e) {
        console.log("mouse moves over feature");
        if (e.features.length > 0) {
            if (hoveredFeatureId) {
                map.setFeatureState(
                    { 
                      source: 'stores',
                      sourceLayer: 'store-locations',
                      id: hoveredFeatureId 
                    },
                    { hover: true }
                );
            }
            hoveredFeatureId = e.features[0].id;
            map.setFeatureState(
              { 
                source: 'stores',
                sourceLayer: 'store-locations',
                id: hoveredFeatureId 
              },
                { hover: false }
            );
        }
      });

      // When the mouse leaves the 'store-locations' layer, update the feature state of the
      // previously hovered feature
      map.on('mouseleave', 'store-locations', function() {
        console.log("mouse leaves feature");

        if (hoveredFeatureId) {
            map.setFeatureState(
              { 
                source: 'stores',
                sourceLayer: 'store-locations',
                id: hoveredFeatureId 
              },
                { hover: true }
            );
        }
        hoveredFeatureId = null;
      });
    })

    // Set the max bounds of the map to the extent of your dataset
    map.setMaxBounds([
      [-164.00944, 24.83458], // SouthWest coordinates
      [-68.52300, 70.17738] // Northeast coordinates
    ]);

    

    // Change the cursor to a pointer when the mouse is over a feature layer.  
    map.on('mouseenter', 'store-locations', () => {  
      map.getCanvas().style.cursor = 'pointer';  
    });  

    // Change it back to a pointer when it leaves.  
    map.on('mouseleave', 'store-locations', () => {  
      map.getCanvas().style.cursor = '';  
    });

    map.on('moveend', () => {
      const zoom = map.getZoom();
      // Set minimum zoom to query & render locations
      if (Math.round(zoom) >= 10 ) {

        // This query requests features from the unclustered layer in our tileset
        const locationsInView = mapRef.current.queryRenderedFeatures({ layers: ['store-locations'] });
        setFeatures(locationsInView)
        setData(locationsInView);
      }
    });

    map.on('zoomend', () => {
      const zoom = map.getZoom();
      // Set minimum zoom to query & render locations
      if (Math.round(zoom) <= 10 ) {
        setData([]);
      }
    });

    // Add a click event listener to the map
    map.on('click', function(e) {
      // Query the features under the clicked point
      var feature = map.queryRenderedFeatures(e.point);

    // If there is a feature under the clicked point, set the ActiveFeature
    if (feature.length) {
        setActiveFeature(feature[0]);
    }
  });

  }, [])

  // Move Map to searched location or User's location
  useEffect(() => {
    if (activeLocation !== null) {

      // if the activeLocation is userbased and we haven't added the pulse yet - Add it
      if (activeLocation.type == 'user' && pulseRef.current == null) {
        addUserLocationPulse(mapRef, pulseRef, activeLocation);
      }

      // Fly to the activeLocation
      mapRef.current.flyTo({
        center: activeLocation.coords,
        essential: true,
        zoom: 11
      });
    }

  }, [activeLocation])

  // If user does not share location 
  useEffect(() => {
    if(denyLocation) {

      setTimeout(() => {
        // Fly to Demo City (Seattle)
        mapRef.current.flyTo({
          center: [-122.33935, 47.60774],
          essential: true, // this animation is considered essential with respect to prefers-reduced-motion
          zoom: 11
        });

      }, 2000)
    } 
  }, [denyLocation])

  return (
    <>
      <div ref={mapContainer} className='h-full w-full' />
      {mapLoaded &&
        features &&
        <MarkerList 
          features={features}
          mapRef={mapRef.current}
          searchResult={searchResult}
          setActiveFeature={setActiveFeature}
          activeFeature={activeFeature}/>
      }
    </>
  )
}

Map.propTypes = {
  data: PropTypes.any,
  onFeatureClick: PropTypes.func,
  onLoad: PropTypes.func
}

export default Map
