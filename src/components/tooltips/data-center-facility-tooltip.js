import React from 'react';

import { __ } from '../../helpers/translation';

import Tooltip from '../tooltip';

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

    const tooltipData = [
      {
        label: 'Energy Input Stream Topic',
        value: data.energyInputStreamTopic
      },
      {
        label: 'Energy Output Stream Topic',
        value: data.energyOutputStreamTopic
      },
      {
        label: 'Total Electrical Capacity',
        value: data.totalElectricalCapacity
      }
    ];

    return (
      <>
        {tooltipData.map((entry, index) => (
            <div
              key={index}
              className="data-center-facility-wrap__row"
            >
              <div className="data-center-facility-wrap__headline">
                {entry.label}
              </div>
              <div className="data-center-facility-wrap__description">
                {entry.value}
              </div>
            </div>
        ))}
      </>
    );
  }
);

const DataCenterFacilityTooltip = ({ dataCenterFacilityData, onClose, position }) => {
  if (!dataCenterFacilityData) return null;

  return (
    <Tooltip
      position={position}
      onClose={onClose}
    >
      <div className="data-center-facility-wrap">
        <h3 className="data-center-facility-wrap__title">
          {dataCenterFacilityData.alias}
        </h3>
        <TooltipContent data={dataCenterFacilityData} />
      </div>
    </Tooltip>
  );
};

export default DataCenterFacilityTooltip;
