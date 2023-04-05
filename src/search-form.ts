import { renderBlock, renderToast } from './lib.js';
import { renderSearchResultsBlock } from './search-results.js';
import { PlacesArr, SearchFormData } from './types';

export const placesArr: PlacesArr[] = [];

export const searchParams = {
  dateIn: 0,
  dateOut: 0,
  priceMax: 0,
};

export let updated = true;

export const search = () => {
  const searchData: SearchFormData = {
    inDateEl: document.getElementById('check-in-date'),
    outDateEl: document.getElementById('check-out-date'),
    maxPriceEl: document.getElementById('max-price') as HTMLInputElement,
    };

  const coordinates = `59.9386,30.3141`;

  searchData.maxPriceEl.addEventListener('change', () => {
    if(searchData.maxPriceEl.value.match(/^[0-9]+$/)) {
      searchData.maxPriceEl.classList.remove('error');
    }
  });

  const searchButton = document.getElementById('search-button');
  searchButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    if(!searchData.maxPriceEl.value) {
      searchData.maxPriceEl.classList.add('error');
      return
    }
    if(searchData.inDateEl instanceof HTMLInputElement) {
      searchParams.dateIn = new Date(searchData.inDateEl.value).getTime();
    }
    if(searchData.outDateEl instanceof HTMLInputElement) {
      searchParams.dateOut = new Date(searchData.outDateEl.value).getTime();
    }
    if(searchData.maxPriceEl instanceof HTMLInputElement) {
      searchParams.priceMax = +searchData.maxPriceEl.value;
    }

    if(!searchData.maxPriceEl.value.match(/^[0-9]+$/)) {
      renderToast(
        {text: 'В максимальную цену необходимо вводить числовое значение, без пробелов и спецсимволов', type: 'success'},
        {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
      );
    } else if(searchParams.dateOut <= searchParams.dateIn) {
      renderToast(
        {text: 'Дата выезда должна быть позже даты въезда', type: 'success'},
        {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
      );
    } else {
      updated = true;
      fetch(`http://localhost:3030/places?` +
        `coordinates=${coordinates}&` +
        `checkInDate=${searchParams.dateIn}&` +
        `checkOutDate=${searchParams.dateOut}&` +
        `maxPrice=${searchParams.priceMax}&`
      )
        .then((response) => response.json())
        .then((data) => {
          placesArr.splice(0, placesArr.length, ...data);
          renderSearchResultsBlock(placesArr);
          setTimeout(() => {
            updated = false;
            renderToast(
              {text: 'Необходимо изменить данные поиска', type: 'success'},
              {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
            );
          }, 300000);
        })
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });
    }
  });
};

export function renderSearchFormBlock (dateNow: String, arrivalDay: String, departureDay: String, lastDay: String) {
  renderBlock(
    'search-form-block',
    `
    <form>
      <fieldset class="search-filedset">
        <div class="row">
          <div>
            <label for="city">Город</label>
            <input id="city" type="text" disabled value="Санкт-Петербург" />
            <input type="hidden" disabled value="59.9386,30.3141" />
          </div>
          <!--<div class="providers">
            <label><input type="checkbox" name="provider" value="homy" checked /> Homy</label>
            <label><input type="checkbox" name="provider" value="flat-rent" checked /> FlatRent</label>
          </div>--!>
        </div>
        <div class="row">
          <div>
            <label for="check-in-date">Дата заезда</label>
            <input id="check-in-date" type="date" value=${arrivalDay} min=${dateNow} max=${lastDay} name="checkin" />
          </div>
          <div>
            <label for="check-out-date">Дата выезда</label>
            <input id="check-out-date" type="date" value=${departureDay} min=${dateNow} max=${lastDay} name="checkout" />
          </div>
          <div>
            <label for="max-price">Макс. цена суток</label>
            <input id="max-price" type="text" value="" name="price" class="max-price" />
          </div>
          <div>
            <div><button id="search-button">Найти</button></div>
          </div>
        </div>
      </fieldset>
    </form>
    `
  )
}
