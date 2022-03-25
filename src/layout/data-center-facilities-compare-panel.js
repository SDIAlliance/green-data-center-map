import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';

import { dispatchApplication } from '../store';
import { usePageViewsTracker } from '../hooks/tracking';


const mapStateToProps = state => {
  const {
    isDataCenterFacilitiesComparePanelCollapsed,
    isDataCenterFacilitiesComparePanelComparisonOpen
  } = state.application;

  return {
    isDataCenterFacilitiesComparePanelCollapsed,
    isDataCenterFacilitiesComparePanelComparisonOpen
  };
};

const DataCenterFacilitiesComparePanel = ({ isDataCenterFacilitiesComparePanelComparisonOpen }) => {
  const dataCenterFacilitiesToCompare = useSelector(state => state.application.allDataCenterFacilitiesToCompare);
  const [dataCenterFacilities, setDataCenterFacilities] = useState(null);

  usePageViewsTracker();

  const handleCompareButtonClick = () => {
    dispatchApplication('isDataCenterFacilitiesComparePanelComparisonOpen', !isDataCenterFacilitiesComparePanelComparisonOpen);
  };

  const handleTogglePanelButtonClick = () => {
    dispatchApplication('leftPanelCurrentTab', null);
  };

  const handleRemoveDataCenterFacilityClick = (index) => {
    if (Array.isArray(dataCenterFacilitiesToCompare)) {
      const copyOfDataCenterFacilitiesToCompare = dataCenterFacilitiesToCompare.slice();

      copyOfDataCenterFacilitiesToCompare.splice(index, 1);
      setDataCenterFacilities(copyOfDataCenterFacilitiesToCompare);
    }
  }

  useEffect(() => {
    if (dataCenterFacilities) {
      dispatchApplication('allDataCenterFacilitiesToCompare', dataCenterFacilities);
    }
   }, [dataCenterFacilities])

   useEffect(() => {
    if (Array.isArray(dataCenterFacilitiesToCompare) && dataCenterFacilitiesToCompare.length <= 1) {
      dispatchApplication('isDataCenterFacilitiesComparePanelComparisonOpen', false);
    }
   }, [dataCenterFacilitiesToCompare])

  return (
    <div className="data-center-facilities-compare-panel">
      <div
        className="data-center-facilities-compare-panel__close-mobile"
        onClick={handleTogglePanelButtonClick}
        role="button"
        tabIndex="0"
      >
        <i className="material-icons">
          close
        </i>
      </div>

      {Array.isArray(dataCenterFacilitiesToCompare) && !dataCenterFacilitiesToCompare.length && (
        <h3 className="data-center-facilities-compare-panel__empty-content-title">
          No data center facilities selected.
        </h3>
      )}

      {Array.isArray(dataCenterFacilitiesToCompare) && Boolean(dataCenterFacilitiesToCompare.length) && (
        <>
          <div className="data-center-facilities-compare-panel__content">
            {isDataCenterFacilitiesComparePanelComparisonOpen ?
              (
                <>
                  <h3 className="data-center-facilities-compare-panel__title">
                    Data Center Facilities Comparison
                  </h3>
                  <table className="data-center-facilities-compare-panel__table">
                    <tr className="data-center-facilities-compare-panel__table-row">
                      <td>
                        &nbsp;
                      </td>
                      {dataCenterFacilitiesToCompare.map((dataCenterFacility, index) => (
                        <th
                          key={index}
                          className="data-center-facilities-compare-panel__table-header data-center-facilities-compare-panel__table-header--uppercase"
                        >
                          <div className="data-center-facilities-compare-panel__table-remove-data-center-facility">
                            {dataCenterFacility.alias}
                            <div
                              className="data-center-facilities-compare-panel__table-remove-data-center-facility-icon"
                              onClick={() => handleRemoveDataCenterFacilityClick(index)}
                              role="button"
                              tabIndex="0"
                            >
                              <i className="material-icons">
                                close
                              </i>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                    <tr className="data-center-facilities-compare-panel__table-row">
                      <td className="data-center-facilities-compare-panel__table-column data-center-facilities-compare-panel__table-column--bold">
                        Energy Input Stream Topic
                      </td>
                      {dataCenterFacilitiesToCompare.map((dataCenterFacility, index) => (
                        <td
                          key={index}
                          className="data-center-facilities-compare-panel__table-column"
                        >
                          {dataCenterFacility.energyInputStreamTopic}
                        </td>
                      ))}
                    </tr>
                    <tr className="data-center-facilities-compare-panel__table-row">
                      <td className="data-center-facilities-compare-panel__table-column data-center-facilities-compare-panel__table-column--bold">
                        Energy Output Stream Topic
                      </td>
                      {dataCenterFacilitiesToCompare.map((dataCenterFacility, index) => (
                        <td
                          key={index}
                          className="data-center-facilities-compare-panel__table-column"
                        >
                          {dataCenterFacility.energyOutputStreamTopic}
                        </td>
                      ))}
                    </tr>
                    <tr className="data-center-facilities-compare-panel__table-row">
                      <td className="data-center-facilities-compare-panel__table-column data-center-facilities-compare-panel__table-column--bold">
                        Total Electrical Capacity
                      </td>
                      {dataCenterFacilitiesToCompare.map((dataCenterFacility, index) => (
                        <td
                          key={index}
                          className="data-center-facilities-compare-panel__table-column"
                        >
                          {dataCenterFacility.totalElectricalCapacity}
                        </td>
                      ))}
                    </tr>
                  </table>
                </>
              ) :
              (
                <>
                  <h3 className="data-center-facilities-compare-panel__title">
                    Selected Data Center Facilities
                  </h3>
                  {dataCenterFacilitiesToCompare.map((dataCenterFacility, index) => (
                    <div
                      key={dataCenterFacility.id}
                      className="data-center-facilities-compare-panel__data-center-facilities-box"
                    >
                      <div
                        className="data-center-facilities-compare-panel__remove-data-center-facility"
                        onClick={() => handleRemoveDataCenterFacilityClick(index)}
                        role="button"
                        tabIndex="0"
                      >
                        <i className="material-icons">
                          close
                        </i>
                      </div>
                      {Boolean(dataCenterFacility.alias) && (
                        <div className="data-center-facilities-compare-panel__row">
                          <h3 className="data-center-facilities-compare-panel__subtext data-center-facilities-compare-panel__subtext--uppercase">
                            {dataCenterFacility.alias}
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
            className="data-center-facilities-compare-panel__button"
            disabled={dataCenterFacilitiesToCompare.length < 2}
            onClick={handleCompareButtonClick}
          >
            {isDataCenterFacilitiesComparePanelComparisonOpen ? 'Go back' : 'Compare'}
          </button>
        </>
      )}
    </div>
  );
};

export default connect(mapStateToProps)(DataCenterFacilitiesComparePanel);
