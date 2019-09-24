import { BigNumber } from 'bignumber.js';
import Decimal from 'decimal.js-light';

import Store from '@/store';

export function numberToString(number, divisor, units, decimals) {
	decimals = isFinite(decimals) ? decimals : -1;

	let unit = units[0],
		num = new BigNumber(number),
		mag = new BigNumber(divisor);

	for (let i = 0; i < units.length; i++) {
		unit = units[i];

		if (num.isLessThan(mag)) {
			mag = mag.dividedBy(divisor);
			break;
		}

		mag = mag.multipliedBy(divisor);
	}

	let fixed = 0;

	if (decimals === -1)
		fixed = num.dividedBy(mag).toString(10);
	else
		fixed = num.dividedBy(mag).toFixed(decimals);

	return `${fixed} ${unit}`;
};

export function formatBlockTimeString(blocks) {
	if (blocks <= 0)
		return '0 hr';

	const denoms = { 'mth': 4320, 'wk': 1008, 'day': 144, 'hr': 6 };

	for (let key in denoms) {
		const d = denoms[key];

		if (blocks < d)
			continue;

		return `${Math.floor(blocks / d)} ${key}`;
	}

	return '0 hr';
}

export function formatDate(date) {
	return date.toLocaleString([], {
		dateStyle: 'short',
		timeStyle: 'short',
		year: '2-digit',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatShortDateString(date) {
	return date.toLocaleDateString([], { dateStyle: 'short' });
}

export function formatShortTimeString(date) {
	return date.toLocaleTimeString([], { timeStyle: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(sec, short) {
	if (sec <= 0)
		return '0 sec';

	let denoms;

	if (short)
		denoms = { 'd': 86400, 'h': 3600, 'm': 60 };
	else
		denoms = { 'day': 86400, 'hour': 3600, 'min': 60 };

	const keys = Object.keys(denoms), len = keys.length;

	let time = sec, label, i = 1, d;

	for (; i < len; i++) {
		label = keys[i];
		d = denoms[label];

		if (time < d)
			continue;

		const amt = Math.floor(time / d);

		time = time % d;

		return `${amt} ${amt > 1 && !short ? label + 's' : label}`;
	}

	return `< 1 m`;
}

export function formatByteString(val, dec) {
	if (Store && Store.state && Store.state.config && Store.state.config.data_unit === 'decimal')
		return numberToString(val, 1000, ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'], dec);

	return numberToString(val, 1024, ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'], dec);
};

export function formatByteSpeed(val, dec) {
	if (Store && Store.state && Store.state.config && Store.state.config.data_unit === 'decimal')
		return numberToString(val, 1000, ['B', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'], dec);

	return numberToString(val, 1024, ['B/s', 'KiB/s', 'MiB/s', 'GiB/s', 'TiB/s', 'PiB/s'], dec);
}

const numFormatter = new Intl.NumberFormat({
		maximumFractionDigits: 20
	}),
	currencySuffixes = [
		{
			mul: 1e12,
			suffix: 'T'
		},
		{
			mul: 1e9,
			suffix: 'B'
		},
		{
			mul: 1e6,
			suffix: 'M'
		},
		{
			mul: 1e3,
			suffix: 'K'
		}
	];

export function formatNumber(val, dec) {
	if (!dec)
		dec = 0;

	return numFormatter.format(sigDecimalRound(val, dec));
}

export function formatSiacoinString(val, dec) {
	let suffix = '',
		mul = new BigNumber(1);

	if (!isFinite(dec))
		dec = 2;

	if (!val || val.isEqualTo(0))
		return '0 SC';

	const siacoins = val.dividedBy(1e24);

	if (siacoins.gte(1e4)) {
		for (let i = 0; i < currencySuffixes.length; i++) {
			const suf = currencySuffixes[i];

			if (!siacoins.gte(suf.mul))
				continue;

			mul = mul.times(suf.mul);
			suffix = suf.suffix;
			break;
		}
	}

	return `${numFormatter.format(sigDecimalRound(siacoins.dividedBy(mul), dec))} ${suffix}SC`;
};

function sigDecimalRound(val, num) {
	const pieces = val.toString(10).split('.');

	num = num || 2;

	if (pieces.length < 2)
		return val;

	const w = new Decimal(pieces[0]),
		d = new Decimal(`0.${pieces[1]}`).toSignificantDigits(num);

	return w.plus(d).toDecimalPlaces(6);
};

export function formatCryptoString(val, dec) {
	const currency = Store.state.config.currency || 'btc';

	dec = dec || 4;

	if (val.isEqualTo(0) || !Store.state.coinPrice[currency])
		return `0 ${currency.toUpperCase()}`;

	return `${numFormatter.format(sigDecimalRound(val.dividedBy(1e24).times(Store.state.coinPrice[currency]), dec).toNumber())} ${currency.toUpperCase()}`;
}

export function formatCurrencyString(val) {
	const currency = Store.state.config.currency || 'usd',
		formatter = new Intl.NumberFormat([], { style: 'currency', currency: currency, maximumFractionDigits: 20 });

	if (val.isEqualTo(0) || !Store.state.coinPrice[currency])
		return formatter.format(0);

	const value = sigDecimalRound(val.dividedBy(1e24).times(Store.state.coinPrice[currency]), 2).toNumber();

	return formatter.format(value);
};

const supportedCrypto = [
		'btc',
		'eth',
		'bch',
		'xrp',
		'ltc'
	],
	supportedCurrency = [
		'usd',
		'jpy',
		'eur',
		'gbp',
		'aus',
		'cad',
		'rub',
		'cny'
	];

export function formatDataPriceString(val, dec) {
	if (!val)
		val = new BigNumber(0);

	const currency = (Store.state.config && Store.state.config.currency ? Store.state.config.currency : 'siacoin').toLowerCase();

	if (supportedCrypto.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCryptoString(val.times(1e12), dec);

	if (supportedCurrency.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCurrencyString(val.times(1e12), dec);

	return formatSiacoinString(val.times(1e12), dec);
};

export function formatMonthlyPriceString(val, dec) {
	if (!val)
		val = new BigNumber(0);

	const currency = (Store.state.config && Store.state.config.currency ? Store.state.config.currency : 'siacoin').toLowerCase();

	if (supportedCrypto.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCryptoString(val.times(1e12).times(4320), dec);

	if (supportedCurrency.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCurrencyString(val.times(1e12).times(4320), dec);

	return formatSiacoinString(val.times(1e12).times(4320), dec);
};

export function formatPriceString(val, dec) {
	if (!val)
		val = new BigNumber(0);

	const currency = (Store.state.config && Store.state.config.currency ? Store.state.config.currency : 'siacoin').toLowerCase();

	if (supportedCrypto.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCryptoString(val, dec);

	if (supportedCurrency.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCurrencyString(val, dec);

	return formatSiacoinString(val, dec);
}