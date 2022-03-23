import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

import thirdPartyServices from '../services/thirdparty';
import { __ } from '../helpers/translation';
import { getZoneId } from '../helpers/router';
import { getValueAtPosition } from '../helpers/grib';
import { calculateLengthFromDimensions } from '../helpers/math';
import { getCenteredZoneViewport, getCenteredLocationViewport } from '../helpers/map';
import { useInterpolatedSolarData, useInterpolatedWindData } from '../hooks/layers';
import { useTheme } from '../hooks/theme';
import { useZonesWithColors } from '../hooks/map';
import { useTrackEvent } from '../hooks/tracking';
import { dispatchApplication } from '../store';

import DataCenterFacilityTooltip from '../components/tooltips/data-center-facility-tooltip';
import ZoneMap from '../components/zonemap';
import MapLayer from '../components/maplayer';
import MapCountryTooltip from '../components/tooltips/mapcountrytooltip';
import ExchangeLayer from '../components/layers/exchangelayer';
import SolarLayer from '../components/layers/solarlayer';
import WindLayer from '../components/layers/windlayer';

import { LEFT_PANEL_TAB_DATA_CENTER_FACILITIES, LEFT_PANEL_TAB_ELECTRICITY_MAP } from '../reducers';

const debouncedReleaseMoving = debounce(() => { dispatchApplication('isMovingMap', false); }, 200);

export default () => {
  const dataCenterFacilities = useSelector(state => state.data.dataCenterFacilities);
  const currentDataCenterFacilitiesToCompare = useSelector(state => state.application.allDataCenterFacilitiesToCompare);
  const webGLSupported = useSelector(state => state.application.webGLSupported);
  const isHoveringExchange = useSelector(state => state.application.isHoveringExchange);
  const electricityMixMode = useSelector(state => state.application.electricityMixMode);
  const callerLocation = useSelector(state => state.application.callerLocation);
  const isLoadingMap = useSelector(state => state.application.isLoadingMap);
  const isEmbedded = useSelector(state => state.application.isEmbedded);
  const isMobile = useSelector(state => state.application.isMobile);
  const viewport = useSelector(state => state.application.mapViewport);
  const solarData = useInterpolatedSolarData();
  const windData = useInterpolatedWindData();
  const zones = useZonesWithColors();
  const trackEvent = useTrackEvent();
  const location = useLocation();
  const history = useHistory();
  // TODO: Replace with useParams().zoneId once this component gets
  // put in the right render context and has this param available.
  const zoneId = getZoneId();
  const theme = useTheme();

  const [dataCenterFacilitiesToCompare, setDataCenterFacilitiesToCompare] = useState([]);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [tooltipZoneData, setTooltipZoneData] = useState(null);
  const [tooltipDataCenterFacilityData, setTooltipDataCenterFacilityData] = useState(null);

  const handleMapLoaded = useMemo(
    () => () => {
      // Center the map initially based on the focused zone and the user geolocation.
      if (zoneId) {
        console.log(`Centering on zone ${zoneId}`);
        dispatchApplication('mapViewport', getCenteredZoneViewport(zones[zoneId]));
      } else if (callerLocation) {
        console.log(`Centering on browser location (${callerLocation})`);
        dispatchApplication('mapViewport', getCenteredLocationViewport(callerLocation));
      }

      // Map loading is finished, lower the overlay shield with
      // a bit of delay to allow the background to render first.
      setTimeout(() => {
        dispatchApplication('isLoadingMap', false);
      }, 100);

      // Track and notify that WebGL is supported.
      dispatchApplication('webGLSupported', true);
      if (thirdPartyServices._ga) {
        thirdPartyServices._ga.timingMark('map_loaded');
      }
    },
    [zones, zoneId, callerLocation],
  );

  const handleMapError = useMemo(
    () => () => {
      // Map loading is finished, lower the overlay shield.
      dispatchApplication('isLoadingMap', false);

      // Disable the map and redirect to zones ranking.
      dispatchApplication('webGLSupported', false);
      history.push({ pathname: '/ranking', search: location.search });
    },
    [history],
  );

  const handleMouseMove = useMemo(
    () => ({
      longitude,
      latitude,
      x,
      y,
    }) => {
      dispatchApplication(
        'solarColorbarValue',
        getValueAtPosition(longitude, latitude, solarData),
      );
      dispatchApplication(
        'windColorbarValue',
        calculateLengthFromDimensions(
          getValueAtPosition(longitude, latitude, windData && windData[0]),
          getValueAtPosition(longitude, latitude, windData && windData[1]),
        ),
      );
      setTooltipPosition({ x, y });
    },
    [solarData, windData],
  );

  const handleSeaClick = useMemo(
    () => () => {
      history.push({ pathname: '/map', search: location.search });
    },
    [history, location],
  );

  const handleDataFacilityCenterClick = useMemo(
    () => (data) => {
      if (data) {
        dispatchApplication('isDataCenterFacilitiesComparePanelComparisonOpen', false);
        dispatchApplication('leftPanelCurrentTab', LEFT_PANEL_TAB_DATA_CENTER_FACILITIES);
      }

      // NOTE: This is commented so that we can add the same Data Center for comparison, as we only get one from the API response
      // const dataCenterFacilityAlreadyExists = Boolean(dataCenterFacilitiesToCompare.find(entry => entry.dataCenterFacilityId === data.dataCenterFacilityId));
      // if (!dataCenterFacilityAlreadyExists) {
      //   setDataCenterFacilitiesToCompare(prevState => [...prevState, data]);
      // }

      setDataCenterFacilitiesToCompare(prevState => [...prevState, data]);
    },
    [],
  );

  const handleDataCenterFacilityMouseEnter = useMemo(
    () => (data) => {
      dispatchApplication(
        'dataCenterFacilityInfo',
         data
      );
      setTooltipDataCenterFacilityData(data);
    },
    [],
  );

  const handleDataCenterFacilityMouseLeave = useMemo(
    () => () => {
      dispatchApplication('dataCenterFacilityInfo', null);
      setTooltipDataCenterFacilityData(null);
    },
    [],
  );

  const handleZoneClick = useMemo(
    () => (id) => {
      trackEvent('countryClick');
      dispatchApplication('isDataCenterFacilitiesComparePanelCollapsed', true);
      dispatchApplication('leftPanelCurrentTab', LEFT_PANEL_TAB_ELECTRICITY_MAP);

      history.push({ pathname: `/zone/${id}`, search: location.search });
    },
    [trackEvent, history, location],
  );

  const handleZoneMouseEnter = useMemo(
    () => (data) => {
      dispatchApplication(
        'co2ColorbarValue',
        electricityMixMode === 'consumption'
          ? data.co2intensity
          : data.co2intensityProduction,
      );
      setTooltipZoneData(data);
    },
    [electricityMixMode],
  );

  const handleZoneMouseLeave = useMemo(
    () => () => {
      dispatchApplication('co2ColorbarValue', null);
      setTooltipZoneData(null);
    },
    [],
  );

  const handleViewportChange = useMemo(
    () => ({
      width,
      height,
      latitude,
      longitude,
      zoom,
    }) => {
      dispatchApplication('isMovingMap', true);
      dispatchApplication('mapViewport', {
        width,
        height,
        latitude,
        longitude,
        zoom,
      });
      // TODO: Try tying this to internal map state
      // somehow to remove the need for debouncing.
      debouncedReleaseMoving();
    },
    [],
  );

  const handleResize = useMemo(
    () => ({ width, height }) => {
      handleViewportChange({ ...viewport, width, height });
    },
    [viewport],
  );

  // Animate map transitions only after the map has been loaded.
  const transitionDuration = isLoadingMap ? 0 : 300;
  const hoveringEnabled = !isHoveringExchange && !isMobile;

  useEffect(() => {
    if (dataCenterFacilitiesToCompare) {
      dispatchApplication('allDataCenterFacilitiesToCompare', dataCenterFacilitiesToCompare);
    }
  }, [dataCenterFacilitiesToCompare])

  useEffect(() => {
    if (currentDataCenterFacilitiesToCompare) {
      setDataCenterFacilitiesToCompare(currentDataCenterFacilitiesToCompare);
    }
  }, [currentDataCenterFacilitiesToCompare])

  return (
    <React.Fragment>
      <div id="webgl-error" className={`flash-message ${!webGLSupported ? 'active' : ''}`}>
        <div className="inner">
          {__('misc.webgl-not-supported')}
        </div>
      </div>
      {tooltipPosition && tooltipZoneData && hoveringEnabled && (
        <MapCountryTooltip
          zoneData={tooltipZoneData}
          position={tooltipPosition}
          onClose={() => setTooltipZoneData(null)}
        />
      )}
      {tooltipPosition && tooltipDataCenterFacilityData && hoveringEnabled && (
        <DataCenterFacilityTooltip
          dataCenterFacilityData={tooltipDataCenterFacilityData}
          position={tooltipPosition}
          onClose={() => setTooltipDataCenterFacilityData(null)}
        />
      )}
      <ZoneMap
        dataCenterFacilities={dataCenterFacilities}
        hoveringEnabled={hoveringEnabled}
        onMapLoaded={handleMapLoaded}
        onMapError={handleMapError}
        onMouseMove={handleMouseMove}
        onResize={handleResize}
        onSeaClick={handleSeaClick}
        onViewportChange={handleViewportChange}
        onDataCenterFacilityClick={handleDataFacilityCenterClick}
        onDataCenterFacilityMouseEnter={handleDataCenterFacilityMouseEnter}
        onDataCenterFacilityMouseLeave={handleDataCenterFacilityMouseLeave}
        onZoneClick={handleZoneClick}
        onZoneMouseEnter={handleZoneMouseEnter}
        onZoneMouseLeave={handleZoneMouseLeave}
        scrollZoom={!isEmbedded}
        theme={theme}
        transitionDuration={transitionDuration}
        viewport={viewport}
        zones={zones}
      >
        <MapLayer component={ExchangeLayer} />
        <MapLayer component={WindLayer} />
        <MapLayer component={SolarLayer} />
      </ZoneMap>
    </React.Fragment>
  );
};
