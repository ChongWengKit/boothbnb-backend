import { getCurrencyRate, getAllCurrencyService, getAllCurrencies, updateCurrencyStatus } from '../services/currency.service.js';
export const getCurrency = async (req, res) => {
    try {
        const { currencyCode } = req.query;
        if (!currencyCode || typeof currencyCode !== 'string') {
            return res.status(400).json({ success: false, message: 'currencyCode query parameter is required.' });
        }
        const rate = await getCurrencyRate(currencyCode.toUpperCase());
        if (!rate) {
            return res.status(400).json({ success: false, message: 'Currency rate not found.' });
        }
        return res.status(200).json({ success: true, message: 'Currency rate retrieved successfully.', data: rate });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error retrieving currency rate' });
    }
};
export const getAllCurrencyDetails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const status = req.query.status === 'true' ? true : req.query.status === 'false' ? false : undefined;
        const { data, meta } = await getAllCurrencies(page, limit, search, status);
        return res.status(200).json({
            success: true,
            message: 'Currency details retrieved successfully.',
            data,
            meta
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error retrieving currency details' });
    }
};
export const updateStatus = async (req, res) => {
    try {
        const { currency, is_enabled } = req.body;
        if (!currency || typeof is_enabled !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Currency and is_enabled status are required.' });
        }
        const updated = await updateCurrencyStatus(currency.toUpperCase(), is_enabled);
        return res.status(200).json({
            success: true,
            message: `Currency ${currency} status updated to ${is_enabled ? 'enabled' : 'disabled'}.`,
            data: updated
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error updating currency status' });
    }
};
export const getAllCurrency = async (req, res) => {
    try {
        const currencies = await getAllCurrencyService();
        const currencyList = currencies.map(c => c.currency);
        return res.status(200).json({ success: true, message: 'Currencies retrieved successfully.', data: currencyList });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error retrieving currencies' });
    }
};
//# sourceMappingURL=currecy.controller.js.map