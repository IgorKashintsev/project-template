import { placesArr } from './search-form.js';
import { LocalStorage } from './types'
import { renderUserBlock } from './user.js';

export const localStorage: LocalStorage = {
  user: {
    username: 'Wade Warren',
    avatarUrl: '/img/avatar.png',
  },
  favoritesAmount: [{}],
};

export const setFavoriteItem = (itemId: number) => {
  const favoritesIdx = localStorage.favoritesAmount.findIndex(item => item.id === itemId);
  const favoritesObj = placesArr.find(item => item.id === itemId);
  
  if(favoritesIdx === -1) {
    localStorage.favoritesAmount.push({
      id: itemId,
      name: favoritesObj.name,
      image: favoritesObj.image,
    })
  } else {
    localStorage.favoritesAmount.splice(favoritesIdx, 1);
  }
  renderUserBlock(
    localStorage.user.username,
    localStorage.user.avatarUrl,
    localStorage.favoritesAmount.length - 1,
  )
};
