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
    console.log(data);
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

    return (
      <div className="zone-details">
        <CountryTableHeaderInner>
          <div className="data-center-row data-center-wrap">
            <div className="data-center-row-headline">ID</div>
            <div className="data-center-row-subtext">
              {data}
            </div>
          </div>
        </CountryTableHeaderInner>
      </div>
    );
  }
);

const DataCenterTooltip = ({ position, dataCenterData, onClose }) => {
  if (!dataCenterData) return null;

  const { id } = dataCenterData;

  return (
    <Tooltip id="data-center-tooltip" position={position} onClose={onClose}>
      <div className="zone-name-header">
        <ZoneName zone="Data center" ellipsify />
      </div>
      <TooltipContent
        data={id}
      />
    </Tooltip>
  );
};

export default DataCenterTooltip;
