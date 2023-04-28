import { sdk } from './flat-rent-sdk.js';
import { renderBlock, renderToast } from './lib.js';
import { renderSearchResultsBlock } from './search-results.js';
import { PlacesArr, SearchFormData, searchParamsObj } from './types';

export const placesArr: PlacesArr[] = [];

export const searchParams: searchParamsObj = {
  dateIn: 0,
  dateOut: 0,
  priceMax: 0,
};

export let updated = true;

const updatedTimout = (time: number) => {
  let timeOut = time * 60 * 1000;

  setTimeout(() => {
    updated = false;
    renderToast(
      {text: 'Необходимо обновить данные поиска', type: 'error'},
      {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
    );
  }, timeOut);
};

export function dateToUnixStamp(date) {
  return date / 1000
}

let coordinates = '0.0,0.0';

navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  coordinates = latitude.toString() + ',' + longitude.toString();
}, (error) => {
  console.log(error)
}, {
  enableHighAccuracy: true
});

export const search = () => {
  const searchData: SearchFormData = {
    inDateEl: document.getElementById('check-in-date'),
    outDateEl: document.getElementById('check-out-date'),
    maxPriceEl: document.getElementById('max-price') as HTMLInputElement,
    };

  const searchButton = document.getElementById('search-button');
  searchButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    if(searchData.inDateEl instanceof HTMLInputElement) {
      searchParams.dateIn = new Date(searchData.inDateEl.value).getTime();
    }
    if(searchData.outDateEl instanceof HTMLInputElement) {
      searchParams.dateOut = new Date(searchData.outDateEl.value).getTime();
    }
    if(searchData.maxPriceEl instanceof HTMLInputElement && searchData.maxPriceEl.value.length > 0) {
      searchParams.priceMax = +searchData.maxPriceEl.value;
    }

    updated = true;
    fetch(`http://localhost:3030/places?` +
      `coordinates=${coordinates}&` +
      `checkInDate=${dateToUnixStamp(searchParams.dateIn)}&` +
      `checkOutDate=${dateToUnixStamp(searchParams.dateOut)}&` +
      `maxPrice=${searchParams.priceMax}&`
    )
      .then((response) => response.json())
      .then((data) => {
        placesArr.splice(0, placesArr.length, ...data);
      })
      .then(() => {
        sdk.search({
          coordinates: coordinates,
          checkInDate: new Date(searchParams.dateIn),
          checkOutDate: new Date(searchParams.dateOut),
          priceLimit: searchParams.priceMax,
        })
          .then((data: PlacesArr[]) => {
            placesArr.splice(placesArr.length, 0, ...data);
            renderSearchResultsBlock(placesArr);
            updatedTimout(5);
          })
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
            renderToast(
              {text: `${err}`, type: 'error'},
              {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
            );
          });
      })
      .catch(function(err) {
        console.log('Fetch Error :-S', err);
        renderToast(
          {text: `${err}`, type: 'error'},
          {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
        );
      });
  });
};

// localStorage.clear();

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
