import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';

import { dispatchApplication } from '../store';
import { usePageViewsTracker } from '../hooks/tracking';


const mapStateToProps = state => ({
  isDataCenterComparePanelCollapsed: state.application.isDataCenterComparePanelCollapsed,
  isDataCenterComparePanelComparisonOpen: state.application.isDataCenterComparePanelComparisonOpen
});

const DataCenterComparePanel = ({ isDataCenterComparePanelComparisonOpen }) => {
  const dataCentersToCompare = useSelector(state => state.application.allDataCentersToCompare);
  const [dataCenters, setDataCenters] = useState(null);

  usePageViewsTracker();

  const handleCompareButtonClick = () => {
    dispatchApplication('isDataCenterComparePanelComparisonOpen', !isDataCenterComparePanelComparisonOpen);
  };

  const handleTogglePanelButtonClick = () => {
    dispatchApplication('leftPanelCurrentTab', null);
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
    }
   }, [dataCenters])

  return (
    <div className="data-center-compare-panel">
      <div
        className="data-center-compare-panel__close-mobile"
        onClick={handleTogglePanelButtonClick}
        role="button"
        tabIndex="0"
      >
        <i className="material-icons">
          close
        </i>
      </div>

      {Array.isArray(dataCentersToCompare) && !dataCentersToCompare.length && (
        <h3 className="data-center-compare-panel__empty-content-title">
          No data centers selected.
        </h3>
      )}

      {Array.isArray(dataCentersToCompare) && Boolean(dataCentersToCompare.length) && (
        <>
          <div className="data-center-compare-panel__content">
            {isDataCenterComparePanelComparisonOpen ?
              (
                <>
                  <h3 className="data-center-compare-panel__title">
                    Data Center Comparison
                  </h3>
                  <table className="data-center-compare-panel__table">
                    <tr className="data-center-compare-panel__table-row">
                      <td>
                        &nbsp;
                      </td>
                      {dataCentersToCompare.map((dataCenter, index) => (
                        <th
                          key={index}
                          className="data-center-compare-panel__table-header data-center-compare-panel__table-header--uppercase"
                        >
                          {dataCenter.alias}
                        </th>
                      ))}
                    </tr>
                    <tr className="data-center-compare-panel__table-row">
                      <td className="data-center-compare-panel__table-column data-center-compare-panel__table-column--bold">
                        Energy Input Stream Topic
                      </td>
                      {dataCentersToCompare.map((dataCenter, index) => (
                        <td
                          key={index}
                          className="data-center-compare-panel__table-column"
                        >
                          {dataCenter.energyInputStreamTopic}
                        </td>
                      ))}
                    </tr>
                    <tr className="data-center-compare-panel__table-row">
                      <td className="data-center-compare-panel__table-column data-center-compare-panel__table-column--bold">
                        Energy Output Stream Topic
                      </td>
                      {dataCentersToCompare.map((dataCenter, index) => (
                        <td
                          key={index}
                          className="data-center-compare-panel__table-column"
                        >
                          {dataCenter.energyOutputStreamTopic}
                        </td>
                      ))}
                    </tr>
                    <tr className="data-center-compare-panel__table-row">
                      <td className="data-center-compare-panel__table-column data-center-compare-panel__table-column--bold">
                        Total Electrical Capacity
                      </td>
                      {dataCentersToCompare.map((dataCenter, index) => (
                        <td
                          key={index}
                          className="data-center-compare-panel__table-column"
                        >
                          {dataCenter.totalElectricalCapacity}
                        </td>
                      ))}
                    </tr>
                  </table>
                </>
              ) :
              (
                <>
                  <h3 className="data-center-compare-panel__title">
                    Selected Data Centers
                  </h3>
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
                          <h3 className="data-center-compare-panel__subtext data-center-compare-panel__subtext--uppercase">
                            {dataCenter.alias}
                          </h3>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )
            }
          </div>
          <button
            className="data-center-compare-panel__button"
            disabled={dataCentersToCompare.length < 2}
            onClick={handleCompareButtonClick}
          >
            {isDataCenterComparePanelComparisonOpen ? 'Go back' : 'Compare'}
          </button>
        </>
      )}
    </div>
  );
};

export default connect(mapStateToProps)(DataCenterComparePanel);
