/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
// TODO(olc): re-enable this rule

import React from 'react';
import styled from 'styled-components';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// Layout
import Header from './header';
import LayerButtons from './layerbuttons';
import LeftPanel from './leftpanel';
import Legend from './legend';
import Tabs from './tabs';
import Map from './map';

// Modules
import { __ } from '../helpers/translation';
import { isNewClientVersion } from '../helpers/environment';
import { useCustomDatetime, useHeaderVisible } from '../hooks/router';
import { useLoadingOverlayVisible } from '../hooks/redux';
import {
  useGridDataPolling,
  useRequestDataCenterFacilities
} from '../hooks/fetch';
import OnboardingModal from '../components/onboardingmodal';
import LoadingOverlay from '../components/loadingoverlay';
import useSWR from 'swr';
import ErrorBoundary from '../components/errorboundary';

const CLIENT_VERSION_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

// TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const mapStateToProps = state => ({
  brightModeEnabled: state.application.brightModeEnabled,
  electricityMixMode: state.application.electricityMixMode,
  hasConnectionWarning: state.data.hasConnectionWarning,
  hasGridZonesError: state.data.hasGridZonesError,
});

const MapContainer = styled.div`
  @media (max-width: 767px) {
    display: ${props => props.pathname !== '/map' ? 'none !important' : 'block' };
  }
`;

const fetcher = (...args) => fetch(...args).then(res => res.json())

const Main = ({
  hasConnectionWarning,
  hasGridZonesError
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const datetime = useCustomDatetime();
  const headerVisible = useHeaderVisible();
  const clientType = useSelector(state => state.application.clientType);
  const isLocalhost = useSelector(state => state.application.isLocalhost);

  const showLoadingOverlay = useLoadingOverlayVisible();

  // Start grid data polling as soon as the app is mounted.
  useGridDataPolling();

  // Fetch data centers data as soon as the app is mounted
  useRequestDataCenterFacilities()

  const { data: clientVersionData } = useSWR('/clientVersion', fetcher, {refreshInterval: CLIENT_VERSION_CHECK_INTERVAL})
  const clientVersion = clientVersionData && clientVersionData.version;

  let isClientVersionOutdated = false;
  // We only check the latest client version if running in browser on non-localhost.
  if (clientVersion && clientType === 'web' && !isLocalhost) {
    isClientVersionOutdated = isNewClientVersion(clientVersion);
  }

  return (
    <React.Fragment>
      <div
        style={{
          position: 'fixed', /* This is done in order to ensure that dragging will not affect the body */
          width: '100vw',
          height: 'inherit',
          display: 'flex',
          flexDirection: 'column', /* children will be stacked vertically */
          alignItems: 'stretch', /* force children to take 100% width */
        }}
      >
        {headerVisible && <Header />}
        <div id="inner">
          <ErrorBoundary>
          <LoadingOverlay visible={showLoadingOverlay} />
          <LeftPanel />
            <MapContainer pathname={location.pathname} id="map-container">
              <Map />
              <Legend />
              {/* Not used right now */}
              {/* <div className="controls-container">
                <Toggle
                  infoHTML={__('tooltips.cpinfo')}
                  onChange={value => dispatchApplication('electricityMixMode', value)}
                  options={[
                    { value: 'production', label: __('tooltips.production') },
                    { value: 'consumption', label: __('tooltips.consumption') },
                  ]}
                  value={electricityMixMode}
                />
              </div> */}
              <LayerButtons />
            </MapContainer>
          </ErrorBoundary>

          <div id="connection-warning" className={`flash-message ${hasConnectionWarning ? 'active' : ''}`}>
            <div className="inner">
              {__('misc.oops')}
              {' '}
              <a
                href=""
                onClick={(e) => {
                  dispatch({ type: 'GRID_ZONES_FETCH_REQUESTED', payload: { datetime } });
                  e.preventDefault();
                }}
              >
                {__('misc.retrynow')}
              </a>
              .
            </div>
          </div>
          <div className={`error-wrapper flash-message ${hasGridZonesError ? 'active' : ''}`}>
            <div className="inner">
              {__('grid.fetch-error')}
            </div>
          </div>
          <div id="new-version" className={`flash-message ${isClientVersionOutdated ? 'active' : ''}`}>
            <div className="inner">
              <span dangerouslySetInnerHTML={{ __html: __('misc.newversion') }} />
            </div>
          </div>

          { /* end #inner */}
        </div>
        <Tabs />
      </div>
      <OnboardingModal />
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(Main);
