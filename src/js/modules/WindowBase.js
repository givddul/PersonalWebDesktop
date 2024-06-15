/**
 * Shared class for how all the windows should behave. It makes them draggable, stackable, focused and removable.
 */
export class WindowBase {
  static highestZIndex = 0 // Keeps track of the highest zIndex across all window instances. static -> shared across all instances of the class

  /**
   * Initializes a new window instance with event listeners for dragging and stacking.
   * @param {string} windowId - The ID of the window element in the DOM.
   * @param {Array} windowsArray - Array holding references to other window instances.
   */
  constructor (windowId, windowsArray) {
    this.window = document.getElementById(windowId)
    this.windows = windowsArray
    this.window.addEventListener('click', () => this.bringToFront())
    this.header = this.window.children[0]
    this.header.addEventListener('mousedown', (e) => this.onMouseDown(e))
  }

  /**
   * Handles the mouse down event by bringing the window to the front, calculating and updating the new x,y coordinates.
   * @param {MouseEvent} e - The mouse event triggered on mousedown.
   */
  onMouseDown (e) {
    console.log('grabbing window ' + this.window.id)
    this.bringToFront()

    // initial xy-coordinates for mouse
    const startX = e.clientX
    const startY = e.clientY

    // initial xy-coordinates for window
    const startLeft = parseInt(window.getComputedStyle(this.window).left, 10)
    const startTop = parseInt(window.getComputedStyle(this.window).top, 10)

    // calculates how far the mouse has moved since the drag started and moves the window accordingly
    const onMouseMove = (e) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      this.window.style.left = startLeft + dx + 'px'
      this.window.style.top = startTop + dy + 'px'
    }

    // removes the event listeners when the mouse is released
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    // adds them again
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    e.preventDefault() // prevents the cursor from changing to a text cursor
  }

  /**
   * Brings the current window to the front by increasing its zIndex.
   */
  bringToFront () {
    WindowBase.highestZIndex += 1
    this.window.style.zIndex = WindowBase.highestZIndex
    // console.log(this.window.id + " has Z Index: " + WindowBase.highestZIndex)
  }

  /**
   * Displays the window and brings it to the front.
   */
  showWindow () {
    WindowBase.highestZIndex += 1
    this.window.style.zIndex = WindowBase.highestZIndex
    this.window.style.display = 'block'
  }

  /**
   * Hides the window from view.
   */
  hide () {
    this.window.style.display = 'none'
  }

  /**
   * Removes the window from the DOM and the windows array.
   */
  remove () {
    this.window.remove()
    // Remove the window from the array
    for (let i = 0; i < this.windows.length; i++) {
      if (this.windows[i].window.id === this.window.id) {
        this.windows.splice(i, 1)
        break
      }
    }
  }
}
