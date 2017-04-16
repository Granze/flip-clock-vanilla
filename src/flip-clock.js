"use strict";

import setMinutes from "date-fns/set_minutes";
import addSeconds from "date-fns/add_seconds";
import subSeconds from "date-fns/sub_seconds";
import format from "date-fns/format";
import hyperHTML from "hyperhtml";

class FlipClock extends HTMLElement {
  constructor() {
    super();
    this.time = "000000";
    this.timer = null;
    this.hideHours = false;
    this.hideSeconds = false;
    this.isRunning = false;
    this.startFrom = null;
    this.auto = false;
    this.container = hyperHTML.bind(this);
  }

  static get observedAttributes() {
    return [
      "display-mode",
      "show-buttons",
      "auto",
      "hide-hours",
      "hide-seconds",
      "start-from"
    ];
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (this[attrName] !== newVal) {
    }
  }

  connectedCallback() {
    this.showButtons = this.hasAttribute("show-buttons");
    this.displayMode = this.getAttribute("display-mode") || null;
    this.startFrom = this.getAttribute("start-from") || null;
    this.render();
    this.querySelector(".start-count").addEventListener(
      "click",
      this.startCount.bind(this)
    );
    this.querySelector(".stop-count").addEventListener(
      "click",
      this.stopCount.bind(this)
    );
    this.querySelector(".reset-count").addEventListener(
      "click",
      this.resetCount.bind(this)
    );
    this.resetCount();
    if (this.displayMode === "timer" || this.displayMode === "countdown") {
      if (this.auto === true) {
        this.startCount();
      }
    } else {
      this.createClock();
    }
    if (this.startFrom) {
      this.time = "00" + ("00" + this.startFrom).slice(-2) + "00";
    }
    if (!this.showButtons) {
      this.querySelector('.buttons').setAttribute('hidden', '');
    }
  }

  disconnectedCallback() {
    this.querySelector(".start-count").removeEventListener(
      "click",
      this.startCount.bind(this)
    );
    this.querySelector(".stop-count").removeEventListener(
      "click",
      this.stopCount.bind(this)
    );
    this.querySelector(".reset-count").removeEventListener(
      "click",
      this.resetCount.bind(this)
    );
  }

  createClock() {
    this.time = format(new Date(), "HHmmss");
    setTimeout(this.createClock.bind(this), 1000);
    this.render();
  }

  createTimer() {
    if (this.isRunning) {
      this.timer = addSeconds(this.timer, 1);
      this.time = format(this.timer, "HHmmss");
      setTimeout(this.createTimer.bind(this), 1000);
      this.render();
    }
  }

  createCountdown() {
    if (this.isRunning) {
      if (this.time > 0) {
        this.timer = subSeconds(this.timer, 1);
        this.time = format(this.timer, "HHmmss");
        this.render();
        setTimeout(this.createCountdown.bind(this), 1000);
      }
    }
  }

  startCount() {
    if (!this.timer) {
      this.timer = setMinutes("000000", this.startFrom || 0);
    }
    this.isRunning = true;
    this.startFrom ? this.createCountdown() : this.createTimer();
  }

  stopCount() {
    this.isRunning = false;
  }

  resetCount() {
    this.isRunning = false;
    this.time = this.startFrom ? "00" + this.startFrom + "00" : "000000";
    this.timer = null;
    this.render();
  }

  render() {
    this.container`
      <div id="clock">
        <span class="num" id="hours0">${this.time[0]}</span>
        <span class="num" id="hours1">${this.time[1]}</span>
        <b>:</b>
        <span class="num" id="minutes0">${this.time[2]}</span>
        <span class="num" id="minutes1">${this.time[3]}</span>
        <b>:</b>
        <span class="num" id="seconds0">${this.time[4]}</span>
        <span class="num" id="seconds1">${this.time[5]}</span>
      </div>
      <div class="buttons">
        <button class="toggle btn start-count">Start</button>
        <button class="toggle btn stop-count">Stop</button>
        <button class="reset btn reset-count">Reset</button>
      </div>
    `;
  }
}

customElements.define("flip-clock", FlipClock);
