import { BigNumber } from 'bignumber.js';

export function parseNumberString(str, precision = new BigNumber(1)) {
	const decimalSep = (1.1).toLocaleString().substring(1, 2),
		repRegex = new RegExp(`[^0-9${decimalSep}]`, 'g');

	let num = new BigNumber(str.replace(repRegex, '').replace(decimalSep, '.'), 10);

	if (num.isNaN() || !num.isFinite())
		num = new BigNumber(0);

	return num.times(precision);
};

export function parseBlockTimeString(str) {
	/* eslint-disable object-property-newline */
	const multipliers = {
		m: 4320, w: 1008, d: 144, h: 6,
		mth: 4320, mths: 4320,
		mon: 4320, wk: 1008, dy: 144, hr: 6,
		month: 4320, week: 1008, day: 144, hour: 6,
		months: 4320, weeks: 1008, days: 144, hours: 6
	};

	const unit = str.replace(/[^a-z]/gi, ''),
		num = parseInt(str.replace(/[^0-9]/g, ''), 10);

	if (!multipliers[unit])
		throw new Error(`${unit} not recognized`);

	return Math.floor(num * multipliers[unit]);
}

export function parseSiacoinString(str, precision = new BigNumber(1e24)) {
	return parseNumberString(str, precision);
}

export function parseCurrencyString(str, rate, precision = new BigNumber(1e24)) {
	if (rate)
		return parseNumberString(str, 1).div(rate).times(precision);

	return parseSiacoinString(str);
}