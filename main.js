let DOM = {}
const bodyExp = /<body>(?<body>[^]+?)<\/body>/gm
const parser = new DOMParser()

async function sleep(timeInMillis = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeInMillis))
}

async function getPageComments(username, page) {
  const url = `https://old.meneame.net/user/${username}/commented?page=${page}`
  const response = await fetch(url)
  const html = (await response.text()) || ''
  const container = parser.parseFromString(html, 'text/html')
  const commentsCollection = container.getElementsByClassName('comment-text')
  return commentsCollection.length
    ? Array.from(commentsCollection).map((i) => i.innerText.trim())
    : []
}

async function getAllComments(username, maxPages = 0) {
  const comments = []
  let page = 1
  while (true) {
    console.log('Getting page', page)
    const results = await getPageComments(username, page)
    if (!results.length) break
    comments.push(...results)
    page++
    if (maxPages && page > maxPages) break
    await sleep(10)
  }
  return comments
}

async function findUserComments(username, str, maxPages) {
  const comments = await getAllComments(username, maxPages)
  return comments.filter((i) => i.includes(str))
}

async function performSearch() {
  const username = DOM.usernameInput.value.trim()
  const searchQuery = DOM.searchQueryInput.value.trim()
  const maxPages = Number(DOM.maxPagesInput.value)

  if (!username || !searchQuery || !searchQuery) {
    alert('Por favor rellena todos los campos del formulario')
    return
  }

  DOM.resultsContainer.innerHTML = ''
  DOM.loader.removeAttribute('hidden', true)
  let formattedResults
  const results = await findUserComments(username, searchQuery, maxPages)
  if (results.length) {
    formattedResults = results.map((i) => {
      const formattedComment = i
        .replaceAll(
          searchQuery || null,
          `<span class="match-string">${searchQuery}</span>`
        )
        .replaceAll('\n', '<br/>')
      return `<div class="comment">${formattedComment}</div>`
    })
  } else {
    formattedResults = [
      '<div class="no_results">No se han encontrado resultados</div>',
    ]
  }

  DOM.loader.setAttribute('hidden', true)
  DOM.resultsContainer.innerHTML = formattedResults.join('')
}

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('aa')
  DOM = {
    submitButton: document.getElementById('submitButton'),
    usernameInput: document.getElementById('usernameInput'),
    maxPagesInput: document.getElementById('maxPagesInput'),
    searchQueryInput: document.getElementById('searchQueryInput'),
    resultsContainer: document.getElementById('resultsContainer'),
    loader: document.getElementById('loader'),
  }
  DOM.submitButton.addEventListener('click', performSearch)
})
