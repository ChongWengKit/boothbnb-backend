import cron from 'node-cron';
import { currencyRepository } from '../repository/currency.repository.js';
export async function runCurrencyUpdate() {
    try {
        const response = await fetch(`${process.env.CURRENCY_API}/v2/rates?base=USD`);
        if (!response.ok) {

            return;
        }
        const data = await response.json() as Array<{
            date: string;
            base: string;
            quote: string;
            rate: number
        }>;

        if (Array.isArray(data)) {
            for (const entry of data) {
                await currencyRepository.updateCurrencyRate(entry.quote, entry.rate);
            }
        }
    } catch (error) {
    }
}

cron.schedule('*/30 * * * *', runCurrencyUpdate);