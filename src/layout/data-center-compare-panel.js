import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';

import { dispatchApplication } from '../store';
import { usePageViewsTracker } from '../hooks/tracking';


const mapStateToProps = state => ({
  isDataCenterComparePanelCollapsed: state.application.isDataCenterComparePanelCollapsed
});

const DataCenterComparePanel = ({ isDataCenterComparePanelCollapsed }) => {
  const dataCentersToCompare = useSelector(state => state.application.allDataCentersToCompare);
  const [dataCenters, setDataCenters] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  usePageViewsTracker();

  const collapsedClass = isDataCenterComparePanelCollapsed ? 'data-center-compare-panel__collapsed' : '';

  const handleCompareButtonClick = () => {
    setShowComparison(prevState => !prevState);
  };

  const handleCloseButtonClick = () => {
    dispatchApplication('isDataCenterComparePanelCollapsed', true);
    setShowComparison(false);
  };

  const handleRemoveDataCenterClick = (index) => {
    if (Array.isArray(dataCentersToCompare)) {
      const copyOfDataCentersToCompare = dataCentersToCompare.slice();

      copyOfDataCentersToCompare.splice(index, 1);
      setDataCenters(copyOfDataCentersToCompare);
    }
  }

  useEffect(() => {
    if (dataCenters) {
      dispatchApplication('allDataCentersToCompare', dataCenters);

      if (!dataCenters.length) {
        dispatchApplication('isDataCenterComparePanelCollapsed', true);
        setShowComparison(false);
      }
    }
   }, [dataCenters])

  return (
    <div className={`data-center-compare-panel ${collapsedClass}`}>
      <div
        className={`data-center-compare-panel__close ${collapsedClass}`}
        onClick={handleCloseButtonClick}
        role="button"
        tabIndex="0"
      >
        <i className="material-icons">
          close
        </i>
      </div>

      {Array.isArray(dataCentersToCompare) && Boolean(dataCentersToCompare.length > 0) && (
        <>
          <div className="data-center-compare-panel__content">
            {showComparison ?
            (
              <div>
                Data Center Comparison
              </div>
            ) :
            (
              <>
                {dataCentersToCompare.map((dataCenter, index) => (
                  <div
                    key={dataCenter.id}
                    className="data-center-compare-panel__data-center-box"
                  >
                    <div
                      className="data-center-compare-panel__remove-data-center"
                      onClick={() => handleRemoveDataCenterClick(index)}
                      role="button"
                      tabIndex="0"
                    >
                      <i className="material-icons">
                        close
                      </i>
                    </div>
                    {Boolean(dataCenter.alias) && (
                      <div className="data-center-compare-panel__row">
                        <h3 className="data-center-compare-panel__subtext">
                          {dataCenter.alias.value}
                        </h3>
                      </div>
                    )}
                    {dataCenter.total_electrical_capacity.value >= 0 && (
                      <div className="data-center-compare-panel__row">
                        <div className="data-center-compare-panel__headline">
                          Total Electrical Capacity
                        </div>
                        <div className="data-center-compare-panel__subtext">
                          {dataCenter.total_electrical_capacity.value}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          <button
            className="data-center-compare-panel__button"
            disabled={dataCentersToCompare.length < 2}
            onClick={handleCompareButtonClick}
          >
            {showComparison ? 'Go back' : 'Compare'}
          </button>
        </>
      )}
    </div>
  );
};

export default connect(mapStateToProps)(DataCenterComparePanel);
