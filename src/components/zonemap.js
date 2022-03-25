import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { Portal } from 'react-portal';
import ReactMapGL, { NavigationControl, Source, Layer } from 'react-map-gl';
import {
  debounce,
  isEmpty,
  map,
  noop,
  size,
} from 'lodash';
import { __ } from '../helpers/translation';

const interactiveLayerIds = ['zones-clickable', 'data-center-facility'];
const mapStyle = { version: 8, sources: {}, layers: [] };

const ZoneMap = ({
  children = null,
  dataCenterFacilities = null,
  hoveringEnabled = true,
  onMapLoaded = noop,
  onMapError = noop,
  onMouseMove = noop,
  onResize = noop,
  onSeaClick = noop,
  onViewportChange = noop,
  onDataCenterFacilityClick = noop,
  onDataCenterFacilityMouseEnter = noop,
  onDataCenterFacilityMouseLeave = noop,
  onZoneClick = noop,
  onZoneMouseEnter = noop,
  onZoneMouseLeave = noop,
  scrollZoom = true,
  style = {},
  theme = {},
  transitionDuration = 300,
  viewport = {
    latitude: 0,
    longitude: 0,
    zoom: 2,
  },
  zones = {},
}) => {
  const ref = useRef(null);
  const wrapperRef = useRef(null);
  const [hoveredDataCenterFacilityId, setHoveredDataCenterFacilityId] = useState(null);
  const [hoveredZoneId, setHoveredZoneId] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const debouncedSetIsDragging = useMemo(
    () => debounce((value) => {
      setIsDragging(value);
    }, 200),
    [],
  );

  // TODO: Try tying this to internal map state somehow to remove the need for these handlers.
  const handleDragStart = useMemo(() => () => setIsDragging(true), []);
  const handleDragEnd = useMemo(() => () => setIsDragging(false), []);
  const handleWheel = useMemo(
    () => () => {
      setIsDragging(true);
      debouncedSetIsDragging(false);
    },
    [],
  );

  // Generate two sources (clickable and non-clickable zones), based on the zones data.
  const sources = useMemo(
    () => {
      const features = map(zones, (zone, zoneId) => ({
        type: 'Feature',
        geometry: {
          ...zone.geometry,
          coordinates: zone.geometry.coordinates.filter(size), // Remove empty geometries
        },
        properties: {
          color: zone.color,
          isClickable: zone.isClickable,
          zoneData: zone,
          zoneId,
        },
      }));

      return {
        zonesClickable: {
          type: 'FeatureCollection',
          features: features.filter(f => f.properties.isClickable),
        },
        zonesNonClickable: {
          type: 'FeatureCollection',
          features: features.filter(f => !f.properties.isClickable),
        },
      };
    },
    [zones],
  );

  // Generate sources based on the data centers data.
  const dataCenterFacilitiesSources = useMemo(
    () => {
      const features = Array.isArray(dataCenterFacilities) && map(dataCenterFacilities, dataCenterFacility => ({
        type: 'Feature',
        geometry: {
          coordinates: [dataCenterFacility.geo_lat, dataCenterFacility.geo_lon],
          type: 'Point'
        },
        properties: {
          isClickable: true,
          dataCenterFacilityData: dataCenterFacility,
          dataCenterFacilityId: dataCenterFacility.id,
        },
      }));

      return {
        dataCenterFacilities: {
          type: 'FeatureCollection',
          features
        }
      };
    },
    [dataCenterFacilities],
  );

  // Every time the hovered zone changes, update the hover map layer accordingly.
  const hoverFilter = useMemo(() => (['==', 'zoneId', hoveredZoneId || '']), [hoveredZoneId]);

  // Calculate layer styles only when the theme changes
  // to keep the stable and prevent excessive rerendering.
  const styles = useMemo(
    () => ({
      dataCenterFacilities: { 'circle-color': 'orange', 'circle-radius': 10 },
      hover: { 'fill-color': 'white', 'fill-opacity': 0.3 },
      ocean: { 'background-color': theme.oceanColor },
      zonesBorder: { 'line-color': theme.strokeColor, 'line-width': theme.strokeWidth },
      zonesClickable: { 'fill-color': ['case', ['has', 'color'], ['get', 'color'], theme.clickableFill] },
      zonesNonClickable: { 'fill-color': theme.nonClickableFill },
    }),
    [theme],
  );

  // If WebGL is not supported trigger an error callback.
  useEffect(
    () => {
      if (!ReactMapGL.supported()) {
        setIsSupported(false);
        onMapError('WebGL not supported');
      }
    },
    [],
  );

  const handleClick = useMemo(
    () => (e) => {
      if (ref.current && ref.current.state && !ref.current.state.isDragging) {
        const features = ref.current.queryRenderedFeatures(e.point);
        const feature = Array.isArray(features) ?
          features[0] :
          null;

        if (feature && feature.properties) {
          const { dataCenterFacilityId, zoneId } = feature.properties;

          if (dataCenterFacilityId) {
            const dataCenterFacility = dataCenterFacilities.find(entry => entry.id === dataCenterFacilityId);

            onDataCenterFacilityClick(dataCenterFacility);
          } else if (zoneId) {
            onZoneClick(zoneId);
          }
        }

        if (isEmpty(features)) {
          onSeaClick();
        }
      }
    },
    [ref, dataCenterFacilities, onSeaClick, onZoneClick, onDataCenterFacilityClick],
  );

  const handleMouseMove = useMemo(
    () => (e) => {
      if (ref.current) {
        if (hoveringEnabled) {
          onMouseMove({
            x: e.point[0],
            y: e.point[1],
            longitude: e.lngLat[0],
            latitude: e.lngLat[1],
          });
        }
        // Ignore zone hovering when dragging (performance optimization).
        if (!isDragging) {
          const features = ref.current.queryRenderedFeatures(e.point);
          // Trigger onZoneMouseEnter if mouse enters a different
          // zone and onZoneMouseLeave when it leaves all zones.
          if (!isEmpty(features) && hoveringEnabled) {
            const feature = Array.isArray(features) ?
              features[0] :
              null;

            if (feature && feature.properties) {
              const { dataCenterFacilityId, zoneId } = feature.properties;

              if (zoneId) {
                if (hoveredZoneId !== zoneId) {
                  onDataCenterFacilityMouseLeave();
                  setHoveredDataCenterFacilityId(null);

                  onZoneMouseEnter(zones[zoneId], zoneId);
                  setHoveredZoneId(zoneId);
                }
              } else if (dataCenterFacilityId) {
                if (hoveredDataCenterFacilityId !== dataCenterFacilityId) {
                  const dataCenterFacility = dataCenterFacilities.find(entry => entry.id === dataCenterFacilityId);

                  onZoneMouseLeave();
                  setHoveredZoneId(null);

                  onDataCenterFacilityMouseEnter(dataCenterFacility);
                  setHoveredDataCenterFacilityId(dataCenterFacilityId);
                }
              }
            }
          } else {
            if (hoveredZoneId !== null) {
              onZoneMouseLeave();
              setHoveredZoneId(null);
            }

            if (hoveredDataCenterFacilityId !== null) {
              onDataCenterFacilityMouseLeave();
              setHoveredDataCenterFacilityId(null);
            }
          }
        }
      }
    },
    [ref, hoveringEnabled, isDragging, zones, hoveredZoneId, onMouseMove, onZoneMouseEnter, onZoneMouseLeave, dataCenterFacilities, hoveredDataCenterFacilityId, onDataCenterFacilityMouseEnter, onDataCenterFacilityMouseLeave],
  );

  const handleMouseOut = useMemo(
    () => () => {
      if (hoveredZoneId !== null) {
        onZoneMouseLeave();
        setHoveredZoneId(null);
      }

      if (hoveredDataCenterFacilityId !== null) {
        onDataCenterFacilityMouseLeave();
        setHoveredDataCenterFacilityId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hoveredZoneId, hoveredDataCenterFacilityId],
  );

  // Don't render map nor any of the layers if WebGL is not supported.
  if (!isSupported) {
    return null;
  }

  return (
    <div className="zone-map" style={style} ref={wrapperRef}>
      <ReactMapGL
        ref={ref}
        width="100%"
        height="100%"
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        interactiveLayerIds={interactiveLayerIds}
        dragRotate={false}
        touchRotate={false}
        scrollZoom={scrollZoom}
        mapStyle={mapStyle}
        maxZoom={10}
        onBlur={handleMouseOut}
        onClick={handleClick}
        onError={onMapError}
        onLoad={onMapLoaded}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseOut}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onResize={onResize}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onWheel={handleWheel}
        onViewportChange={onViewportChange}
        transitionDuration={isDragging ? 0 : transitionDuration}
      >
        {/*
          Render the navigation controls next to ReactMapGL in the DOM so that
          hovering over zoom buttons doesn't fire hover events on the map.
        */}
        <Portal node={wrapperRef.current}>
          <div
            className="mapboxgl-zoom-controls"
            style={{
              boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.15)',
              position: 'absolute',
              right: '24px',
              top: '24px',
            }}
          >
            <NavigationControl
              showCompass={false}
              zoomInLabel={__('tooltips.zoomIn')}
              zoomOutLabel={__('tooltips.zoomOut')}
            />
          </div>
        </Portal>
        {/* Layers */}
        <Layer id="ocean" type="background" paint={styles.ocean} />
        <Source type="geojson" data={sources.zonesNonClickable}>
          <Layer id="zones-static" type="fill" paint={styles.zonesNonClickable} />
        </Source>
        <Source type="geojson" data={sources.zonesClickable}>
          <Layer id="zones-clickable" type="fill" paint={styles.zonesClickable} />
          <Layer id="zones-border" type="line" paint={styles.zonesBorder} />
          {/* Note: if stroke width is 1px, then it is faster to use fill-outline in fill layer */}
        </Source>
        <Source type="geojson" data={sources.zonesClickable}>
          <Layer id="hover" type="fill" paint={styles.hover} filter={hoverFilter} />
        </Source>
        <Source
          data={dataCenterFacilitiesSources.dataCenterFacilities}
          type="geojson"
        >
          <Layer id="data-center-facility" type="circle" paint={styles.dataCenterFacilities} />
        </Source>
        {/* Extra layers provided by user */}
        {children}
      </ReactMapGL>
    </div>
  );
};

export default ZoneMap;
