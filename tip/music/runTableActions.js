import RunTableUtils from '../utils/runTableUtils';

export default (state, action) => {
  const { data } = action;
  const { runTable, data: { process } } = state.measureMode;

  switch (action.type) {
    // This action sets the new state for runTable, currently dispatched from RunTable component.
    // In the future, this will be fired off by Subscriptions.subscribe()
    case 'runTableVisibleRowsLoaded': {
      const { isFlowMode, flowModeStep, visibleRows, selectedRows, cols, aggregated } = data;

      if (isFlowMode) {
        delete runTable.visibleRows;
        delete runTable.selectedRows;
        delete runTable.cols;
        delete runTable.aggregated;
        delete runTable.hiddenInputColumns;
        delete runTable.hiddenOutputColumns;
        delete runTable.numVisibleInfoColumns;
        delete runTable.numInfoColumns;
        delete runTable.numVisibleInputs;
        delete runTable.numVisibleOutputs;
        delete runTable.numPutColumns;

        if (!runTable.flowMode) {
          runTable.flowMode = {};
        }

        const step = { visibleRows, selectedRows, cols, aggregated };
        runTable.flowMode[flowModeStep] = step;

        if (!runTable.flowMode.selectedStep) {
          runTable.flowMode.selectedStep = 'first-step';
        }
      } else {
        delete runTable.flowMode;

        runTable.visibleRows = visibleRows;
        runTable.selectedRows = selectedRows;
        runTable.cols = cols;
        runTable.aggregated = aggregated;
      }

      const runTableContent = RunTableUtils.getRunTableContent(runTable, flowModeStep);

      // We're using refreshInProgress to check whether the app has refreshed or is in the
      // middle of an initial page load. Only in those cases do we reset runTable.hiddenColumns to
      // saved column settings. This maintains unsaved show/hide state when a sequence is applied.

      const refreshInProgress =
        App.getController().getState('ResourceDetailsTable.current.refreshInProgress');

      if (refreshInProgress) {
        const processPreferences =
          ProcessPreference.getPreferenceIfAllowed(process._id, false, true);
        if (processPreferences._id) {
          runTable.hiddenColumns = new Set(processPreferences.hiddenColumns);

          if (processPreferences.sortConfigMap) {
             const activityId = state.selectedEntity;
             runTable.sortConfig = processPreferences.sortConfigMap[activityId];
          } else {
            runTable.sortConfig = Template.SharedRunTableFeatures.DEFAULT_SORT_ORDER;
          }
          App.getController().setState('ResourceDetailsTable.current.sortConfig', runTable.sortConfig);


          runTable.hiddenPropertyColumns = processPreferences.hiddenPropertyColumns || {};
          Object.keys(runTable.hiddenPropertyColumns).forEach((key) => {
            runTable.hiddenPropertyColumns[key] = new Set(runTable.hiddenPropertyColumns[key]);
          });

          runTable.processPreferences = processPreferences;
        } else if (runTable.processId !== process._id && runTable.processPreferences) {
          // checking to see if a user has switched Processes, and
          // resetting runTable.processPreferences._id if they do.
          delete runTable.processPreferences._id;
        }
      }

      runTableContent.hiddenInputColumns = new Set();
      runTableContent.hiddenOutputColumns = new Set();

      RunTableUtils.recalculateColumnCounts(runTable, runTableContent);

      runTable.hiddenColumns.forEach((defId) => {
        const foundCol = cols.find((col) => col.field === defId);
        if (!foundCol) {
          return;
        }

        const { data: colData } = foundCol;
        if (colData) {
          const set =
            (colData.direction || colData.resource.direction) === 'input' ?
              runTableContent.hiddenInputColumns
              : runTableContent.hiddenOutputColumns;

          set.add(defId);
        }
      });

      const resetFocusedCellX =
        (!isFlowMode || runTable.flowMode.selectedStep === flowModeStep)
        && runTable.focusedCellX >= runTableContent.cols.length;

      if (resetFocusedCellX) {
        RunTableUtils.setFocusedCellX(
          runTable,
          runTableContent.cols.findIndex((col) => col.clazz === 'run-name'),
        );
      }

      return state;
    }

    case 'updateProcessPreferences': {
      // When saving the table settings, the run table there is no refresh in progress,
      // therefore the processPreferences is never updated.
      // This is added to immediately update processPreferences when it is saved.
      const processPreferences =
        ProcessPreference.getPreferenceIfAllowed(process._id, false, true);

      if (processPreferences._id || processPreferences.topGroupId) {
        runTable.hiddenColumns = new Set(processPreferences.hiddenColumns);

        runTable.hiddenPropertyColumns = processPreferences.hiddenPropertyColumns || {};
        Object.keys(runTable.hiddenPropertyColumns).forEach((key) => {
          runTable.hiddenPropertyColumns[key] = new Set(runTable.hiddenPropertyColumns[key]);
        });

        runTable.processPreferences = processPreferences;
      }

      return state;
    }

    case 'navigateRunTable': {
      if (!runTable.focusedCellRowId) {
        return state;
      }

      // when user selects a block using shift key we let her to finish the selection
      if (runTable.lastCellClicked.size > 0 && !data.shiftKey) {
        // when the selection finish, if only press an arrow key we have to remember
        // the anchor position, where the block selected started and move from there
        const { flowMode } = runTable;
        let selectedStep;
        if (flowMode) {
          selectedStep = flowMode.selectedStep;
        }
        const runTableContent = RunTableUtils.getRunTableContent(runTable, selectedStep);
        const { cols } = runTableContent;
        const col = runTable.lastCellClicked.keys().next().value;
        const row = runTable.lastCellClicked.values().next().value;
        let colIndex = cols.findIndex((c) => c.fieldKey === col);
        // verify if the current cell is the resource status cell
        if (runTable.focusedCellX !== colIndex &&
          cols[runTable.focusedCellX].defId) {
          colIndex = runTable.focusedCellX;
        }
        if (runTable.focusedCellRowId !== row || runTable.focusedCellX !== colIndex) {
          RunTableUtils.setFocusedRowId(runTableContent, row);
          RunTableUtils.setFocusedCellX(runTableContent, colIndex);
        }
      }

      const onToggleColumn = runTable.focusedCellClass === 'run-label';

      const focusedCellRowIndex =
        RunTableUtils.getFocusedCellRowIndex(
          runTable,
          data.direction === 'LEFT' ? false : onToggleColumn,
        );

      const focusedCellRowRemoved = focusedCellRowIndex === -1; // happens due to scrolling away

      switch (data.direction) {
        case 'LEFT':
          if (focusedCellRowRemoved) {
            runTable.needsSnapToRow = true;
          }

          RunTableUtils.setFocusedCellX(runTable, runTable.focusedCellX, -1, action);
          break;
        case 'RIGHT':
          if (focusedCellRowRemoved) {
            runTable.needsSnapToRow = true;
          }

          RunTableUtils.setFocusedCellX(runTable, runTable.focusedCellX, 1, action);
          break;
        case 'UP': {
          if (focusedCellRowRemoved) {
            runTable.needsSnapToRow = true;
            runTable.actionAfterSnapToRow = { ...action };
          } else if (focusedCellRowIndex) {
            RunTableUtils.setFocusedRowId(
              runTable,
              RunTableUtils.getNavigableRows(runTable, onToggleColumn)[focusedCellRowIndex - 1].key,
            );
          }

          break;
        }

        case 'DOWN': {
          if (focusedCellRowRemoved) {
            runTable.needsSnapToRow = true;
            runTable.actionAfterSnapToRow = { ...action };
          } else {
            const navigableRows = RunTableUtils.getNavigableRows(runTable, onToggleColumn);
            if (focusedCellRowIndex < navigableRows.length - 1) {
              RunTableUtils.setFocusedRowId(runTable, navigableRows[focusedCellRowIndex + 1].key);
            }
          }

          break;
        }

        default:
      }

      runTable.editMode = 'none';

      return state;
    }
    case 'browseRunTableCell':
      RunTableUtils.enterCell(data, runTable);
      runTable.editMode = 'none';
      return state;
    case 'editRunTableCell':
      runTable.editMode = 'light';
      return state;
    case 'enterRunTableCell':
      RunTableUtils.enterCell(data, runTable);

      runTable.editMode =
        ['run-label', 'run-type', 'run-status'].includes(runTable.focusedCellClass) ?
          'none'
          : 'precise';

      return state;
    case 'exitRunTableCells':
      runTable.focusedCellX = null;
      runTable.focusedCellClass = null;
      runTable.focusedCellRowId = null;
      runTable.needsSnapToRow = false;
      runTable.actionAfterSnapToRow = null;
      runTable.editMode = 'none';
      return state;
    case 'exitPreciseEditMode':
      runTable.editMode = 'none';
      return state;
    case 'snapToRowIfNeeded':
      if (!runTable.focusedCellRowId) {
        return state;
      }

      if (RunTableUtils.getFocusedCellRowIndex(runTable) === -1) {
        runTable.needsSnapToRow = true;
      }

      return state;
    case 'clearSnapToRow':
      runTable.needsSnapToRow = false;
      runTable.actionAfterSnapToRow = null;
      return state;
    case 'deselectRunTable':
      runTable.selectedCells.clear();
      runTable.selectedColumns.clear();
      runTable.lastCellClicked.clear();
      runTable.lastBlockSelected.clear();
      return state;
    case 'deselectRunTableCells':
      runTable.selectedCells.clear();
      runTable.lastCellClicked.clear();
      runTable.lastBlockSelected.clear();
      return state;
    case 'selectRunTableLastClicked':
      runTable.lastCellClicked.clear();
      runTable.lastCellClicked.set(data.col, data.row);
      return state;
    case 'selectRunTableCells':
      RunTableUtils.addSelectedCells(
        data.row,
        data.col,
        runTable,
        data.selectedStep,
        data.allRows,
        data.shiftKey,
        data.ctrlKey,
        data.focus,
      );

      return state;
    case 'selectRunTableCellsBatch':
      RunTableUtils.addSelectedCellsBatch(
        data.col,
        runTable,
        data.allRows,
      );

      return state;
    case 'mergeSelectedCellsBlock':
      RunTableUtils.mergeLastBlockSelected(runTable);
      return state;
    case 'selectRunTableColumns':
      RunTableUtils.addSelectedColumns(
        data.defId,
        runTable,
        data.selectedStep,
        data.allProps,
        data.shiftKey,
        data.ctrlKey,
      );

      return state;
    case 'deselectRunTableColumns':
      runTable.selectedColumns.clear();
      return state;
    case 'hideRunTableColumns':
      RunTableUtils.modifyHiddenColumns(
        'add',
        data.defId,
        runTable,
        data.selectedStep,
        data.allProps,
      );

      RunTableUtils.recalculateColumnCounts(runTable, null, data.selectedStep);
      return state;
    case 'showRunTableColumns':
      RunTableUtils.modifyHiddenColumns(
        'remove',
        data.defId,
        runTable,
        data.selectedStep,
        data.allProps,
      );

      RunTableUtils.recalculateColumnCounts(runTable, null, data.selectedStep);
      return state;
    case 'selectRunTableInputs':
      RunTableUtils.addSelectedPutColumns('input', runTable, data.selectedStep);
      return state;
    case 'selectRunTableOutputs':
      RunTableUtils.addSelectedPutColumns('output', runTable, data.selectedStep);
      return state;
    case 'hideRunTableInputs':
      RunTableUtils.modifyHiddenPutColumns('add', 'input', runTable, data.selectedStep);
      RunTableUtils.recalculateColumnCounts(runTable, null, data.selectedStep);
      return state;
    case 'hideRunTableOutputs':
      RunTableUtils.modifyHiddenPutColumns('add', 'output', runTable, data.selectedStep);
      RunTableUtils.recalculateColumnCounts(runTable, null, data.selectedStep);
      return state;
    case 'showRunTableInputs':
      RunTableUtils.modifyHiddenPutColumns('remove', 'input', runTable, data.selectedStep);
      RunTableUtils.recalculateColumnCounts(runTable, null, data.selectedStep);
      return state;
    case 'showRunTableOutputs':
      RunTableUtils.modifyHiddenPutColumns('remove', 'output', runTable, data.selectedStep);
      RunTableUtils.recalculateColumnCounts(runTable, null, data.selectedStep);
      return state;
    case 'showAllRunTableColumns':
      RunTableUtils.modifyHiddenPutColumns('remove', 'input', runTable, data.selectedStep);
      RunTableUtils.modifyHiddenPutColumns('remove', 'output', runTable, data.selectedStep);
      RunTableUtils.recalculateColumnCounts(runTable, null, data.selectedStep);
      return state;
    case 'showAllRunTableInfoColumns': {
      const runTableContent = RunTableUtils.getRunTableContent(runTable, data.selectedStep);
      const { hiddenColumns } = runTable;
      const { cols } = runTableContent;
      const fixedCols = cols.filter((c) => c.objectType === 'fixed');
      fixedCols.forEach((c) => hiddenColumns.delete(c.fieldKey));
      RunTableUtils.recalculateColumnCounts(runTable, null, data.selectedStep);
      return state;
    }
    default: return false;
  }
};
