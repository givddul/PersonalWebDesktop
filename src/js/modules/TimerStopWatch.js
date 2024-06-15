import { WindowBase } from './WindowBase.js'

/**
 * Represents a timer and stopwatch application
 */
export class TimerStopWatch extends WindowBase {
  /**
   * Constructs a new TimerStopWatch instance.
   * @param {string} windowId - The ID of the window element in the DOM.
   * @param {Array} windowsArray - An array to manage multiple window instances.
   */
  constructor (windowId, windowsArray) {
    super(windowId, windowsArray)
    this.stopwatchInterval = null
    this.timerInterval = null
    this.stopwatchTime = 0
    this.timerTime = 0

    this.stopwatchDisplay = this.window.querySelector('#stopwatch-display')
    this.stopWatchStart = this.window.querySelector('#stopwatch-start-button')
    this.stopWatchPause = this.window.querySelector('#stopwatch-pause-button')
    this.stopWatchStop = this.window.querySelector('#stopwatch-stop-button')
    this.stopWatchReset = this.window.querySelector('#stopwatch-reset-button')

    this.timerDisplay = this.window.querySelector('#timer-display')
    this.timerStart = this.window.querySelector('#timer-start-button')
    this.timerStop = this.window.querySelector('#timer-stop-button')
    this.timerInput = this.window.querySelector('#timer-input')

    this.alarmSound = this.window.querySelector('#alarm-sound')
    this.tickSound = this.window.querySelector('#tick-sound')

    this.closeButton = this.window.querySelector('.close-button')
    this.closeButton.addEventListener('click', () => this.remove())

    this.initializeEvents()
  }

  /**
   * Initializes event listeners for stopwatch and timer controls.
   */
  initializeEvents () {
    // Stopwatch
    this.stopWatchStart.addEventListener('click', () => this.startStopwatch())
    this.stopWatchPause.addEventListener('click', () => this.pauseStopwatch())
    this.stopWatchStop.addEventListener('click', () => this.stopStopwatch())
    this.stopWatchReset.addEventListener('click', () => this.resetStopwatch())

    // Timer
    this.timerStart.addEventListener('click', () => this.startTimer())
    this.timerStop.addEventListener('click', () => this.stopTimer())
  }

  /**
   * Starts the stopwatch, resetting and playing the tick sound.
   */
  startStopwatch () {
    clearInterval(this.stopwatchInterval)
    this.tickSound.currentTime = 0 // Reset the audio to start
    this.tickSound.play()
    this.stopwatchInterval = setInterval(() => this.updateStopwatch(), 1000)
  }

  /**
   * Pauses the stopwatch and resets the tick sound.
   */
  pauseStopwatch () {
    clearInterval(this.stopwatchInterval)
    this.tickSound.pause()
    this.tickSound.currentTime = 0
  }

  /**
   * Stops the stopwatch and resets the tick sound.
   */
  stopStopwatch () {
    clearInterval(this.stopwatchInterval)
    this.tickSound.pause()
    this.tickSound.currentTime = 0
  }

  /**
   * Resets the stopwatch to zero and updates the display.
   */
  resetStopwatch () {
    clearInterval(this.stopwatchInterval)
    this.stopwatchTime = 0
    this.updateDisplay(this.stopwatchDisplay, this.stopwatchTime)
    this.tickSound.pause()
    this.tickSound.currentTime = 0
  }

  /**
   * Starts the timer, setting the duration from input and playing tick sound.
   */
  startTimer () {
    clearInterval(this.timerInterval)
    this.timerTime = parseInt(this.timerInput.value, 10)
    if (isNaN(this.timerTime) || this.timerTime <= 0) {
      alert('Please enter a valid number of seconds.')
      return
    }
    this.updateDisplay(this.timerDisplay, this.timerTime)
    this.tickSound.currentTime = 0
    this.tickSound.play()
    this.timerInterval = setInterval(() => this.updateTimer(), 1000)
  }

  /**
   * Stops the timer and resets the alarm and tick sounds.
   */
  stopTimer () {
    clearInterval(this.timerInterval)
    this.alarmSound.pause()
    this.alarmSound.currentTime = 0
    this.tickSound.pause()
    this.tickSound.currentTime = 0
  }

  /**
   * Increments the stopwatch time and updates the display.
   */
  updateStopwatch () {
    this.stopwatchTime++
    this.updateDisplay(this.stopwatchDisplay, this.stopwatchTime)
  }

  /**
   * Decrements the timer time, updates the display, and plays alarm when time's up.
   */
  updateTimer () {
    if (this.timerTime > 0) {
      this.timerTime--
      this.updateDisplay(this.timerDisplay, this.timerTime)
    } else {
      clearInterval(this.timerInterval)
      this.alarmSound.play()
      this.tickSound.pause()
      this.tickSound.currentTime = 0
    }
  }

  /**
   * Updates the time display of the stopwatch or timer.
   * @param {HTMLElement} displayElement - The element where time is displayed.
   * @param {number} timeInSeconds - Time in seconds to display.
   */
  updateDisplay (displayElement, timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds - (hours * 3600)) / 60)
    const seconds = timeInSeconds - (hours * 3600) - (minutes * 60)

    displayElement.textContent = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`
  }

  /**
   * Pads a number with a leading zero if it is less than 10. eg. 1 sec becomes 01 sec.
   * @param {number} number - The number to pad.
   * @returns {string} Padded number as a string.
   */
  pad (number) {
    return number < 10 ? '0' + number : number
  }
}
