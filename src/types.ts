export interface SearchFormData {
  inDateEl: HTMLElement;
  outDateEl: HTMLElement;
  maxPriceEl: HTMLInputElement;
}

export interface searchParamsObj {
  dateIn: number;
  dateOut: number;
  priceMax: number;
};

export interface PlacesArr {
  id: number | string;
  image: string;
  name: string;
  description: string;
  coordinates: number[];
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
      id?: number | string;
      name?: string;
      image?: string;
    }
  ]
}
