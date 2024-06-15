import { WindowBase } from './WindowBase.js'
import QuizApi from './QuizAPI.js'

/**
 * The class for the quiz game.
 */
export class QuizGame extends WindowBase {
  /**
   * Constructs a new QuizGame instance, setting up the quiz API and initializing the quiz.
   * @param {string} windowId - Identifier for the window instance.
   * @param {Array} windowsArray - Array of window instances for managing multiple windows.
   */
  constructor (windowId, windowsArray) {
    super(windowId, windowsArray)
    this.apiUrl = 'https://courselab.lnu.se/quiz/question/1'
    this.quizApi = new QuizApi(this.apiUrl)

    this.initializeQuiz()
  }

  /**
   *  Initializes the quiz variables, ui components etc.
   */
  initializeQuiz () {
    this.closeButton = this.window.querySelector('.close-button')
    this.closeButton.addEventListener('click', () => this.remove())

    // Initialize quiz variables
    this.username = ''
    this.score = 0
    this.currentQuestionNumber = 1
    this.totalQuestions = 7
    this.timeLimit = 10
    this.timer = null

    // Initialize UI components
    this.initializeUI()

    // Start Quiz Game when Quiz Window is created
    this.askForUsername()
  }

  /**
   *  Initialize UI components
   */
  initializeUI () {
    // Initialize UI components
    this.usernameInput = this.window.querySelector('#username-input')
    this.usernameContainer = this.window.querySelector('#username-container')
    this.invalidUsername = this.window.querySelector('#invalid-username')
    this.startQuizButton = this.window.querySelector('#start-quiz-button')

    this.quizContainer = this.window.querySelector('#quiz-container')
    this.questionContainer = this.window.querySelector('#question-container')
    this.answersContainer = this.window.querySelector('#answers-container')
    this.highScoresList = this.window.querySelector('#high-scores-list')
    this.highScoresSection = this.window.querySelector('#high-scores')
    this.questionText = this.window.querySelector('#question-text')
    this.timerElement = this.window.querySelector('#timer')
    this.feedbackElement = this.window.querySelector('#feedback')

    this.submitAnswerButton = this.window.querySelector('#submit-button')
    this.restartQuizButton = this.window.querySelector('#restart-button')
    this.highScoresButton = this.window.querySelector('#high-scores-button')

    // event listeners
    this.highScoresButton.addEventListener('click', () => this.displayHighScores())
    this.restartQuizButton.addEventListener('click', () => this.restartGame())
    this.submitAnswerButton.addEventListener('click', () => this.processAnswer())
  }

  /**
   * Asks the user for a username and starts the quiz game.
   */
  askForUsername () {
    this.startQuizButton.addEventListener('click', () => {
      const username = this.usernameInput.value.trim()
      if (username) {
        this.usernameContainer.style.display = 'none'
        this.username = username
        this.start()
      } else {
        this.invalidUsername.textContent = 'Please enter a username'
      }
    })
  }

  /**
   * Starts the quiz game. It's asynchronous because it awaits the loadQuestion method,
   * which involves fetching a question from an API.
   */
  async start () {
    this.score = 0
    this.currentQuestionNumber = 1
    this.hideElement(this.questionContainer)
    this.hideElement(this.restartQuizButton)
    this.hideElement(this.highScoresButton)
    this.feedbackElement.textContent = ''
    this.startTime = Date.now()
    await this.loadQuestion(this.quizApi.apiUrl)
  }

  /**
   * Starts the timer for the quiz game.
   */
  startTimer () {
    this.timeLeft = this.timeLimit
    this.timerElement.textContent = `Time left: ${this.timeLeft}s`
    this.timer = setInterval(() => {
      this.timeLeft -= 1
      this.timerElement.textContent = `Time left: ${this.timeLeft}s`

      if (this.timeLeft <= 0) {
        clearInterval(this.timer)
        this.timerElement.textContent = 'Time is up!'
        this.handleTimeout()
      }
    }, 1000) // update every second (1000 milliseconds)
  }

  /**
   * Stops the timer and clears the timer element.
   */
  stopTimer () {
    clearInterval(this.timer)
    this.timerElement.textContent = ''
  }

  /**
   * Handles the timeout event of the quiz game.
   * Ends the game with a false(lose) result.
   */
  handleTimeout () {
    this.feedbackElement.textContent = 'You ran out of time! GAME OVER!'
    this.endGame(false)
  }

  /**
   * Loads a quiz question from the URL.
   * @param {string} url - The URL to fetch the question from.
   */
  async loadQuestion (url) {
    try {
      const data = await this.quizApi.fetchQuestion(url)
      this.currentQuestion = data
      this.displayQuestion()
    } catch (error) {
      this.feedbackElement.textContent = 'Error loading question.'
      this.showElement(this.restartQuizButton)
    }
  }

  /**
   * Displays the current question and its corresponding answer options.
   * Sets up the question text and dynamically creates answer inputs based on the question type.
   */
  displayQuestion () {
    this.questionText.textContent = this.currentQuestion.question // set the text of the question element to the current question's text
    this.answersContainer.innerHTML = '' // clear any previous answer options that were displayed

    // multiple-choice alternatives question
    if (this.currentQuestion.alternatives) {
      const alternatives = this.currentQuestion.alternatives
      const keys = Object.keys(alternatives) // get all keys of the alternatives eg alt1,alt2,alt3,alt4
      // loop through the keys and create a radio button for each alternative
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const value = alternatives[key] // values eg 2, 8, 10, 28
        const label = document.createElement('label') // create a label element for the radio button
        const radioButton = document.createElement('input') // create a radio button for the alternative
        radioButton.type = 'radio'
        radioButton.name = 'answer'
        radioButton.value = key

        label.append(radioButton, value) // append the radio button and its text to the label
        this.answersContainer.appendChild(label) // add the label (with the radio button) to the answers container
      }
    } else { // single alternative questions. Creating a text input for a written answer
      const input = document.createElement('input')
      input.type = 'text'
      input.name = 'answer'
      this.answersContainer.appendChild(input)
    }

    this.showElement(this.questionContainer)
    this.showElement(this.quizContainer)
    this.startTimer() // start the timer when a new question is displayed
  }

  /**
   * Retrieves the user's answer based on the question type.
   * @returns {string|null} The selected or entered answer, or null if none.
   */
  getAnswer () {
    const isMultipleChoice = !!this.currentQuestion.alternatives

    if (isMultipleChoice) {
      // find the selected radio button
      const selected = document.querySelector('input[name="answer"]:checked')
      if (selected) {
        return selected.value // if a radio button is selected, return its value
      } else {
        return null // the user has pressed 'submit' button without selecting an answer, return null
      }
    } else {
      // find the text input field
      const textInput = document.querySelector('input[name="answer"]')
      if (textInput) {
        return textInput.value // if the text input field exists, return its value
      } else {
        return null // if the text input field does not exist, return null
      }
    }
  }

  /**
   * Processes the user's answer, submits it to the API, and handles the quiz logic based on the API's response.
   * This method retrieves the answer, submits it using QuizAPI, and then updates the game state accordingly.
   * It handles cases for correct and incorrect answers, as well as the end-of-quiz scenario.
   */
  async processAnswer () {
    console.log('Processing answer for:', this.window.id) // debugging
    const answer = this.getAnswer()

    if (!answer) {
      this.feedbackElement.textContent = 'Please select or enter an answer'
      return
    }

    this.feedbackElement.textContent = ''
    this.stopTimer() // stop the quiz timer as an answer has been recieved and is about to be processed.

    try {
      // submit the answer via QuizAPI and wait for the response.
      const data = await this.quizApi.submitAnswer(this.currentQuestion.nextURL, answer)

      if (!data) {
        this.endGame(false) // if the answer is incorrect, end the game.
        return
      }

      // check if there are more questions or if the quiz has ended.
      if (data.nextURL && this.currentQuestionNumber < this.totalQuestions) {
        this.score++ // Increment the score for a correct answer.
        this.currentQuestionNumber++ // Move to the next question.
        await this.loadQuestion(data.nextURL) // Load the next question.
      } else {
        this.score++ // Increment score for the last question.
        this.endGame(true) // End the game with a win state.
      }
    } catch (error) {
      this.feedbackElement.textContent = 'Error submitting answer.'
    }
  }

  /**
   * Ends the quiz game.
   * @param {boolean} didWin - Whether the user won or lost the game.
   */
  endGame (didWin) {
    this.hideElement(this.questionContainer)

    // update the feedback message based on game outcome
    this.feedbackElement.textContent = didWin
      ? `Congratulations ${this.username}! YOU WON! Your score is ${this.score}/${this.totalQuestions}.`
      : `GAME OVER! Your score is ${this.score}/${this.totalQuestions}.`

    this.showElement(this.feedbackElement)
    this.showElement(this.restartQuizButton)

    if (didWin) {
      this.endTime = Date.now()
      const totalTime = this.endTime - this.startTime
      this.updateHighScores(this.username, totalTime)
      this.displayHighScores()
    } else {
      this.showElement(this.highScoresButton)
    }
  }

  /**
   * Restarts the quiz game.
   */
  restartGame () {
    this.feedbackElement.textContent = ''
    this.hideElement(this.highScoresSection)
    this.start()
  }

  /**
   * Hide an element
   * @param {HTMLElement} element - The element to hide
   */
  hideElement (element) {
    element.style.display = 'none'
  }

  /**
   * Show an element
   * @param {HTMLElement} element - The element to show
   */
  showElement (element) {
    element.style.display = 'block'
  }

  /**
   * Update high scores
   * @param {string} username - The username
   * @param {number} time - The time taken to complete the quiz
   */
  updateHighScores (username, time) {
    // retrieve existing high scores from Web Storage or set default if none
    const highScores = JSON.parse(localStorage.getItem('ls224nh_highScores')) || []

    highScores.push({ username, time }) // add new score to the list

    highScores.sort((a, b) => a.time - b.time)// sort the scores by time

    highScores.splice(5) // keep only the top 5 scores

    localStorage.setItem('ls224nh_highScores', JSON.stringify(highScores)) // save updated scores back to Web Storage
  }

  /**
   * Display high scores
   */
  displayHighScores () {
    // retrieve existing high scores from Web Storage or set default if none
    const highScores = JSON.parse(localStorage.getItem('ls224nh_highScores')) || []

    this.highScoresList.innerHTML = '' // clear existing list

    // loop through the high scores and add each one to the list
    for (let i = 0; i < highScores.length; i++) {
      const score = highScores[i]
      const timeInSeconds = (score.time / 1000).toFixed(2) // convert time to seconds (2 decimal)
      const scoreElement = document.createElement('li') // create a list item for the score
      scoreElement.textContent = `${i + 1}. ${score.username} - ${timeInSeconds} seconds` // set the text of the list item
      this.highScoresList.appendChild(scoreElement) // add the list item to the list
    }

    // show the high scores section
    this.showElement(this.highScoresSection)
    this.hideElement(this.feedbackElement)
    this.hideElement(this.highScoresButton)
  }
}
