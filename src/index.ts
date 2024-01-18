import { RateProvider } from "./api";

export enum StockType {
    EURO = 'EUR',
    BITCOIN = 'BTC'
}

export class Stock {
    constructor(public quantity: number, public type: StockType) { }
}

export class Wallet {
    private stocks: Stock[];

    constructor(stocks?: Stock[]) {
        this.stocks = stocks !== undefined ? stocks : [];
    }

    async value(to: StockType, rateProvider: RateProvider) {
        const conversionRequests: Promise<number>[] = [];
        for (const stock of this.stocks) {
            conversionRequests.push(rateProvider.rate(stock.type, to).then((rate) => rate * stock.quantity));
        }
        const conversions = await Promise.all(conversionRequests);
        const total = conversions.reduce((prev, curr) => prev + curr, 0);
        return total
    }
}