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

    return (
      <div className="data-center-wrap">
        {Object.keys(data).map((entry, index) => {
          if (!data[entry].showInTooltip) return null;

          return (
            <div
              key={index}
              className="data-center-wrap__row"
            >
              <div className="data-center-wrap__headline">
                {data[entry].label}
              </div>
              <div className="data-center-wrap__description">
                {data[entry].value}
              </div>
            </div>
            )
        })}
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
      <h4>
        {dataCenterData.alias.value}
      </h4>
      <TooltipContent data={dataCenterData} />
    </Tooltip>
  );
};

export default DataCenterTooltip;
