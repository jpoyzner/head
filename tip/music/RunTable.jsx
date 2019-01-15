import React from 'react';
import DataTableHeader from './DataTableHeader.jsx';
import Store from '../../store/store';
import SmartComponent from '../base/SmartComponent.jsx';
import DataTableBody from './DataTableBody.jsx';
import NestedDataTableBody from './NestedDataTableBody.jsx';
import RunTableUtils from './../../utils/runTableUtils';

/**
 * @class
 * @name RunTable
 * @summary Run Table for use in Plan, Measure and Clean tabs
 *
 * @example
 * <RunTable {...props} />
 */
export default class RunTable extends SmartComponent {
  state = {};

  shouldComponentUpdate(props, state) {
    // This is a bit of an anti-pattern where we cache old values even when
    // this wasn't a redux update. This is done because updates are also coming
    // from Blaze still.

    const {
      focusedCellX,
      focusedCellRowId,
      needsSnapToRow,
      hiddenColumns,
      selectedColumns,
      selectedCells,
      lastBlockSelected,
    } = Store.getState().measureMode.runTable;

    this.onlyUpdateOnChangeIn({
      focusedCellX,
      focusedCellRowId,
      needsSnapToRow,
      hiddenColumns,
      selectedColumns,
      selectedCells,
      lastBlockSelected,
      selected: props.selected,
      rowClasses: props.rowClasses,
    });

    return !state.reduxUpdate || !this.abortUpdate;
  }

  render() {
    // console.time("data table render time");

    const {
      props,
      props: {
        step,
        sortField,
        sortOrder,
        findAndAssignRunInput,
        updateGhostInputForRuns,
        deleteGhostInput,
        renameOutput,
        resourceHeaderMenu,
        resourceCellMenu,
        assignResource,
        removeResource,
        aggregateFields,
        aggregated,
        aggregatedConfig,
        mode,
        isFlowMode,
        flowModeStep,
        role,
        snapToRow,
        openRAM,
      },
    } = this;

    const { bulkCreateAndAssign, assignAll, assign } = this.state;
    const { noop } = RunTable;

    const selected = props.selected || {};
    const selectedRuns = props.selectedRuns || {};
    const rowClasses = props.rowClasses || {};
    const selectRow = props.selectRow || noop;
    const rejectRow = props.rejectRow || noop;
    const selectAll = props.selectAll || noop;
    const rejectAll = props.rejectAll || noop;
    const selectAllToggle = props.selectAllToggle || noop;

    const selectCell = props.selectCell || noop;
    const selectGroup = props.selectGroup || noop;
    const rejectGroup = props.rejectGroup || noop;
    const updateCell = props.updateCell || noop;
    const submitEdits = props.submitEdits || noop;
    const cancelEdits = props.cancelEdits || noop;

    this.cols = this.getSourceColumns();

    if (props.showEditRow) {
      this.cols.push({ field: 'filler', clazz: 'filler-col', filler: true });
    }

    let groups = props.groups || [];
    groups = groups.length && groups;

    // assume sort is managed externally
    let rows = props.rows || [];
    rows = groups ? RunTable.getGroupedRows(groups, rows) : rows;

    const rowOffset = props.rowOffset || 0;

    const rowCount =
      props.rowCount !== undefined ? Math.min(props.rowCount, rows.length) : rows.length;

    // TODO: can we also include the selected row (if not in visibleRows) and position it
    // absolutely somewhere so it remains rendered when out of view.
    // This will allow us to preserve any pending edits even while they scroll out of view
    // (currently if you start typing into a cell, then scroll it out of view, your unsaved
    // changes will be forgotten)
    this.visibleRows = rows.slice(rowOffset, rowOffset + rowCount);

    const itemCount =
      groups ? rows.reduce((count, group) => count + group.rows.length, 0) : rowCount;

    const { runTable } = Store.getState().measureMode;
    const { cols: loadedCols } = RunTableUtils.getRunTableContent(runTable, flowModeStep);
    let { hiddenColumns, selectedColumns, selectedCells, lastBlockSelected } = runTable;

    hiddenColumns = new Set([...hiddenColumns]);
    selectedColumns = new Set([...selectedColumns]);
    selectedCells = new Map([...selectedCells]);
    lastBlockSelected = new Map([...lastBlockSelected]);

    const infoCols =
      this.cols.splice(
        0,
        this.cols.findIndex((col) =>
          col.field !== 'label'
          && col.field !== 'name'
          && col.field !== 'type'
          && col.field !== 'runStatus'),
      );

    const headProps = {
      cols: this.cols,
      loadedCols,
      rows,
      step,
      itemCount,
      allowSelection: !groups,
      selected,
      selectedRuns,
      selectAll,
      rejectAll,
      selectAllToggle,
      sortField,
      sortOrder,
      aggregateFields,
      aggregated,
      showEditRow: props.showEditRow,
      submitEdits,
      cancelEdits,
      mode,
      isFlowMode,
      flowModeStep,
      role,
      resourceHeaderMenu,
      snapToRow,
      hiddenColumns,
      selectedColumns,
      selectedCells,
      lastBlockSelected,
    };

    const bodyProps = {
      cols: this.cols,
      rows,
      visibleRows: this.visibleRows,
      selected,
      aggregateFields,
      aggregated,
      aggregatedConfig,
      rowClasses,
      selectGroup,
      rejectGroup,
      selectRow,
      rejectRow,
      rejectAll,
      selectCell,
      updateCell,
      findAndAssignRunInput,
      updateGhostInputForRuns,
      deleteGhostInput,
      renameOutput,
      assignResource,
      removeResource,
      mode,
      bulkCreateAndAssign,
      assignAll,
      assign,
      resourceCellMenu,
      isFlowMode,
      flowModeStep,
      snapToRow,
      openRAM,
      hiddenColumns,
      selectedColumns,
      selectedCells,
      lastBlockSelected,
      focusedCellIndexOffset: infoCols.length,
    };

    if (props.debugRenderTime) {
      this.rowsRendered = 0;
      this.cellsRendered = 0;

      bodyProps.incrementRowCount = () => { this.rowsRendered += 1; };
      bodyProps.incrementCellCount = () => { this.cellsRendered += 1; };
    } else {
      bodyProps.incrementRowCount = noop;
      bodyProps.incrementCellCount = noop;
    }

    const headInfoProps = { ...headProps, cols: infoCols, showToggleColumn: true };

    const bodyInfoProps = {
      ...bodyProps,
      cols: infoCols,
      showToggleColumn: true,
      focusedCellIndexOffset: 0,
    };

    this.noRows = !rows.length;

    const dataTableClasses = ['data-table'];
    if (this.noRows) {
      dataTableClasses.push('rf-no-rows');
    }

    return (
      <div>
        <div
          className="data-table rf-frozen-run-table"
          ref={(table) => { this.$frozenTable = $(table); }}>

          <div className="table-header">
            <DataTableHeader {...headInfoProps} />
          </div>
          <div className="table-body scrolleractive">
            <div className="scroll-area" />
            {groups ?
              <NestedDataTableBody {...bodyInfoProps} />
              : <DataTableBody {...bodyInfoProps} />}
          </div>
        </div>
        <svg className="rf-table-separator" ref={(div) => { this.$separator = $(div); }}>
          <line x="0" y1="0" x2="0" y2="0" />
        </svg>
        <div className={dataTableClasses.join(' ')} ref={(table) => { this.table = $(table); }}>
          <div className="table-header">
            <DataTableHeader {...headProps} />
          </div>
          <div className="table-body scrolleractive">
            <div className="scroll-area" />
            {groups ? <NestedDataTableBody {...bodyProps} /> : <DataTableBody {...bodyProps} />}
          </div>
        </div>
        <div
          className="rf-run-table-vert-scrollbar"
          ref={(div) => { this.$vertScrollbar = $(div); }}>

          <div className="rf-run-table-vert-scroll-area" />
        </div>
      </div>
    );
  }

  /**
   * @summary Used as a default action handler when an option is missing
   * @function
   * @static
   * @memberof RunTable
   * @param {Event} e Event from the event source we are bound to
   */
  static noop(e) {
    return false;
  }

  componentDidMount() {
    // console.timeEnd("data table render time");

    const { props } = this;

    this.table.on('bulkCreateAndAssign', (event, context) => {
      const { activityId, typeId, defId } = context;
      this.setState({ bulkCreateAndAssign: defId });
      props.updateGhostInputForRuns(activityId, typeId, defId);
    });

    this.table.on('assignAll', (event, assignAllParams) => {
      this.setState({ assignAll: assignAllParams });
    });

    this.table.on('assign', (event, defId, name, id) => {
      this.setState({ assign: { defId, name, id } });
    });

    this.table.find('.table-header .filler-col,.buffer').contextmenu((event) => {
      const exemptElementsSelector = '.resource-assignment,.property-col';
      if (!$(event.currentTarget).parent('.header-row').find(exemptElementsSelector).length) {
        App.getController().showContextMenu(
          App.Utils.UI.mouseLocation(event),
          { source: 'Experiment Editor' },
          [
            { type: 'title', text: 'Table' },
            {
              type: 'action',
              title: 'Show All',
              action: 'Show All Run Table Columns',
              context: { selectedStep: props.flowModeStep },
            },
          ],
        );
      }
    });

    // this listener will be replaced by the last table loaded in flow mode
    // and it should not rely on a ref to an element in this component
    $(document).off('keydown.RunTable').on('keydown.RunTable', (event) => {
      const { focusedCellClass, editMode, flowMode } = Store.getState().measureMode.runTable;

      if ($(':focus').is('.global-query,.search-filter,.formula-editor,.calculated-formula,.calculated-name')) {
        return;
      }

      if (!focusedCellClass) {
        return;
      }

      if (event[App.Utils.UI.isMacLike() ? 'metaKey' : 'ctrlKey']) {
        switch (event.keyCode) {
          case 65: // 'a' (select all)
            if (props.selectAll) {
              props.selectAll();
            }

            break;
          default:
        }

        return;
      }

      switch (event.keyCode) {
        case 32: // spacebar
          if (focusedCellClass === 'resource-status') {
            event.preventDefault();
            this.props.openRAM($('.rf-focused').closest('td'));
          }

          break;
        case 27: // ESC
          if (focusedCellClass.includes('resource-assignment varied')) {
            event.preventDefault();
            $('.rf-focused input').trigger('pressedEsc');
          }

          return;
        default:
      }

      const $currentInput =
        (flowMode ? $(`.${flowMode.selectedStep} .data-table`) : $('.data-table'))
          .find('.rf-focused input');

      switch (Template.SharedRunTableFeatures.matchKeyboardEvent(event)) {
        case 'MOVE_LEFT':
          if (event.keyCode === 9 /* tab */ || editMode !== 'precise') {
            RunTable.navigateRunTable('LEFT', event, $currentInput);
          } else {
            Store.dispatch({ type: 'snapToRowIfNeeded' });
          }

          break;
        case 'MOVE_RIGHT':
          if (event.keyCode === 9 /* tab */ || editMode !== 'precise') {
            RunTable.navigateRunTable('RIGHT', event, $currentInput);
          } else {
            Store.dispatch({ type: 'snapToRowIfNeeded' });
          }

          break;
        case 'MOVE_UP':
          event.preventDefault();

          if (editMode !== 'precise') {
            RunTable.navigateRunTable('UP', event, $currentInput);
          }

          break;
        case 'MOVE_DOWN':
          if (event.keyCode !== 13 /* enter */ || !$('thead').is('.editing')) {
            event.preventDefault();

            if (event.keyCode === 13 /* enter */ || editMode !== 'precise') {
              RunTable.navigateRunTable('DOWN', event, $currentInput);
            }
          }

          break;
        default: {
          const editRunTableCell =
            editMode === 'none'
            && (event.keyCode === 8 // delete
              || event.keyCode === 32 // spacebar
              || (event.keyCode >= 46 && event.keyCode <= 90) // regular numbbers and letters
              || (event.keyCode >= 96 && event.keyCode <= 111) // numpad
              || event.keyCode >= 186); // misc punctiuation keys

          if (editRunTableCell) {
            $currentInput.val('');
            $currentInput.trigger('valueChange');
            Store.dispatch({ type: 'editRunTableCell' });
          }
        }
      }
    });

    $(document).off('click.outsideRunTable').on('click.outsideRunTable', (event) => {
      const $target = $(event.target);

      // if click is outside table or in table info
      const clickedOutsideRunTable =
        !$target.closest('.rf-context-menu').length
        && !$target.closest('.run-propagation-toolbar').length
        && !$target.hasClass('context-overlay')
        && !$target.closest('.modal-container').length
        && !$target.closest('.resource-assignment-manager').length
        && !$target.closest('.panel-splitter').length
        && !$target.closest('.propagation-step-header').length
        && (!$target.closest('.table.body, .table.header').length ||
          $target.closest('.rf-frozen-run-table .rf-table-info').length);

      if (clickedOutsideRunTable && props.rejectAll) {
        props.rejectAll();
        Store.dispatch({ type: 'deselectRunTable' });
        Store.dispatch({ type: 'exitRunTableCells' });
      }
    });

    if (this.$frozenTable) {
      const $frozenTableHeader = this.$frozenTable.find('.table-header');
      const $frozenTableBody = this.$frozenTable.find('.table-body');
      const $frozenBodyTable = $frozenTableBody.find('.body');
      const $separatorLine = this.$separator.find('line');
      const $tableBody = this.table.find('.table-body');

      $frozenTableBody.scroll(() => {
        if (!this.syncingFrozenTable) {
          this.syncingTable = true;
          this.syncingVertScrollbar = true;

          const scrollTop = $frozenTableBody.scrollTop();
          $tableBody.scrollTop(scrollTop);
          this.$vertScrollbar.scrollTop(scrollTop);
          this.adjustSeparatorLine($separatorLine, $frozenTableHeader, $frozenBodyTable);
        }

        this.syncingFrozenTable = false;
      });

      $tableBody.scroll(() => {
        if (!this.syncingTable) {
          this.syncingFrozenTable = true;
          this.syncingVertScrollbar = true;

          const scrollTop = $tableBody.scrollTop();
          $frozenTableBody.scrollTop(scrollTop);
          this.$vertScrollbar.scrollTop(scrollTop);
          this.adjustSeparatorLine($separatorLine, $frozenTableHeader, $frozenBodyTable);
        }

        this.syncingTable = false;
      });

      this.$vertScrollbar.scroll(() => {
        if (!this.syncingVertScrollbar) {
          this.syncingFrozenTable = true;
          this.syncingTable = true;

          const scrollTop = this.$vertScrollbar.scrollTop();
          $tableBody.scrollTop(scrollTop);
          $frozenTableBody.scrollTop(scrollTop);
          this.adjustSeparatorLine($separatorLine, $frozenTableHeader, $frozenBodyTable);
        }

        this.syncingVertScrollbar = false;
      });
    }

    this.connectToRedux();
  }

  /**
   * @summary Handles a table navigation event and dispatches navigate action
   * @memberof RunTable
   * @instance
   * @function
   * @param {String} direction The direction the focus should move
   * @param {Event} event The event that triggered the navigation
   * @param {Object} $currentInput The current focused input's jQuery element
   */
  static navigateRunTable(direction, event, $currentInput) {
    event.preventDefault();
    $currentInput.blur();
    Store.dispatch({ type: 'navigateRunTable', data: { direction, shiftKey: event.shiftKey } });
  }

  componentDidUpdate() {
    const {
      state,
      visibleRows,
      props: { mode, rows, selected = {}, isFlowMode, flowModeStep, aggregated },
    } = this;

    let $tables = this.table;
    if (this.$frozenTable) {
      $tables = $tables.add(this.$frozenTable);
    }

    const $tableBodies = $tables.find('table.body');
    const firstVisibleRowOffset = $tableBodies.data('firstVisibleRowOffset');
    if (firstVisibleRowOffset) {
      $tableBodies.css('top', firstVisibleRowOffset);
      $tableBodies.data('firstVisibleRowOffset', null);
    }

    // TODO: Ideally, data for Redux state updates is not calculated inside of view components;
    // however, we will need to refactor the code that does this into reducers to fix this.
    const dispatchRowsLoadedAction =
      !state.reduxUpdate
      && !state.bulkCreateAndAssign
      && !state.assignAll
      && !state.assign
      && (!isFlowMode || flowModeStep !== 'resource-details');

    if (dispatchRowsLoadedAction) {
      const selectedRowIds = Object.keys(selected);

      Store.dispatch({
        type: 'runTableVisibleRowsLoaded',
        data: {
          isFlowMode,
          flowModeStep,
          aggregated,
          visibleRows,
          selectedRows: rows.filter((row) => selectedRowIds.includes(row.key)),
          cols:
            this.getSourceColumns().reduce((cols, col) => {
              const hasStatusIndicator =
                mode === 'execute'
                && col.objectType === 'resourceDef'
                && col.data.direction === 'input';

              if (hasStatusIndicator) {
                cols.push({ clazz: 'resource-status', defId: col.field });
              }

              cols.push(col);

              return cols;
            }, [{ clazz: 'selection-col', field: 'selection-col' }]),
        },
      });

      setTimeout(() => this.table.find('td:not(.rf-focused) input').blur());
    }

    if (this.$frozenTable) {
      // positioning run attributes and resource tables:
      const frozenTableWidth =
        this.$frozenTable.find('th:not(.buffer)').get()
          .reduce((width, el) => width + $(el).outerWidth(), 0);

      this.$frozenTable.width(frozenTableWidth);

      const $frozenTableBody = this.$frozenTable.find('.table-body');

      const tableNode = this.table[0];

      $frozenTableBody.toggleClass(
        'rf-scrollbar-adjusted',
        Boolean(tableNode.offsetHeight - tableNode.clientHeight),
      );

      this.$separator.css('left', `${frozenTableWidth}px`);

      this.adjustSeparatorLine(
        this.$separator.find('line'),
        this.$frozenTable.find('.table-header'),
        $frozenTableBody.find('.body'),
      );

      let tableViewportWidth = this.table.closest('.content').width();
      if (isFlowMode) {
        tableViewportWidth /= 2;
      }

      this.table.css({
        left: `${frozenTableWidth}px`,
        width: tableViewportWidth - frozenTableWidth,
      });
    }

    const $tableHeader = this.table.find('.table.header');
    const $tableBody = this.table.find('.table-body');

    $tableBody.width($tableHeader.width() + this.$vertScrollbar.width());

    this.$vertScrollbar.css({ height: $tableBody.height(), top: $tableHeader.height() });

    this.$vertScrollbar.find('.rf-run-table-vert-scroll-area')
      .height($tableBody.find('.scroll-area').height());

    state.reduxUpdate = false;
    this.state.bulkCreateAndAssign = false;
    this.state.assignAll = false;
    this.state.assign = false;

    // if (this.props.debugRenderTime && this.rowsRendered) {
    //   console.timeEnd("data table render time");
    //   console.log(this.rowsRendered, "rows", this.cellsRendered, "cells");
    // }
  }

  /**
   * @summary Adjusts center divider between frozen and entities table
   * @memberof RunTable
   * @instance
   * @function
   * @param {Object} $separatorLine jQuery object for separator line between tables
   * @param {Object} $frozenTableHeader jQuery object for frozen table header
   * @param {Object} $frozenBodyTable jQuery object for frozen table body table
   */
  adjustSeparatorLine($separatorLine, $frozenTableHeader, $frozenBodyTable) {
    $separatorLine.attr(
      'y2',
      $frozenTableHeader.height()
        + (this.noRows ? 0 : ($frozenBodyTable.height() + $frozenBodyTable.position().top)),
    );
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    $(document).off('keydown.RunTable');
    $(document).off('click.outsideRunTable');
  }

  /**
   * @summary Annotates cols for use in this component
   * @memberof RunTable
   * @instance
   * @function
   * @returns {Array} A clone of the supplied array, with the same col objects annotated
   */
  getSourceColumns() {
    return (this.props.cols || []).map((col) => {
      col.className = String(col.clazz);
      col.isEditable = col.editMode !== RunTable.editModes.READ_ONLY;

      if (col.isEditable) {
        col.className += ' editable';
      }

      return col;
    });
  }

  /**
   * @summary When operating in grouped mode, groups rows together based on a key
   * @memberof RunTable
   * @instance
   * @function
   * @returns {Array} Array of row groups
   */
  static getGroupedRows(groups, sourceRows) {
    if (sourceRows.length < 1) {
      return [];
    }

    return groups.map((group) => {
      const rows = _.groupBy(sourceRows, 'groupKey')[group.key] || [];

      // determine most recent modification
      // based on most recently modified row
      // (or the mod date of the group itself)
      const mostRecentRowUpdate = d3.max(rows, (r) => r.modified);
      const mostRecentModification = Math.max(group.modified, mostRecentRowUpdate);
      return { rows, key: group.key, fields: group.fields, modified: mostRecentModification };
    });
  }

  static selectStates = {
    ALL: 'ALL',
    SOME: 'SOME',
    NONE: 'NONE',
    DISABLED: 'DISABLED',
  }

  static groupStates = {
    LOADING: 'Loading data',
    NO_DATA: 'No data available',
    EXPANDED: 'Showing data',
    CONTRACTED: 'Hiding data',
  }

  static editModes = {
    READ_ONLY: 'READ ONLY',
    EDIT_ROW: 'EDIT ROW ONLY',
    TABLE_ROWS: 'TABLE ROWS ONLY',
    ALWAYS: 'ALWAYS',
  }
}
