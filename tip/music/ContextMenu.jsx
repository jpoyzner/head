/*
 * This is the first try for a context menu, it is doing just some basic functionality
 * like show up, build options based on props data, and execute options by calling
 * the callback function
 */
import React from 'react';
import SmartComponent from '../base/SmartComponent.jsx';
import Store from '../../store/store';
import ContextMenuOptions from './ContextMenuOptions.jsx';

export default class ContextMenu extends SmartComponent {
  shouldComponentUpdate(props, state) {
    const { visible, options } = Store.getState().contextMenu;
    this.onlyUpdateOnReduxChangeIn({ visible, options }, state);
    return !this.abortUpdate;
  }

  render() {
    const { visible, options, context } = Store.getState().contextMenu;

    if (!visible) {
      return null;
    }
    return (
      <div className="rf-container" ref={(div) => { this.$container = $(div); }}>
        <div className="context-overlay" onClick={this.clickedOverlay} onContextMenu={this.onContextMenu}>
          <div
            ref={(div) => { this.menuRef = div; }}
            className="rf-context-menu">
            <ContextMenuOptions options={options} visible={visible} context={context} />
          </div>
        </div>
      </div>
    );
  }

  clickedOverlay = (event) => {
    if (!$(event.target).closest('.rf-context-menu').length) {
      App.getController().clearContextMenu(false);
    }
  }

  onContextMenu = (event) => {
    if (!$(event.target).closest('.rf-context-menu').length) {
      App.getController().clearContextMenu(false);
    }
    // prevent the rendering of the browser's native context menu.
    App.Utils.UI.noBubble(event);
  }

  static onOptionClick(option, context) {
    const ctrl = App.getController();

    // trigger action
    ctrl.notifyEvent(
      option.source || context.source,
      option.action,
      { ...context, ...option.context },
    );

    // then hide the menu
    ctrl.clearContextMenu(false);
  }

  calcPosition = (coords) => {
    const winHeight = window.innerHeight;
    const menuWidth = this.menuRef.clientWidth;
    const menuHeight = this.menuRef.clientHeight;
    const yOffset = coords.anchored ? 1 : 20;
    const side = coords.side || 'left';

    let { x, y } = coords;

    // Determine X coords based on specified side, xOffset, and menuWidth
    if (coords.anchored && coords.side === 'right') {
      x += menuWidth;
     }

    // Determine Y coords based on dropUp, yOffset, and menuHeight
    // for drop-up
    if (coords.anchored && coords.dropUp) {
      y = y - menuHeight - 32; // 32 is the height of an item
    }

    // if too close to bottom of screen to fit, adjust position accordingly
    if ((y + menuHeight) >= winHeight) {
          y -= menuHeight - (winHeight - y - yOffset);
        } else {
          y -= yOffset;
        }


    // Minor tweak: shifting default context menu by 5 prevents accidental selection
    if (!coords.anchored) {
      x += 5;
      y += 5;
    }

    return {
      x,
      y,
      side
    };
  }

  componentDidUpdate() {
    const { coords, visible } = Store.getState().contextMenu;

    if (this.$container) {
      this.$container.find('.context-overlay').toggleClass('showing', visible);

      if (visible) {
        const position = this.calcPosition(coords);

        this.menuRef.style.left = `${position.x}px`;
        this.menuRef.style.top = `${position.y}px`;
      }
    }
  }
}
