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

export function formatShortDateString(date) {
	let m = date.getMonth() + 1,
		d = date.getDate();

	if (m < 10)
		m = `0${m}`;

	if (d < 10)
		d = `0${d}`;

	return `${m}/${d}/${date.getFullYear()}`;
}

export function formatShortTimeString(date) {
	let hours = (date.getHours() % 12).toString(),
		minutes = date.getMinutes().toString(),
		meridian = date.getHours() > 12 ? 'PM' : 'AM';

	if (hours === '0')
		hours = 12;

	if (hours.length === 1)
		hours = '0' + hours.toString();

	if (minutes.length === 1)
		minutes = '0' + minutes.toString();

	return `${hours}:${minutes} ${meridian}`;
}

export function formatFriendlyDuration(sec, short) {
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
}

export function formatByteString(val, dec) {
	return numberToString(val, 1024, ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'], dec);
};

export function formatSiacoinString(val, dec) {
	if (!isFinite(dec))
		dec = 2;

	if (!val || val.isEqualTo(0))
		return '0 SC';

	return `${sigDecimalRound(val.dividedBy(1e24), dec).toString(10)} SC`;
};

function sigDecimalRound(val, num) {
	num = num || 2;
	const pieces = val.toString(10).split('.');

	if (pieces.length < 2)
		return val;

	const w = new Decimal(pieces[0]),
		d = new Decimal(`0.${pieces[1]}`).toSignificantDigits(num);

	return w.plus(d).toDecimalPlaces(6);
};

export function formatCryptoString(val) {
	const currency = Store.state.config.currency || 'btc';

	if (val.isEqualTo(0) || !Store.state.coinPrice[currency])
		return `0 ${currency.toUpperCase()}`;

	return `${sigDecimalRound(val.dividedBy(1e24).times(Store.state.coinPrice[currency]), 4).toString(10)} ${currency.toUpperCase()}`;
}

export function formatCurrencyString(val) {
	const currency = Store.state.config.currency || 'usd',
		formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 20 });

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

export function formatDataPriceString(val) {
	if (!val)
		val = new BigNumber(0);

	const currency = (Store.state.config && Store.state.config.currency ? Store.state.config.currency : 'siacoin').toLowerCase();

	if (supportedCrypto.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCryptoString(val.times(1e12));

	if (supportedCurrency.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCurrencyString(val.times(1e12));

	return formatSiacoinString(val.times(1e12));
};

export function formatMonthlyPriceString(val) {
	if (!val)
		val = new BigNumber(0);

	const currency = (Store.state.config && Store.state.config.currency ? Store.state.config.currency : 'siacoin').toLowerCase();

	if (supportedCrypto.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCryptoString(val.times(1e12).times(4320));

	if (supportedCurrency.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCurrencyString(val.times(1e12).times(4320));

	return formatSiacoinString(val.times(1e12).times(4320));
};

export function formatPriceString(val, dec) {
	if (!val)
		val = new BigNumber(0);

	const currency = (Store.state.config && Store.state.config.currency ? Store.state.config.currency : 'siacoin').toLowerCase();

	if (supportedCrypto.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCryptoString(val);

	if (supportedCurrency.indexOf(currency) >= 0 && Store.state.coinPrice && Store.state.coinPrice[currency])
		return formatCurrencyString(val);

	return formatSiacoinString(val, dec);
}