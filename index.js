const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const DISPLAY_MODE = {
  ListMode: 'ListMode',
  CardMode: 'CardMode',
}

const controller = {
  currentMode: DISPLAY_MODE.CardMode,
  page: 1,
}

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const listMode = document.querySelector('#list-mode')
const cardMode = document.querySelector('#card-mode')

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results

      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date:' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
      `
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function renderMovieList(data) {
  let rawHTML = ''
  if (controller.currentMode === 'ListMode') {
    data.forEach((item) => {
      //title, image, id 隨著每個 item 改變
      rawHTML += `
        <table class="table align-middle table-responsive mb-0">
          <tbody>
            <tr>
              <td class="col-8 card-title">${item.title}</td>
              <td>
                <button class="col-2 btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="col-2 btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </td>
            </tr>
          </tbody>
        </table>
      `
    })
  } else {
    data.forEach((item) => {
      //title, image, id 隨著每個 item 改變
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
    })
  }
  dataPanel.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

// 監聽 data-panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  }
  else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  controller.page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(controller.page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

listMode.addEventListener('click', function onListModeClick(event) {
  controller.currentMode = DISPLAY_MODE.ListMode
  console.log(controller.currentMode)
  renderMovieList(getMoviesByPage(controller.page))
})

cardMode.addEventListener('click', function onCardModeClick(event) {
  controller.currentMode = DISPLAY_MODE.CardMode
  console.log(controller.currentMode)
  renderMovieList(getMoviesByPage(controller.page))
})

axios
  .get(INDEX_URL).then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

