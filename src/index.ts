import { renderSearchFormBlock } from './search-form.js';
import { renderSearchStubBlock } from './search-results.js';
import { renderUserBlock } from './user.js';
import { renderToast } from './lib.js';
// import avatar from '../public/img/avatar.png';

window.addEventListener('DOMContentLoaded', () => {
  const date = new Date();
  const dateNow = new Date().toISOString().slice(0, 10);
  const arrivalDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2).toISOString().slice(0, 10);
  const departureDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 4).toISOString().slice(0, 10);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 2, 0).toISOString().slice(0, 10);

  // renderUserBlock('Wade Warren', avatar, 2)
  // renderSearchFormBlock(dateNow, arrivalDay, departureDay, lastDay)
  // renderSearchStubBlock()
  // renderToast(
  //     {text: 'Это пример уведомления. Используйте его при необходимости', type: 'success'},
  //     {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
  // )
  renderUserBlock('Wade Warren', '/img/avatar.png', 2)
  renderSearchFormBlock(dateNow, arrivalDay, departureDay, lastDay)
  renderSearchStubBlock()
  renderToast(
      {text: 'Это пример уведомления. Используйте его при необходимости', type: 'success'},
      {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
  )
})
