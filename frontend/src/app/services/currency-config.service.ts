import { Injectable } from '@angular/core';
declare const require: any;
const getSymbolFromCurrency: (currencyCode: string) => string | undefined = require('currency-symbol-map');

@Injectable({
  providedIn: 'root'
})
export class CurrencyConfigService {
  private readonly storageKey = 'currencyCode';
  private readonly defaultCode = 'HNL';

  getCurrencyCode(): string {
    const code = (localStorage.getItem(this.storageKey) || this.defaultCode).toUpperCase().trim();
    return /^[A-Z]{3}$/.test(code) ? code : this.defaultCode;
  }

  setCurrencyCode(code: string | null | undefined): void {
    const normalized = (code || this.defaultCode).toUpperCase().trim();
    localStorage.setItem(this.storageKey, /^[A-Z]{3}$/.test(normalized) ? normalized : this.defaultCode);
  }

  getCurrencySymbol(code?: string | null): string {
    const currencyCode = (code || this.getCurrencyCode()).toUpperCase().trim();
    return getSymbolFromCurrency(currencyCode) || currencyCode;
  }

  formatAmount(value: number, code?: string | null): string {
    const amount = Number(value) || 0;
    const symbol = this.getCurrencySymbol(code);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    return `${symbol} ${formatted}`;
  }
}
