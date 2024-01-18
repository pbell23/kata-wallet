import { describe, expect, test } from '@jest/globals'

import { Stock } from './index';
import { StockType } from './index';
import { Wallet } from './index';
import { currencyApi } from './api';

describe('Wallet', () => {
  test('Given an empty wallet, it should return 0 euros', async () => {
    const wallet = new Wallet();
    expect(await wallet.value(StockType.EURO, currencyApi)).toEqual(0);
  });
  test('Given a wallet with 5 euros, it should return 5 euros', async () => {
    const euroStock = new Stock(5, StockType.EURO)
    const wallet = new Wallet([euroStock]);

    expect(await wallet.value(StockType.EURO, currencyApi)).toEqual(5);
  });
  test('Given a wallet with multiple euro stocks, it should return the total value in euro', async () => {
    const euroStockValues = [2, 5, 9];
    const euroStockSum = euroStockValues.reduce((prev, val) => {
      return prev + val
    }, 0)

    const multipleEuroStocks = euroStockValues.map((euro) => new Stock(euro, StockType.EURO))
    const wallet = new Wallet(multipleEuroStocks);
    const walletValueInEuro = await wallet.value(StockType.EURO, currencyApi)

    expect(walletValueInEuro).toEqual(euroStockSum);
  });
  test('Given a wallet with multiple bitcoin stocks, it should return the total value in euro', async () => {
    const bitcoinStockValues = [2, 5];
    const bitcoinStockSum = bitcoinStockValues.reduce((prev, val) => {
      return prev + val
    }, 0)

    const btcPriceInEuro = await currencyApi.rate(StockType.BITCOIN, StockType.EURO)
    const multipleBitcoinStocks = bitcoinStockValues.map((btc) => new Stock(btc, StockType.BITCOIN))

    const wallet = new Wallet(multipleBitcoinStocks);
    const walletValueInEuro = await wallet.value(StockType.EURO, currencyApi)

    expect(walletValueInEuro).toEqual(bitcoinStockSum * btcPriceInEuro);
  });
  test('Given a wallet with mixed bitcoin and euro stocks, it should return the total value in euro', async () => {
    const bitcoinStockValues = [2, 5];
    const euroStockValues = [2, 5, 9];

    const bitcoinStockSum = bitcoinStockValues.reduce((prev, val) => {
      return prev + val
    }, 0)
    const euroStockSum = euroStockValues.reduce((prev, val) => {
      return prev + val
    }, 0)

    const btcPriceInEuro = await currencyApi.rate(StockType.BITCOIN, StockType.EURO)
    const bitcoinStocks = bitcoinStockValues.map((btc) => new Stock(btc, StockType.BITCOIN))
    const euroStocks = euroStockValues.map((euro) => new Stock(euro, StockType.EURO))

    const wallet = new Wallet([...bitcoinStocks, ...euroStocks]);
    const walletValueInEuro = await wallet.value(StockType.EURO, currencyApi)

    expect(walletValueInEuro).toEqual(bitcoinStockSum * btcPriceInEuro + euroStockSum);
  });
});
