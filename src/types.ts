export interface SearchFormData {
  inDateEl: HTMLElement;
  outDateEl: HTMLElement;
  maxPriceEl: HTMLInputElement;
}

export interface PlacesArr {
  id: number;
  image: string;
  name: string;
  description: string;
  remoteness: number;
  bookedDates: number[];
  price: number;
}

export interface LocalStorage  {
  user: {
    username: string;
    avatarUrl: string;
  },
  favoritesAmount: [
    {
      id?: number;
      name?: string;
      image?: string;
    }
  ]
}
