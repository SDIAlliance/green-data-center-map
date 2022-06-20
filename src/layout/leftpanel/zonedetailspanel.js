/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-has-content */
// TODO: re-enable rules
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import CountryPanel from './countrypanel';
import { useLocation } from 'react-router-dom';

const mapStateToProps = (state) => ({
  selectedZoneTimeIndex: state.application.selectedZoneTimeIndex,
});

const SocialButtons = styled.div`
  @media (max-width: 767px) {
    display: ${(props) => (props.pathname !== '/map' ? 'none !important' : 'block')};
  }
`;

const ZoneDetailsPanel = () => {
  const location = useLocation();

  return (
    <div className="left-panel-zone-details">
      <CountryPanel />
      <div className="detail-bottom-section">
        <SocialButtons className="social-buttons" pathname={location.pathname}>
          <div>
            {/* Facebook share */}
            <div
              className="fb-share-button"
              data-href="https://app.greendatacentermap.com/"
              data-layout="button_count"
            />
            {/* Twitter share */}
            <a
              className="twitter-share-button"
              data-url="https://app.greendatacentermap.com"
              data-via="electricitymap"
              data-lang={locale}
            />
            {/* Slack */}
            <span className="slack-button">
              <a href="https://slack.tmrow.com" target="_blank" className="slack-btn">
                <span className="slack-ico" />
                <span className="slack-text">Slack</span>
              </a>
            </span>
          </div>
        </SocialButtons>
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(ZoneDetailsPanel);
