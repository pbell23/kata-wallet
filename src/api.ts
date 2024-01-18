import * as https from 'node:https'
import * as querystring from 'node:querystring'

import { StockType } from './index.js';

export interface RateProvider {
    rate(from: StockType, to: StockType): Promise<number>
}

interface CurrencyApiResponse {
    meta: {
        last_updated_at: string;
    };
    data: {
        [currencyCode: string]: {
            code: string;
            value: number;
        };
    };
}

export class CurrencyAPI implements RateProvider {
    private static apiEndpoint = 'https://api.currencyapi.com/v3/'
    private static latestPath = 'latest'

    constructor() { }

    async rate(from: StockType, to: StockType): Promise<number> {
        if (from === to) {
            return 1;
        }
        const encodedParams = querystring.stringify({
            base_currency: from,
            currencies: to
        })
        return new Promise((resolve, reject) => {
            https.get(`${CurrencyAPI.apiEndpoint}${CurrencyAPI.latestPath}?${encodedParams}`, {
                headers: {
                    apikey: process.env.CURRENCY_API_KEY
                }
            }, (res) => {
                let data = ''
                const handleEnd = (data: string) => {
                    const parsed = JSON.parse(data) as CurrencyApiResponse
                    const value = parsed.data[to]?.value || 0;
                    resolve(value)
                }
                res.on('data', chunk => data += chunk);
                res.on('error', err => reject(err));
                res.on('end', () => handleEnd(data));
            })
        })
    }
}

export const currencyApi = new CurrencyAPI()