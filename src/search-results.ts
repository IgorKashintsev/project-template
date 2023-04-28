import { sdk } from './flat-rent-sdk.js';
import { renderBlock, renderToast } from './lib.js';
import { setFavoriteItem, localStorage } from './localStorage.js';
import { dateToUnixStamp, searchParams, updated } from './search-form.js';
import { PlacesArr } from './types';

export function renderSearchStubBlock () {
  renderBlock(
    'search-results-block',
    `
    <div class="before-results-block">
      <img src="img/start-search.png" />
      <p>Чтобы начать поиск, заполните форму и&nbsp;нажмите "Найти"</p>
    </div>
    `
  )
}

export function renderEmptyOrErrorSearchBlock (reasonMessage) {
  renderBlock(
    'search-results-block',
    `
    <div class="no-results-block">
      <img src="img/no-results.png" />
      <p>${reasonMessage}</p>
    </div>
    `
  )
}

let favoritesActive = '';

const setFavoritesActive = (itemPlacesArr: PlacesArr) => {
  const favoritesIdx = localStorage.favoritesAmount.findIndex(el => el.id === itemPlacesArr.id);
    if (favoritesIdx !== -1) {
      favoritesActive = 'active';
    } else {
      favoritesActive = '';
    }
};

const toggleFavoriteItem = () => {
  let favotieItems = Array.from(document.querySelectorAll('.favorites'));
  for(let item of favotieItems) {
    item.addEventListener('click', (ev) => {
      const el = ev.target;
      if (el instanceof Element) {
        let elemId =  el.getAttribute('id');
        el.classList.toggle('active');
        if(isFinite(Number(elemId))) {
          setFavoriteItem(Number(elemId));
        } else {
          setFavoriteItem(elemId);
        }
      }
    });
  }
};

const searchResultsBlock = document.getElementById('search-results-block');
searchResultsBlock.addEventListener('click', (ev) => {
  let element = ev.target as HTMLElement;
  const elId = element.dataset['id'];
  
  if(!updated) {
    return
  } else if(element.tagName === 'BUTTON') {
    if(isFinite(Number(elId))) {
      fetch(`http://localhost:3030/places/${Number(elId)}?` +
      `checkInDate=${dateToUnixStamp(searchParams.dateIn)}&` +
      `checkOutDate=${dateToUnixStamp(searchParams.dateOut)}&`,
        {method: 'PATCH'}
      )
        .then(() => {
          renderToast(
            {text: 'Отель успешно забронирован', type: 'success'},
            {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
          );
        })
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
          renderToast(
            {text: 'При бронировании возникла ошибка', type: 'error'},
            {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
          );
        });
    } else {
      sdk.book(elId, new Date(searchParams.dateIn), new Date(searchParams.dateOut))
        .then((data: []) => {
          // data.forEach((item) => console.log(new Date(item)));
          renderToast(
            {text: 'Отель успешно забронирован', type: 'success'},
            {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
          );
        })
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
          renderToast(
            {text: `${err}`, type: 'error'},
            {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
          );
        });
    }
  }
})

export function renderSearchResultsBlock (placesArr: PlacesArr[]) {
  renderBlock(
    'search-results-block',
    `
    <div class="search-results-header">
        <p>Результаты поиска</p>
        <div class="search-results-filter">
            <span><i class="icon icon-filter"></i> Сортировать:</span>
            <select>
                <option selected="">Сначала дешёвые</option>
                <option selected="">Сначала дорогие</option>
                <option>Сначала ближе</option>
            </select>
        </div>
    </div>
    ${placesArr.map((item) => {
      setFavoritesActive(item)
      return `
        <ul class="results-list">
          <li class="result">
            <div class="result-container">
              <div class="result-img-container">
                <div id="${item.id}" class="favorites ${favoritesActive}"></div>
                <img class="result-img" src="${item.image}" alt="">
              </div>	
              <div class="result-info">
                <div class="result-info--header">
                  <p>${item.name}</p>
                  <p class="price">${item.price}&#8381;</p>
                </div>
                <div class="result-info--map"><i class="map-icon"></i> ${item.remoteness} км от вас</div>
                <div class="result-info--descr">${item.description}</div>
                <div class="result-info--footer">
                  <div>
                    <button data-id="${item.id}">Забронировать</button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      `
      }).join('')
    }
    `
  )
  toggleFavoriteItem();
}
