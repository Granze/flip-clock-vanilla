'use strict';

import setMinutes from 'date-fns/set_minutes';
import addSeconds from 'date-fns/add_seconds';
import subSeconds from 'date-fns/sub_seconds';
import format from 'date-fns/format';
import hyperHTML from 'hyperhtml';

class FlipClock extends HTMLElement {
  constructor() {
    super();
    this.time = '000000';
    this.timer = null;
    this.isRunning = false;
    this.html = hyperHTML.bind(this.attachShadow({ mode: 'open' }));
    this.startCount = this.startCount.bind(this);
    this.stopCount = this.stopCount.bind(this);
    this.resetCount = this.resetCount.bind(this);
  }

  connectedCallback() {
    this.showButtons = this.hasAttribute('show-buttons');
    this.hideHours = this.hasAttribute('hide-hours');
    this.hideSeconds = this.hasAttribute('hide-seconds');
    this.auto = this.hasAttribute('auto');
    this.displayMode = this.getAttribute('display-mode') || null;
    this.startFrom = this.getAttribute('start-from') || null;
    this.render();
    this.shadowRoot
      .querySelector('.start-count')
      .addEventListener('click', this.startCount);
    this.shadowRoot
      .querySelector('.stop-count')
      .addEventListener('click', this.stopCount);
    this.shadowRoot
      .querySelector('.reset-count')
      .addEventListener('click', this.resetCount);
    this.resetCount();
    if (this.displayMode === 'timer' || this.displayMode === 'countdown') {
      if (this.auto === true) {
        this.startCount();
      }
    } else {
      this.createClock();
    }
    if (this.startFrom) {
      this.time = '00' + ('00' + this.startFrom).slice(-2) + '00';
    }
  }

  disconnectedCallback() {
    this.shadowRoot
      .querySelector('.start-count')
      .removeEventListener('click', this.startCount);
    this.shadowRoot
      .querySelector('.stop-count')
      .removeEventListener('click', this.stopCount);
    this.shadowRoot
      .querySelector('.reset-count')
      .removeEventListener('click', this.resetCount);
  }

  createClock() {
    this.time = format(new Date(), 'HHmmss');
    setTimeout(this.createClock.bind(this), 1000);
    this.render();
  }

  createTimer() {
    if (this.isRunning) {
      this.timer = addSeconds(this.timer, 1);
      this.time = format(this.timer, 'HHmmss');
      setTimeout(this.createTimer.bind(this), 1000);
      this.render();
    }
  }

  createCountdown() {
    if (this.isRunning) {
      if (this.time > 0) {
        this.timer = subSeconds(this.timer, 1);
        this.time = format(this.timer, 'HHmmss');
        this.render();
        setTimeout(this.createCountdown.bind(this), 1000);
      }
    }
  }

  startCount() {
    if (!this.timer) {
      this.timer = setMinutes('000000', this.startFrom || 0);
    }
    this.isRunning = true;
    this.startFrom ? this.createCountdown() : this.createTimer();
  }

  stopCount() {
    this.isRunning = false;
    this.render();
  }

  resetCount() {
    this.isRunning = false;
    this.time = this.startFrom ? '00' + this.startFrom + '00' : '000000';
    this.timer = null;
    this.render();
  }

  render() {
    this.html`
      <link rel="stylesheet" href="./src/flip-clock.css">
      <div id="clock">
        <span class="group hours" hidden="${this.hideHours}">
          <span class="num" id="hours0">${this.time[0]}</span>
          <span class="num" id="hours1">${this.time[1]}</span>
          <b>:</b>
        </span>
        <span class="num" id="minutes0">${this.time[2]}</span>
        <span class="num" id="minutes1">${this.time[3]}</span>
        <span class="group seconds" hidden="${this.hideSeconds}">
          <b>:</b>
          <span class="num" id="seconds0">${this.time[4]}</span>
          <span class="num" id="seconds1">${this.time[5]}</span>
        </span>
      </div>
      <div class="buttons" hidden="${!this.showButtons}">
        <button class="toggle btn start-count" disabled="${this
          .isRunning}">Start</button>
        <button class="toggle btn stop-count">Stop</button>
        <button class="reset btn reset-count">Reset</button>
      </div>
    `;
  }
}

customElements.define('flip-clock', FlipClock);
