import { renderSearchFormBlock, search } from './search-form.js';
import { renderSearchStubBlock } from './search-results.js';
import { renderUserBlock } from './user.js';
import { renderToast } from './lib.js';
import { localStorage } from './localStorage.js';

window.addEventListener('DOMContentLoaded', () => {
  const date = new Date();
  const dateNow = new Date().toISOString().slice(0, 10);
  const arrivalDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)
    .toISOString().slice(0, 10);
  const departureDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 4)
    .toISOString().slice(0, 10);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 2, 0)
    .toISOString().slice(0, 10);

  renderUserBlock(
    localStorage.user.username,
    localStorage.user.avatarUrl,
    localStorage.favoritesAmount.length - 1,
  )
  renderSearchFormBlock(dateNow, arrivalDay, departureDay, lastDay)
  renderSearchStubBlock()
  search()
})
