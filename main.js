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
