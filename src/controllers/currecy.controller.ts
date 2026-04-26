import { Request, Response } from 'express';
import { getCurrencyRate, getAllCurrencyService } from '../services/currency.service.js';
import { ApiResponse } from '../types/types.js';

export const getCurrency = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { currencyCode } = req.query;

    if (!currencyCode || typeof currencyCode !== 'string') {
      return res.status(400).json({ success: false, message: 'currencyCode query parameter is required.' });
    }

    const rate = await getCurrencyRate(currencyCode.toUpperCase());
    if (!rate) {
      return res.status(404).json({ success: false, message: 'Currency rate not found.' });
    }

    return res.status(200).json({ success: true, message: 'Currency rate retrieved successfully.', data: rate });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error retrieving currency rate' });
  }
};

export const getAllCurrency = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const currencies = await getAllCurrencyService();
    const currencyList = currencies.map(c => c.currency);
    return res.status(200).json({ success: true, message: 'Currencies retrieved successfully.', data: currencyList });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error retrieving currencies' });
  }
};
