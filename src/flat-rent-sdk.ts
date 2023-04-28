import { PlacesArr } from './types'

const database: PlacesArr[] = [
    {
        id: 'vnd331',
        name: 'Radisson Royal Hotel',
        description: 'Отель расположен в 4 минутах ходьбы от станции метро «Маяковская». К услугам гостей фитнес-центр и спа-центр с сауной и гидромассажной ванной.',
        image: "../img/vnd331.png",
        coordinates: [59.9322936,30.3460129],
        remoteness: 0,
        bookedDates: [],
        price: 12000
    },
    {
        id: 'ab2e2',
        name: 'Номера на Садовой',
        description: 'Расположен в 7 минутах ходьбы от Невского проспекта. К услугам гостей круглосуточная стойка регистрации и бесплатный Wi-Fi.',
        image: "../img/ab2e2.png",
        coordinates: [59.930325,30.3291592],
        remoteness: 0,
        bookedDates: [],
        price: 4500
    },
    {
        id: 'mvm32l',
        name: 'Мини Отель на Невском 136',
        description: 'Мини-отель расположен в Санкт-Петербурге, в 5 минутах ходьбы от станции метро «Площадь Восстания» и Московского железнодорожного вокзала.',
        image: "../img/mvm32l.png",
        coordinates: [59.9299603,30.3658932],
        remoteness: 0,
        bookedDates: [],
        price: 3800
    },
    {
        id: 'bvep12',
        name: 'Отель Усадьба Державина',
        description: 'Прекрасный отель недалеко от Исаакиевского собора с бесплатным Wi-Fi на всей территории.',
        image: "../img/bvep12.png",
        coordinates: [59.9194966,30.309389],
        remoteness: 0,
        bookedDates: [],
        price: 8700
    }
]

// export function cloneDate(date: Date) {
//     return new Date(date.getTime())
// }

// export function addDays(date: Date, days: number) {
//     date.setDate(date.getDate() + days)
//     return date
// }

// export const backendPort = 3040
export const localStorageKey = 'flat-rent-db';

export class FlatRentSdk {
  database: PlacesArr[];

    constructor() {
        if (this._readDatabase() == null) {
            this._writeDatabase(database)
        }

        this.database = this._readDatabase()
    }

    /**
     * Get flat by ID.
     * 
     * @param {string} id Flat ID.
     * @returns {Promise<Object|null>} Flat.
     */
    get(id: string) {
        const flat = this.database.find((item) => {
            return item.id === id
        })

        return Promise.resolve(flat == null ? flat : this._formatFlatObject(flat))
    }

    /**
     * Search for flats.
     * 
     * @param {Object} parameters Search parameters
     * @param {string}parameters.city City name
     * @param {Date} parameters.checkInDate Check-in date
     * @param {Date} parameters.checkOutDate Check-out date
     * @param {number} [parameters.priceLimit] Max price for a night
     * @returns {Object[]} List of suitable flats.
     */
    search(parameters: { coordinates: string; checkInDate: Date; checkOutDate: Date; priceLimit?: number }) {
        return new Promise((resolve, reject) => {
            try {
                // if (parameters.city != 'Санкт-Петербург') {
                //     throw new Error(`Passed unsupported city - "${parameters.city}".`)
                // }

                if (!(parameters.checkInDate instanceof Date) || !(parameters.checkOutDate instanceof Date)) {
                    throw new Error(`Passed invalid check-in or check-out date - from "${parameters.checkInDate}" to "${parameters.checkOutDate}".`)
                }
                this._assertDatesAreCorrect(parameters.checkInDate, parameters.checkOutDate)

                if (parameters.priceLimit != null && (isNaN(parameters.priceLimit) || !isFinite(parameters.priceLimit))) {
                    throw new Error(`Passed invalid price limit - "${parameters.priceLimit}".`)
                }
        
                let flats = this.database
        
                if (parameters.priceLimit !== null && parameters.priceLimit !== 0) {
                    flats = flats.filter((flat) => {
                      if (parameters.priceLimit !== undefined && flat.price !== undefined) {
                        return flat.price <= parameters.priceLimit
                      }
                    })
                }
        
                const dateRange = this._generateDateRange(parameters.checkInDate, parameters.checkOutDate)
                flats = flats.filter((flat) => {
                    return this._areAllDatesAvailable(flat, dateRange)
                })
        
                flats = flats.map((flat) => {
                   return this._formatFlatObject(flat, dateRange.length - 1)
                })

                resolve(flats)
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Book flat.
     * 
     * @param {number | string} flatId 
     * @param {Date} checkInDate 
     * @param {Date} checkOutDate
     * @returns {number}
     */
    book(flatId: number | string, checkInDate: Date, checkOutDate: Date) {
        return new Promise((resolve, reject) => {
            try {
                const flat = this.database.find((item) => {
                    return item.id === flatId
                })
        
                if (flat == null) {
                    throw new Error('There is no flat with ID "' + flatId + '".')
                }
                this._assertDatesAreCorrect(checkInDate, checkOutDate)
        
                const datesToBook: Date[] = this._generateDateRange(checkInDate, checkOutDate)
                
                if (!this._areAllDatesAvailable(flat, datesToBook)) {
                    throw new Error(`Flat ${flat.id} is not available for dates ${datesToBook.join(",")}.`)
                }
        
                const bookedDates = datesToBook.map((date) => {
                    return date.getTime()
                })
                flat.bookedDates.push(...bookedDates)
                for (let i = 0; i < this.database.length; i++) {
                    if (this.database[i].id === flat.id) {
                        this.database[i] = flat
                        break
                    }
                }
                this._writeDatabase(this.database)
        
                // resolve(this._generateTransactionId())
                resolve(this.database.find((item) => item.id === flatId).bookedDates)
            } catch (error) {
                reject(error)
            }
        })
    }

    _assertDatesAreCorrect(checkInDate: Date, checkOutDate: Date) {
        const today = new Date()
        this._resetTime(today)
        this._resetTime(checkInDate)
        this._resetTime(checkOutDate)

        const diffToday = this._calculateDifferenceInDays(today, checkInDate)
        if (diffToday < 0) {
            throw new Error('Check-in date can\'t be in the past.')
        }

        const diffCheck = this._calculateDifferenceInDays(checkInDate, checkOutDate)
        if (diffCheck < 0) {
            throw new Error('Check-out date must be grater then check-in date.')
        }
    }

    _resetTime(date: Date) {
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
    }

    _calculateDifferenceInDays(startDate: Date, endDate: Date) {
        const difference = endDate.getTime() - startDate.getTime()

        return Math.floor(difference / (1000 * 60 * 60 * 24))
    }

    _generateDateRange(from: Date, to: Date) {
        const dates: Date[] = [];
        const differenceInDays = this._calculateDifferenceInDays(from, to)
        
        dates.push(new Date(from.getFullYear(), from.getMonth(), from.getDate()))
        for (let i = 1; i <= differenceInDays; i++) {
          dates.push(new Date(from.getFullYear(), from.getMonth(), from.getDate() + i))
        }
    
        return dates
    }

    _generateTransactionId = () => {
        const min = 1000
        const max = 9999
        const num = Math.random() * (max - min) + min
    
        return Math.floor(num)
    }

    _areAllDatesAvailable(flat: PlacesArr, dateRange: Date[]) {
        return dateRange.every((date) => {
            return !flat.bookedDates.includes(date.getTime())
        })
    }

    _formatFlatObject(flat: PlacesArr, nightNumber?: number) {
        const formattedFlat = Object.assign({}, flat)

        if (nightNumber != null && formattedFlat.price !== undefined) {
            formattedFlat.price = nightNumber * formattedFlat.price
        }

        return formattedFlat
    }

    _readDatabase() {
        const data = window.localStorage.getItem(localStorageKey)

        if (data == null) {
            return data
        }

        return JSON.parse(data)
    }

    _writeDatabase(database: PlacesArr[]) {
        window.localStorage.setItem(localStorageKey, JSON.stringify(database))
    }

    _syncDatabase(database: PlacesArr[]) {
        this._writeDatabase(database)
        this.database = this._readDatabase()
    }
}

export const sdk = new FlatRentSdk();
