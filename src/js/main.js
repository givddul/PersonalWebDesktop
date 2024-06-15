import { QuizGame } from './modules/QuizGame.js'
import { MemoryGame } from './modules/MemoryGame.js'
import { Chat } from './modules/Chat.js'
import { TimerStopWatch } from './modules/TimerStopWatch.js'

const windows = []

/**
 * Creates a new window and adds it to the windows array
 * @param {string} windowType - the type of window to create
 */
function createWindow (windowType) {
  const newWindow = document.createElement('div')
  newWindow.className = `${windowType}-window`
  newWindow.id = `${windowType}Window-${windows.length}`

  const offset = 30
  const topOffset = 50 + (windows.length * offset)
  const leftOffset = 50 + (windows.length * offset)
  newWindow.style.top = `${topOffset}px`
  newWindow.style.left = `${leftOffset}px`

  document.body.appendChild(newWindow)

  let windowInstance
  if (windowType === 'quiz') {
    newWindow.innerHTML = `
            <div class="quiz-window-header">
                <div class="close-button">X</div>
            </div>
           
            <div id="username-container">
                <h3>Enter Your Username</h3>
                <input type="text" id="username-input" placeholder="Username">
                <button id="start-quiz-button">
                    Start Quiz
                </button>
                <p id="invalid-username"></p>
            </div>


            <div id="quiz-container" style="display:none;">
                <div id="timer">Time left: 10s</div>
                <div id="question-container">
                    <h2 id="question-text"></h2>
                    <div id="answers-container"></div>
                    <button id="submit-button">Submit Answer</button>
                </div>
                <p id="feedback"></p>
                <div id="high-scores" style="display:none;">
                    <h2>Highscores</h2>
                    <ul id="high-scores-list"></ul>
                </div>
                <button id="high-scores-button" style="display:none;">Display High Scores</button>
                <button id="restart-button">Restart Quiz</button>
            </div>
        `
    windowInstance = new QuizGame(newWindow.id, windows)
  } else if (windowType === 'memory') {
    newWindow.innerHTML = `
            <div class="memory-window-header">
                <div class="close-button">X</div>
            </div>

            <div id="memory-game-container" class="memory-game-container">

                <div id="grid-selection">
                    <p>Select Grid Size:</p>
                    <select id="grid-size">
                        <option value="4">2x2</option>
                        <option value="8" selected>2x4</option>
                        <option value="16">4x4</option>
                    </select>
                    <button id="start-memory-button">Start</button>
                </div>

                <div id="game-board" class="game-board">
                    <!-- cards will be inserted here -->
                </div>

                <div id="status" style="display: none;" class="status">
                    <p><span id="attempts">0</span></p>
                    <button id="restart-memory-button">Restart</button>
                </div>

            </div>

        `
    windowInstance = new MemoryGame(newWindow.id, windows)
  } else if (windowType === 'chat') {
    newWindow.innerHTML = `
            <div class="chat-window-header">
                <div class="close-button">X</div>
            </div>
            
            <div id="username-container">
                <input type="text" id="username-input-chat" placeholder="Enter your username">
                <button id="username-submit">Chat</button>
            </div>

            <button id="change-username-button">Change Username</button>
        
            <div id="chat-window">
                <div id="message-container"></div>
                
                <div id="input-container">
                    <textarea id="message-input" placeholder="Type your message here..."></textarea>
                    <div id="emoji-picker-container">
                        <button id="emoji-button">😊</button>
                        <div id="emoji-picker" style="display: none;">
                            <span class="emoji">😀</span>
                            <span class="emoji">😂</span>
                            <span class="emoji">🤯</span>
                            <span class="emoji">💀</span>
                        </div>
                    </div>
                    <button id="send-button">Send</button>
                </div>
            </div>
        `
    windowInstance = new Chat(newWindow.id, windows)
  } else if (windowType === 'timer') {
    newWindow.innerHTML = `
            <div class="timer-window-header">
                <div class="close-button">X</div>
            </div>

            <div id="stopwatch-timer-container">
                <section class="stopwatch">
                    <h1>Stopwatch</h1>
                    <div id="stopwatch-display">00:00:00</div>
                    <button id="stopwatch-start-button">Start</button>
                    <button id="stopwatch-pause-button">Pause</button>
                    <button id="stopwatch-stop-button">Stop</button>
                    <button id="stopwatch-reset-button">Reset</button>
                    <audio id="tick-sound" src="./sounds/tick.mp3" loop></audio>

                </section>
                <section class="timer">
                    <h1>Timer</h1>
                    <input type="text" id="timer-input" placeholder="Enter time in seconds">
                    <button id="timer-start-button">Start Timer</button>
                    <div id="timer-display">00:00:00</div>
                    <button id="timer-stop-button">Stop Alarm</button>
                    <audio id="alarm-sound" src="./sounds/alarm.mp3" loop></audio>
                    <audio id="tick-sound" src="./sounds/tick.mp3" loop></audio>

                </section>
            </div>
        `
    windowInstance = new TimerStopWatch(newWindow.id, windows)
  }

  windows.push(windowInstance)
  windowInstance.showWindow()
}

const quizButton = document.getElementById('quizButton')
const memoryButton = document.getElementById('memoryButton')
const chatButton = document.getElementById('chatButton')
const timerButton = document.getElementById('timerButton')

quizButton.addEventListener('click', () => createWindow('quiz'))
memoryButton.addEventListener('click', () => createWindow('memory'))
chatButton.addEventListener('click', () => createWindow('chat'))
timerButton.addEventListener('click', () => createWindow('timer'))
