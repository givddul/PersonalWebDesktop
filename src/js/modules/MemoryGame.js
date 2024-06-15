import { WindowBase } from './WindowBase.js'

/**
 * The class for the Memory game application.
 */
export class MemoryGame extends WindowBase {
  /**
   * Constructs a MemoryGame instance.
   * @param {string} windowId - The unique identifier for the window.
   * @param {Array} windowsArray - An array of window instances.
   */
  constructor (windowId, windowsArray) {
    super(windowId, windowsArray)
    this.initializeMemoryGame()
  }

  /**
   * Initializes the memory game.
   */
  initializeMemoryGame () {
    // Initialize audio elements
    this.matchSound = new Audio('./sounds/match.mp3')
    this.victorySound = new Audio('./sounds/victory.mp3')
    this.shuffleSound = new Audio('./sounds/shuffle.mp3')

    this.closeButton = this.window.querySelector('.close-button')
    this.closeButton.addEventListener('click', () => this.remove())

    // Make the whole window focusable
    this.window.setAttribute('tabindex', '0')
    this.window.addEventListener('click', (e) => {
      if (!e.target.classList.contains('close-button')) {
        this.window.focus()
      }
    })

    // Memory game initialization
    this.initializeGameComponents()
    this.initializeEvents()
  }

  /**
   * Sets up UI elements like grid size selector, start/restart buttons, and game display areas.
   */
  initializeGameComponents () {
    // Initialize game components like gridSizeSelect, startButton, etc.
    this.gridSizeSelect = this.window.querySelector('#grid-size')
    this.startButton = this.window.querySelector('#start-memory-button')
    this.gridSelection = this.window.querySelector('#grid-selection')
    this.gameContainer = this.window.querySelector('#memory-game-container')
    this.attemptsDisplay = this.window.querySelector('#attempts')
    this.restartButton = this.window.querySelector('#restart-memory-button')

    // Initialize the game board and status sections as hidden
    this.gameBoard = this.window.querySelector('#game-board')
    this.statusDiv = this.window.querySelector('#status')
    this.hide(this.gameBoard)
    this.hide(this.statusDiv)

    this.rows = 0
    this.cols = 0
  }

  /**
   * Initializes event listeners for game controls and interactions.
   */
  initializeEvents () {
    // Event listeners and other initializations that were in MemoryGame.js
    this.restartButton.addEventListener('click', () => this.resetGame())
    this.startButton.addEventListener('click', () => this.initializeGame())
    this.window.addEventListener('keydown', (e) => this.handleKeyPress(e))

    this.gridSizeSelect.addEventListener('click', function (event) {
      event.stopPropagation() // This stops the click event from bubbling up to the window
    })
  }

  /**
   * Starts a new game, sets up the game board, and shuffles cards.
   */
  initializeGame () {
    // Hide grid selection, show game board and status
    this.hide(this.gridSelection)
    this.show(this.statusDiv)

    this.gameBoard.style.display = 'grid'

    this.cards = [] // Array of card elements
    this.cardValues = [] // Array of card values
    this.attempts = 0
    this.attemptsDisplay.textContent = `Attempts: ${this.attempts}`
    this.firstCard = null
    this.secondCard = null
    this.lockBoard = false // Prevents flipping more than 2 cards at once
    this.currentCardIndex = 0

    const gridSize = parseInt(this.gridSizeSelect.value)

    switch (gridSize) {
      case 4:
        this.rows = 2; this.cols = 2
        break
      case 8:
        this.rows = 2; this.cols = 4
        break
      default:
        this.rows = 4; this.cols = 4
    }

    // Adjust the columns for the grid based on this.cols
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`

    this.hide(this.gridSelection)
    this.gameBoard.style.display = 'grid'

    const numberOfPairs = (this.rows * this.cols) / 2

    // Generate card values and their duplicates for pairs
    for (let i = 0; i < numberOfPairs; i++) {
      // Add each card value twice to create pairs eg [0, 0, 1, 1, 2, 2, 3, 3]
      for (let j = 0; j < 2; j++) {
        this.cardValues.push(i)
      }
    }

    console.log([...this.cardValues])

    this.shuffleArray(this.cardValues)

    // Create the card elements
    for (let i = 0; i < this.cardValues.length; i++) {
      const card = document.createElement('div')
      card.className = 'card'
      card.dataset.cardValue = this.cardValues[i]
      card.dataset.index = i
      this.gameBoard.appendChild(card)
      this.cards.push(card)
    }

    // Add event listeners to each card
    this.cards.forEach(card => card.addEventListener('click', () => this.flipCard(card)))

    this.currentCardIndex = 0
    this.updateCardFocus()

    // Make the status div and restart button visible
    this.show(this.statusDiv)
    this.show(this.restartButton)
  }

  /**
   * Resets the game to its initial state, clearing the board and resetting attempts.
   */
  resetGame () {
    // Reset the game board
    this.gameBoard.innerHTML = ''

    // Show grid selection & hide game board and status
    this.show(this.gridSelection)
    this.hide(this.gameBoard)
    this.hide(this.statusDiv)

    this.attemptsDisplay.textContent = 'Attempts: 0'
  }

  /**
   * Shuffles the elements of a given array in place.
   * @param {Array} array - The array to be shuffled.
   */
  shuffleArray (array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index within the array bounds
      const j = Math.floor(Math.random() * (i + 1));

      // Swap the elements at indices i and j
      // This is done using destructuring assignment, a concise way to swap values
      [array[i], array[j]] = [array[j], array[i]]
    }
    this.shuffleSound.play() // Play shuffle sound
  }

  /**
   * Flips a card and makes a sound
   * @param {HTMLElement} card - The card element to flip.
   */
  flipCard (card) {
    // If the board is locked or the card is already flipped, return
    if (this.lockBoard || card === this.firstCard) {
      return
    }

    // I create it here because otherwise it has a big delay between cards
    const cardTurnedSound = new Audio('./sounds/card turned.mp3')
    cardTurnedSound.play()

    card.style.backgroundImage = `url('./img/${card.dataset.cardValue}.png')`

    // If the first card is null(hasn't been flipped yet), set it to the current card and return
    if (!this.firstCard) {
      this.firstCard = card
      return
    }

    this.secondCard = card
    this.checkForMatch()
  }

  /**
   * Checks if two flipped cards are a match and handles the game state accordingly.
   */
  checkForMatch () {
    const isMatch = this.firstCard.dataset.cardValue === this.secondCard.dataset.cardValue
    if (isMatch) {
      this.matchSound.play()
      this.disableCards()
    } else {
      this.unflipCards()
    }
  }

  /**
   * Checks if the game is over and updates the display if all cards are matched.
   */
  checkGameOver () {
    // Check if all cards are hidden. the function 'every' returns true if all elements in the array pass the test
    const allCardsHidden = this.cards.every(card => card.classList.contains('hidden'))
    if (allCardsHidden) {
      this.victorySound.play()
      this.attemptsDisplay.innerHTML = `Congratulations, you made it in ${this.attempts} attempts`
    }
    // reset the focus to the first non disabled card
    this.currentCardIndex = 0
    this.updateCardFocus()
  }

  /**
   * Disables the matched cards and updates the game progress.
   */
  disableCards () {
    // Hide the cards by adding the 'hidden' class
    this.firstCard.classList.add('hidden')
    this.secondCard.classList.add('hidden')
    this.firstCard = null
    this.secondCard = null
    this.attempts++
    this.attemptsDisplay.textContent = `Attempts: ${this.attempts}`
    this.checkGameOver()
  }

  /**
   * Flips back the cards that are not a match after a delay.
   */
  unflipCards () {
    this.lockBoard = true
    setTimeout(() => {
      this.firstCard.style.backgroundImage = "url('./img/back.png')"
      this.secondCard.style.backgroundImage = "url('./img/back.png')"

      this.firstCard = null
      this.secondCard = null
      this.lockBoard = false
      this.attempts++
      this.attemptsDisplay.textContent = `Attempts: ${this.attempts}`
      const cardTurnedSound = new Audio('./sounds/card turned.mp3')
      cardTurnedSound.play()
    }, 1000)
  }

  /**
   * Handles keyboard navigation within the game board and sends x, y coordinates to moveFocus().
   * @param {KeyboardEvent} e - The keyboard event.
   */
  handleKeyPress (e) {
    if (e.key === 'ArrowRight') {
      this.moveFocus(1, 0)
    } else if (e.key === 'ArrowLeft') {
      this.moveFocus(-1, 0)
    } else if (e.key === 'ArrowUp') {
      this.moveFocus(0, -1)
    } else if (e.key === 'ArrowDown') {
      this.moveFocus(0, 1)
    } else if (e.key === 'Enter' && !this.cards[this.currentCardIndex].classList.contains('hidden')) {
      this.flipCardByKey()
    }
  }

  /**
   * Moves the focus to a new card based on keyboard input.
   * @param {number} x - Horizontal movement.
   * @param {number} y - Vertical movement.
   */
  moveFocus (x, y) {
    const rows = this.rows
    const cols = this.cols
    let newIndex = this.currentCardIndex

    while (true) {
      const currentRow = Math.floor(newIndex / cols)
      const currentCol = newIndex % cols
      const newRow = currentRow + y
      const newCol = currentCol + x

      // If the new move is out of bounds, nothing happens
      if (newRow >= rows || newCol >= cols || newRow < 0 || newCol < 0) {
        break
      }
      newIndex = newRow * cols + newCol

      // If the new card is not hidden, it's a valid move
      if (!this.cards[newIndex].classList.contains('hidden')) {
        break
      }

      // If the newIndex is the same as the starting index, break to prevent an infinite loop
      if (newIndex === this.currentCardIndex) {
        break
      }
    }

    this.currentCardIndex = newIndex

    this.cards.forEach(card => card.classList.remove('focused')) // Remove the focused class from all cards
    this.cards[this.currentCardIndex].classList.add('focused') // Add the focused class to the current card
  }

  /**
   * Flips a card when the 'Enter' key is pressed.
   */
  flipCardByKey () {
    const card = this.cards[this.currentCardIndex] // Get the current card
    this.flipCard(card) // Flip the card
  }

  /**
   * Hides a given HTML element.
   * @param {HTMLElement} element - The element to hide.
   */
  hide (element) {
    element.style.display = 'none'
  }

  /**
   * Shows a previously hidden HTML element.
   * @param {HTMLElement} element - The element to show.
   */
  show (element) {
    element.style.display = 'block'
  }
}
