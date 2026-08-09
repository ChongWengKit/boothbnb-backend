import { Request, Response } from 'express';
import { currencyRepository } from '../repository/currency.repository.js';
import { ApiResponse } from '../types/types.js';

export const getCurrency = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { currencyCode } = req.query as { currencyCode: string };

    const rate = await currencyRepository.getCurrencyRate(currencyCode.toUpperCase());
    if (!rate) {
      return res.status(400).json({ success: false, message: 'Currency rate not found.' });
    }

    return res.status(200).json({ success: true, message: 'Currency rate retrieved successfully.', data: rate });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error retrieving currency rate' });
  }
};

export const getAllCurrencyDetails = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const search = req.query.search as string | undefined;
    const status = req.query.status === 'true' ? true : req.query.status === 'false' ? false : undefined;
    const { data, meta } = await currencyRepository.getAllCurrencies(page, limit, search, status);
    return res.status(200).json({ 
      success: true, 
      message: 'Currency details retrieved successfully.', 
      data,
      meta 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error retrieving currency details' });
  }
};

export const updateStatus = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { currency, is_enabled } = req.body;

    const updated = await currencyRepository.updateCurrencyStatus(currency.toUpperCase(), is_enabled);
    return res.status(200).json({ 
      success: true, 
      message: `Currency ${currency} status updated to ${is_enabled ? 'enabled' : 'disabled'}.`, 
      data: updated 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error updating currency status' });
  }
};

export const getAllCurrency = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const currencies = await currencyRepository.getAllCurrencyService();
    const currencyList = currencies.map(c => c.currency);
    return res.status(200).json({ success: true, message: 'Currencies retrieved successfully.', data: currencyList });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error retrieving currencies' });
  }
};