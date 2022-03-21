import React from 'react';

import { __ } from '../../helpers/translation';
import styled from 'styled-components';

import Tooltip from '../tooltip';
import { ZoneName } from './common';

const CountryTableHeaderInner = styled.div`
  display: flex;
  flex-basis: 33.3%;
  justify-content: space-between;
`;

const TooltipContent = React.memo(
  ({ data }) => {
    if (!data) {
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

    const {
      totalElectricalCapacity
    } = data;

    return (
      <div className="zone-details">
        <CountryTableHeaderInner>
          <div className="data-center-row data-center-wrap">
            {totalElectricalCapacity >= 0 && (
              <>
                <div className="data-center-row-headline">
                  Total Electrical Capacity
                </div>
                <div className="data-center-row-subtext">
                  {totalElectricalCapacity}
                </div>
              </>
            )}
          </div>
        </CountryTableHeaderInner>
      </div>
    );
  }
);

const DataCenterTooltip = ({ dataCenterData, onClose, position }) => {
  if (!dataCenterData) return null;

  return (
    <Tooltip
      id="data-center-tooltip"
      position={position}
      onClose={onClose}
    >
      <div className="zone-name-header">
        <ZoneName
          ellipsify
          zone={dataCenterData.alias}
        />
      </div>
      <TooltipContent data={dataCenterData} />
    </Tooltip>
  );
};

export default DataCenterTooltip;
