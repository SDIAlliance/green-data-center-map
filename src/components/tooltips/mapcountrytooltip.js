import React from 'react';
import { useSelector } from 'react-redux';

import { __ } from '../../helpers/translation';
import styled from 'styled-components';

import CircularGauge from '../circulargauge';
import CarbonIntensitySquare from '../carbonintensitysquare';
import Tooltip from '../tooltip';
import { ZoneName } from './common';

const CountryTableHeaderInner = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const TooltipContent = React.memo(
  ({ isDataDelayed, hasData, co2intensity, fossilFuelPercentage, renewablePercentage }) => {
    if (!hasData) {
      return (
        <div className="no-parser-text">
          <span
            dangerouslySetInnerHTML={{
              __html: __(
                'tooltips.noParserInfo',
                'https://github.com/tmrowco/electricitymap-contrib/wiki/Getting-started'
              ),
            }}
          />
        </div>
      );
    }
    if (!co2intensity) {
      if (isDataDelayed) {
        return <div className="temporary-outage-text">{__('tooltips.dataIsDelayed')}</div>;
      }
      return <div className="temporary-outage-text">{__('tooltips.temporaryDataOutage')}</div>;
    }
    return (
      <div className="zone-details">
        <CountryTableHeaderInner>
          {Boolean(co2intensity) && (
            <CarbonIntensitySquare value={co2intensity} />
          )}
          {Boolean(fossilFuelPercentage) && (
            <div className="country-col country-lowcarbon-wrap">
              <div id="tooltip-country-lowcarbon-gauge" className="country-gauge-wrap">
                <CircularGauge percentage={fossilFuelPercentage} />
              </div>
              <div className="country-col-headline">{__('country-panel.lowcarbon')}</div>
              <div className="country-col-subtext" />
            </div>
          )}
          {Boolean(renewablePercentage) && (
             <div className="country-col country-renewable-wrap">
              <div id="tooltip-country-renewable-gauge" className="country-gauge-wrap">
                <CircularGauge percentage={renewablePercentage} />
              </div>
              <div className="country-col-headline">{__('country-panel.renewable')}</div>
            </div>
          )}
        </CountryTableHeaderInner>
      </div>
    );
  }
);

const MapCountryTooltip = ({ position, zoneData, onClose }) => {
  const electricityMixMode = useSelector(state => state.application.electricityMixMode);

  if (!zoneData) return null;

  const isDataDelayed = zoneData.delays && zoneData.delays.production;

  const co2intensity =
    electricityMixMode === 'consumption' ? zoneData.co2intensity : zoneData.co2intensityProduction;

  const fossilFuelRatio =
    electricityMixMode === 'consumption'
      ? zoneData.fossilFuelRatio
      : zoneData.fossilFuelRatioProduction;
  const fossilFuelPercentage =
    fossilFuelRatio !== null ? Math.round(100 * (1 - fossilFuelRatio)) : '?';

  const renewableRatio =
    electricityMixMode === 'consumption'
      ? zoneData.renewableRatio
      : zoneData.renewableRatioProduction;
  const renewablePercentage = renewableRatio !== null ? Math.round(100 * renewableRatio) : '?';

  return (
    <Tooltip id="country-tooltip" position={position} onClose={onClose}>
      <div className="zone-name-header">
        <ZoneName zone={zoneData.countryCode} ellipsify />
      </div>
      <TooltipContent
        hasData={zoneData.hasData}
        isDataDelayed={isDataDelayed}
        co2intensity={co2intensity}
        fossilFuelPercentage={fossilFuelPercentage}
        renewablePercentage={renewablePercentage}
      />
    </Tooltip>
  );
};

export default MapCountryTooltip;
