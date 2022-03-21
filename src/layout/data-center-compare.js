/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
// TODO: re-enable rules

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { dispatchApplication } from '../store';
import { usePageViewsTracker } from '../hooks/tracking';
import { useSmallLoaderVisible } from '../hooks/redux';
import LastUpdatedTime from '../components/lastupdatedtime';


// TODO: Move all styles from styles.css to here

const SmallLoader = styled.span`
  background: transparent url(${resolvePath('images/loading/loading64_FA.gif')}) no-repeat center center;
  background-size: 1.5em;
  display: inline-block;
  margin-right: 1em;
  width: 1.5em;
  height: 1em;
`;

const mapStateToProps = state => ({
  isDataCenterCompareCollapsed: state.application.isDataCenterCompareCollapsed
});


const DataCenterCompareCollapseButton = styled.div`
@media (max-width: 767px) {
  display: none !important;
}
`;

const MobileHeader = styled.div`
@media (min-width: 768px) {
  display: none !important;
}
`;

const RightHeader = styled.div`
@media (min-width: 768px) {
  display: none !important;
}
`;

// Hide the panel completely if looking at the map on small screens.
const Container = styled.div`
  @media (max-width: 767px) {
    display: ${props => props.pathname === '/map' ? 'none !important': 'flex'};
  }
`;

const DataCenterCompare = ({ dataCenters, isDataCenterCompareCollapsed }) => {
  const isLoaderVisible = useSmallLoaderVisible();

  usePageViewsTracker();

  // TODO: Do this better when <Switch> is pulled up the hierarchy.
  const collapsedClass = isDataCenterCompareCollapsed ? 'collapsed' : '';

  return (
    <Container className={`panel data-center-left-panel ${collapsedClass}`}>
      <MobileHeader id="mobile-header" className="brightmode">
        <div className="header-content">
          <div className="logo">
            <div className="image" id="electricitymap-logo" />
          </div>
          <RightHeader className="right-header">
            {isLoaderVisible && <SmallLoader />}
            <LastUpdatedTime />
          </RightHeader>
        </div>
      </MobileHeader>

      <DataCenterCompareCollapseButton
        id="data-center-compare-collapse-button"
        className={`${collapsedClass}`}
        onClick={() => dispatchApplication('isDataCenterCompareCollapsed', true)}
        role="button"
        tabIndex="0"
      >
        <i className="material-icons">close</i>
      </DataCenterCompareCollapseButton>

      {Array.isArray(dataCenters) && Boolean(dataCenters.length) && dataCenters.map(dataCenter => (
        <div key={dataCenter.id}>
          {Boolean(dataCenter.alias) && (
            <>
              <div className="data-center-row-headline">
                Name
              </div>
              <div className="data-center-row-subtext">
                {dataCenter.alias}
              </div>
            </>
          )}
          {dataCenter.totalElectricalCapacity >= 0 && (
            <>
              <div className="data-center-row-headline">
                Total Electrical Capacity
              </div>
              <div className="data-center-row-subtext">
                {dataCenter.totalElectricalCapacity}
              </div>
            </>
          )}
        </div>
      ))}
    </Container>
  );
};

export default connect(mapStateToProps)(DataCenterCompare);
