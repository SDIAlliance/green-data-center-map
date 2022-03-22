import React from 'react';
import { connect, useSelector } from 'react-redux';

import { dispatchApplication } from '../store';
import { usePageViewsTracker } from '../hooks/tracking';


const mapStateToProps = state => ({
  isDataCenterComparePanelCollapsed: state.application.isDataCenterComparePanelCollapsed
});

const DataCenterComparePanel = ({ isDataCenterComparePanelCollapsed }) => {
  const dataCenters = useSelector(state => state.application.allDataCentersToCompare);

  usePageViewsTracker();

  const collapsedClass = isDataCenterComparePanelCollapsed ? 'data-center-compare-panel__collapsed' : '';

  return (
    <div className={`data-center-compare-panel ${collapsedClass}`}>
      <div
        className={`data-center-compare-panel__close ${collapsedClass}`}
        onClick={() => dispatchApplication('isDataCenterComparePanelCollapsed', true)}
        role="button"
        tabIndex="0"
      >
        <i className="material-icons">
          close
        </i>
      </div>

      {Array.isArray(dataCenters) && Boolean(dataCenters.length) && (
        <>
          <div className="data-center-compare-panel__content">
            {dataCenters.map(dataCenter => (
              <div
                key={dataCenter.id}
                className="data-center-compare-panel__data-center-box"
              >
                <div
                  className="data-center-compare-panel__remove-data-center"
                  onClick={() => dispatchApplication('allDataCentersToCompare', dataCenters.splice(dataCenter.id, 1))}
                  role="button"
                  tabIndex="0"
                >
                  <i className="material-icons">
                    close
                  </i>
                </div>
                {Boolean(dataCenter.alias) && (
                  <div className="data-center-compare-panel__row">
                    <div className="data-center-compare-panel__headline">
                      Name
                    </div>
                    <div className="data-center-compare-panel__subtext">
                      {dataCenter.alias}
                    </div>
                  </div>
                )}
                {dataCenter.totalElectricalCapacity >= 0 && (
                  <div className="data-center-compare-panel__row">
                    <div className="data-center-compare-panel__headline">
                      Total Electrical Capacity
                    </div>
                    <div className="data-center-compare-panel__subtext">
                      {dataCenter.totalElectricalCapacity}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="data-center-compare-panel__button"
            disabled={dataCenters.length < 2}
          >
            Compare
          </button>
        </>
      )}
    </div>
  );
};

export default connect(mapStateToProps)(DataCenterComparePanel);
