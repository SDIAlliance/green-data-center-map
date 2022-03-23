/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
// TODO: re-enable rules

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  Redirect,
  useLocation,
} from 'react-router-dom';

import { dispatchApplication } from '../../store';
import { useSearchParams } from '../../hooks/router';
import { usePageViewsTracker } from '../../hooks/tracking';
import DataCenterFacilitiesComparePanel from '../data-center-facilities-compare-panel';

import FAQPanel from './faqpanel';
import MobileInfoTab from './mobileinfotab';
import ZoneDetailsPanel from './zonedetailspanel';
import ZoneListPanel from './zonelistpanel';

import { LEFT_PANEL_TAB_DATA_CENTER_FACILITIES, LEFT_PANEL_TAB_ELECTRICITY_MAP } from '../../reducers';

const HandleLegacyRoutes = () => {
  const searchParams = useSearchParams();

  const page = (searchParams.get('page') || 'map')
    .replace('country', 'zone')
    .replace('highscore', 'ranking');
  searchParams.delete('page');

  const zoneId = searchParams.get('countryCode');
  searchParams.delete('countryCode');

  return (
    <Redirect
      to={{
        pathname: zoneId ? `/zone/${zoneId}` : `/${page}`,
        search: searchParams.toString(),
      }}
    />
  );
};

// TODO: Move all styles from styles.css to here

const mapStateToProps = state => ({
  isDataCenterFacilitiesComparePanelComparisonOpen: state.application.isDataCenterFacilitiesComparePanelComparisonOpen,
  leftPanelCurrentTab: state.application.leftPanelCurrentTab,
});

const LeftPanelCollapseButton = styled.div`
@media (max-width: 767px) {
  display: none !important;
}
`;

const MobileHeader = styled.div`
@media (min-width: 768px) {
  display: none !important;
}
`;

// Hide the panel completely if looking at the map on small screens.
const Container = styled.div`
  @media (max-width: 767px) {
    display: ${props => props.pathname === '/map' && props.currentTab === LEFT_PANEL_TAB_ELECTRICITY_MAP ? 'none !important': 'flex'};

    ~ #map-container {
      display: ${props => props.currentTab === LEFT_PANEL_TAB_DATA_CENTER_FACILITIES ? 'none !important': 'block'};
    }
  }
`;

const LeftPanel = ({ isDataCenterFacilitiesComparePanelComparisonOpen, leftPanelCurrentTab }) => {
  const defaultTabToggle = useRef(null);
  const dataCenterFacilitiesComparisonTabToggle = useRef(null);
  const location = useLocation();

  const collapsedClass = 'collapsed';

  usePageViewsTracker();

  const handleDefaultToggleButtonClick = () => {
    dispatchApplication('leftPanelCurrentTab', leftPanelCurrentTab === LEFT_PANEL_TAB_ELECTRICITY_MAP ? null : LEFT_PANEL_TAB_ELECTRICITY_MAP);
  }

  const handleDataCenterFacilitiesTogglePanelButtonClick = () => {
    dispatchApplication('leftPanelCurrentTab', leftPanelCurrentTab === LEFT_PANEL_TAB_DATA_CENTER_FACILITIES ? null : LEFT_PANEL_TAB_DATA_CENTER_FACILITIES);
  }

  useEffect(() => {
    if (leftPanelCurrentTab === LEFT_PANEL_TAB_ELECTRICITY_MAP) {
      defaultTabToggle.current.classList.remove('inactive');
      defaultTabToggle.current.classList.remove(collapsedClass);

      dataCenterFacilitiesComparisonTabToggle.current.classList.add('inactive');
      dataCenterFacilitiesComparisonTabToggle.current.classList.remove(collapsedClass);
    }
    else if (leftPanelCurrentTab === LEFT_PANEL_TAB_DATA_CENTER_FACILITIES) {
      defaultTabToggle.current.classList.add('inactive');
      defaultTabToggle.current.classList.remove(collapsedClass);

      dataCenterFacilitiesComparisonTabToggle.current.classList.remove('inactive');
      dataCenterFacilitiesComparisonTabToggle.current.classList.remove(collapsedClass);
    } else {
      defaultTabToggle.current.classList.add(collapsedClass);
      defaultTabToggle.current.classList.remove('inactive');

      dataCenterFacilitiesComparisonTabToggle.current.classList.add(collapsedClass);
      dataCenterFacilitiesComparisonTabToggle.current.classList.remove('inactive');
    }
  }, [leftPanelCurrentTab])

  const expandPanel = isDataCenterFacilitiesComparePanelComparisonOpen && leftPanelCurrentTab === LEFT_PANEL_TAB_DATA_CENTER_FACILITIES;

  return (
    <Container
      className={`panel left-panel${expandPanel ? ' left-panel--expanded' : ''}${!leftPanelCurrentTab ? ` ${collapsedClass}` : ''}`}
      currentTab={leftPanelCurrentTab}
      pathname={location.pathname}
    >
      <MobileHeader id="mobile-header" className="brightmode">
        <div className="header-content">
          <div className="logo">
            <div className="image" id="electricitymap-logo" />
          </div>
          <div className="sdia-logo">
            <div className="image" id="sdia-logo" />
          </div>
        </div>
      </MobileHeader>

      <LeftPanelCollapseButton
        ref={defaultTabToggle}
        id="left-panel-collapse-button"
        className={collapsedClass}
        role="button"
        tabIndex="0"
        onClick={handleDefaultToggleButtonClick}
      >
        <i className="material-icons">
          wb_sunny
        </i>
      </LeftPanelCollapseButton>

      <LeftPanelCollapseButton
        ref={dataCenterFacilitiesComparisonTabToggle}
        id="left-panel-collapse-button"
        className={`data-center-facilities ${collapsedClass}`}
        role="button"
        tabIndex="0"
        onClick={handleDataCenterFacilitiesTogglePanelButtonClick}
      >
        <i className="material-icons">
          storage
        </i>
      </LeftPanelCollapseButton>

      {leftPanelCurrentTab === LEFT_PANEL_TAB_DATA_CENTER_FACILITIES ?
        (
          <DataCenterFacilitiesComparePanel />
        ) :
        (
          <>
              {/* Render different content based on the current route */}
              <Switch>
              <Route exact path="/" component={HandleLegacyRoutes} />
              <Route path="/map" component={ZoneListPanel} />
              <Route path="/ranking" component={ZoneListPanel} />
              <Route path="/zone/:zoneId" component={ZoneDetailsPanel} />
              <Route path="/info" component={MobileInfoTab} />
              <Route path="/faq" component={FAQPanel} />
              {/* TODO: Consider adding a 404 page  */}
            </Switch>
          </>
        )
      }
    </Container>
  );
};

export default connect(mapStateToProps)(LeftPanel);
