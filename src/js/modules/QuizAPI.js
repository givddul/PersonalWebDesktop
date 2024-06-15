/**
 * A class that provides methods for fetching quiz questions and submitting answers to the quiz API.
 */
export default class QuizApi {
  constructor (apiUrl) {
    this.apiUrl = apiUrl
  }

  /**
   * Fetches a quiz question from the provided URL.
   * @param {string} url - The URL from which to fetch the question.
   * @returns {Promise<object>} A promise that resolves to the question object.
   * @throws {Error} Throws an error if the network response is not ok.
   */
  async fetchQuestion (url) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  }

  /**
   * Submits the user's answer to the quiz API and retrieves the response.
   * @param {string} url - The URL to which the answer should be submitted.
   * @param {string} answer - The user's answer to the current quiz question.
   * @returns {Promise<object | null>} A promise that resolves to the response object, or null if the response is not ok.
   */
  async submitAnswer (url, answer) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    })
    // a false answer will return a 400 status code
    if (response.status === 400) {
      return null
    }
    return response.json()
  }
}
