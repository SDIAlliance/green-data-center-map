/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/jsx-no-target-blank */
// TODO: re-enable rules

import React, { useEffect } from 'react';
import {
  Redirect,
  Link,
  useLocation,
  useParams
} from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { isNil } from 'lodash';
import moment from 'moment';
import styled from 'styled-components';

// Components
import CarbonIntensitySquare from '../../components/carbonintensitysquare';

// Modules
import { flagUri } from '../../helpers/flags';
import { getFullZoneName, __ } from '../../helpers/translation';
import EstimatedLabel from '../../components/countryestimationlabel';

// TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const mapStateToProps = state => ({
  electricityMixMode: state.application.electricityMixMode,
  isMobile: state.application.isMobile,
  tableDisplayEmissions: state.application.tableDisplayEmissions,
  zones: state.data.grid.zones,
});

const SocialButtons = styled.div`
  @media (min-width: 768px) {
    display: none !important;
  }
`;

const Flag = styled.img`
  vertical-align: bottom;
  padding-right: .8rem;
`;

const CountryTime = styled.div`
  white-space: nowrap;
`;

const CountryNameTime = styled.div`
  font-size: smaller;
  margin-left: 25px;
`;

const CountryNameTimeTable = styled.div`
  display: flex;
  justify-content: space-between;
  margin-left: 1.2rem;
`;
const CountryPanelWrap = styled.div`
  overflow-y: scroll;
  padding: 0 1.5rem;

  @media (max-width: 767px) {
    position: relative;
    padding-top: 0;
    overflow: hidden;
  }
`;

const CountryTableHeaderInner = styled.div`
  display: flex;
  gap: 20px;
  padding-left: 1.25em;
  padding-right: 1.25em;
`;

const CountryPanelStyled = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  margin: 0;
  flex: 1 1 0px;

  @media (max-width: 767px) {
    margin: 0;
    display: block;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    -moz-user-select: none; /* Selection disabled on firefox to avoid android "select all" button popping up when pressing graphs */
    margin-bottom: 60px; /* height of .zone-time-slider plus padding*/
  }
`;

const CountryPanel = ({
  electricityMixMode,
  isMobile,
  zones,
}) => {
  const location = useLocation();
  const { zoneId } = useParams();

  // Get current zone carbon intensity from store
  const currentZoneData = useSelector((state) => state.data.grid.zones[zoneId]);

  const data = {};

  const parentPage = {
    pathname: '/map',
    search: location.search,
  };

  // Back button keyboard navigation
  useEffect(
    () => {
      const keyHandler = (e) => {
        if (e.key === 'Backspace' || e.key === '/') {
          history.push(parentPage);
        }
      };
      document.addEventListener('keyup', keyHandler);
      return () => {
        document.removeEventListener('keyup', keyHandler);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history],
  );

  // Redirect to the parent page if the zone is invalid.
  if (!zones[zoneId]) {
    return <Redirect to={parentPage} />;
  }

  const { hasData, estimationMethod } = data;
  const isDataEstimated = !isNil(estimationMethod);

  const datetime = currentZoneData.datetime || data.stateDatetime || data.datetime;
  const zoneCarbonIntensityData = currentZoneData.co2intensity;
  const co2Intensity = electricityMixMode === 'consumption'
    ? data.co2intensity
    : data.co2intensityProduction;

  return (
    <CountryPanelStyled>
      <div id="country-table-header">
        <div className="left-panel-zone-details-toolbar">
          <Link to={parentPage}>
            <span className="left-panel-back-button">
              <i className="material-icons" aria-hidden="true">arrow_back</i>
            </span>
          </Link>
          <CountryNameTime>
            <CountryNameTimeTable>
              <div>
                <Flag id="country-flag" alt="" src={flagUri(zoneId, 24)} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div className="country-name">{getFullZoneName(zoneId)}</div>
                <CountryTime>
                  {datetime ? moment(datetime).format('LL LT') : ''}
                  {isDataEstimated && <EstimatedLabel isMobile={isMobile} />}
                </CountryTime>
              </div>
            </CountryNameTimeTable>
          </CountryNameTime>
        </div>

        {Boolean(zoneCarbonIntensityData) && (
          <CountryTableHeaderInner>
            <CarbonIntensitySquare value={zoneCarbonIntensityData || co2Intensity} withSubtext />
          </CountryTableHeaderInner>
        )}
      </div>

      <CountryPanelWrap>
        {!hasData && !zoneCarbonIntensityData && (
          <div className="zone-details-no-parser-message">
            <span dangerouslySetInnerHTML={{ __html: __('country-panel.noParserInfo', 'https://github.com/tmrowco/electricitymap-contrib/wiki/Getting-started') }} />
          </div>
        )}

        <SocialButtons className="social-buttons">
          <div>
            { /* Facebook share */}
            <div
              className="fb-share-button"
              data-href="https://app.greendatacentermap.com/"
              data-layout="button_count"
            />
            { /* Twitter share */}
            <a
              className="twitter-share-button"
              data-url="https://app.greendatacentermap.com"
              data-via="electricitymap"
              data-lang={locale}
            />
            { /* Slack */}
            <span className="slack-button">
              <a href="https://slack.tmrow.com" target="_blank" className="slack-btn">
                <span className="slack-ico" />
                <span className="slack-text">Slack</span>
              </a>
            </span>
          </div>
        </SocialButtons>
      </CountryPanelWrap>
    </CountryPanelStyled>
  );
};

export default connect(mapStateToProps)(CountryPanel);
