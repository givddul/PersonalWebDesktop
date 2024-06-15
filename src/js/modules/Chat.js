import { WindowBase } from './WindowBase.js'

/**
 * The class for the chat application.
 */
export class Chat extends WindowBase {
  constructor (windowId, windowsArray) {
    super(windowId, windowsArray)
    this.initializeWindow()
    this.initializeChat()
  }

  /**
   * Initializes the window by adding event listeners to the close button.
   */
  initializeWindow () {
    this.closeButton = this.window.querySelector('.close-button')
    this.closeButton.addEventListener('click', () => this.remove())
  }

  /**
   * Sets up the chat interface including WebSocket connection and UI elements.
   */
  initializeChat () {
    this.socket = new WebSocket('wss://courseLab.lnu.se/message-app/socket')
    this.chatWindow = this.window.querySelector('#chat-window')
    this.messageContainer = this.window.querySelector('#message-container')
    this.messageInput = this.window.querySelector('#message-input')
    this.sendButton = this.window.querySelector('#send-button')
    this.usernameInput = this.window.querySelector('#username-input-chat')
    this.usernameSubmit = this.window.querySelector('#username-submit')
    this.emojiPicker = this.window.querySelector('#emoji-picker')
    this.emojiButton = this.window.querySelector('#emoji-button')
    this.changeUsernameButton = this.window.querySelector('#change-username-button')
    this.usernameContainer = this.window.querySelector('#username-container')

    this.sendSound = new Audio('./sounds/send.mp3')
    this.receiveSound = new Audio('./sounds/receive.mp3')

    this.username = localStorage.getItem('username') || ''

    if (this.username) {
      this.chatWindow.style.display = 'block'
      this.usernameContainer.style.display = 'none'
    } else {
      this.chatWindow.style.display = 'none'
    }

    this.loadChatHistory()
    this.addEventListeners()
  }

  /**
   * Adds necessary event listeners for chat functionalities.
   */
  addEventListeners () {
    this.usernameSubmit.onclick = () => this.setUsername()
    this.sendButton.onclick = () => this.sendMessage()
    this.socket.onmessage = (event) => this.receiveMessage(event)

    this.emojiButton.addEventListener('click', () => {
      const isDisplayed = this.emojiPicker.style.display === 'block'
      this.emojiPicker.style.display = isDisplayed ? 'none' : 'block'
    })

    this.emojiPicker.querySelectorAll('.emoji').forEach(emoji => {
      emoji.addEventListener('click', () => {
        const emojiSymbol = emoji.textContent
        this.messageInput.value += emojiSymbol
        this.emojiPicker.style.display = 'none'
      })
    })

    this.changeUsernameButton.addEventListener('click', () => {
      this.usernameContainer.style.display = 'block'
      this.chatWindow.style.display = 'none'
    })
  }

  /**
   * Sets the username based on the input and updates the UI accordingly.
   */
  setUsername () {
    this.username = this.usernameInput.value.trim()
    if (this.username) {
      localStorage.setItem('username', this.username)
      this.chatWindow.style.display = 'block'
      this.usernameContainer.style.display = 'none'
      this.messageInput.style.display = 'block'
      this.sendButton.style.display = 'block'
    }
  }

  /**
   * Sends a chat message over the WebSocket connection.
   */
  sendMessage () {
    const message = this.messageInput.value.trim()
    if (message && this.username) {
      this.socket.send(JSON.stringify({
        type: 'message',
        data: message,
        username: this.username,
        channel: 'my, not so secret, channel',
        key: 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
      }))
      this.messageInput.value = ''
      this.sendSound.play()
      // Save message to local storage
      this.saveMessageToHistory({ username: this.username, message })
    }
  }

  /**
   * Handles incoming WebSocket messages and updates the chat UI. Also saves the message to local storage.
   * @param {Event} event - The WebSocket message event.
   */
  receiveMessage (event) {
    const messageData = JSON.parse(event.data)
    if (messageData.type === 'message' && messageData.username !== 'Server') {
      const messageClass = messageData.username === this.username ? 'self' : 'other'
      const messageElement = document.createElement('div')
      messageElement.className = `message ${messageClass}`
      messageElement.textContent = `${messageData.username}: ${messageData.data}`
      this.messageContainer.appendChild(messageElement)
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight
      if (messageData.username !== this.username) {
        // Save received message to local storage
        this.saveMessageToHistory({ username: messageData.username, message: messageData.data })
        this.receiveSound.play()
      }
    }
  }

  /**
   * Saves a chat message to local storage history.
   * @param {object} message - The message containing username and message text.
   */
  saveMessageToHistory (message) {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || []
    chatHistory.push(message)
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
  }

  /**
   * Loads and displays chat history from local storage.
   */
  loadChatHistory () {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || []
    chatHistory.forEach(msg => {
      const messageClass = msg.username === this.username ? 'self' : 'other'
      const messageElement = document.createElement('div')
      messageElement.className = `message ${messageClass}`
      messageElement.textContent = `${msg.username}: ${msg.message}`
      this.messageContainer.appendChild(messageElement)
    })
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight
  }
}
