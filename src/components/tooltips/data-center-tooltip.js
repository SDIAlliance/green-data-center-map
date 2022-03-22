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

    const {
      totalElectricalCapacity
    } = data;

    return (
      <div className="data-center-wrap">
        {totalElectricalCapacity >= 0 && (
          <div className="data-center-wrap__row">
            <div className="data-center-wrap__headline">
              Total Electrical Capacity
            </div>
            <div className="data-center-wrap__description">
              {totalElectricalCapacity}
            </div>
          </div>
        )}
      </div>
    );
  }
);

const DataCenterTooltip = ({ dataCenterData, onClose, position }) => {
  if (!dataCenterData) return null;

  return (
    <Tooltip
      position={position}
      onClose={onClose}
    >
      <div>
        {dataCenterData.alias}
      </div>
      <TooltipContent data={dataCenterData} />
    </Tooltip>
  );
};

export default DataCenterTooltip;
