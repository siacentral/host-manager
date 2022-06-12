import BigNumber from 'bignumber.js';

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

export function formatFriendlyStatus(status) {
	switch (status.toLowerCase()) {
	case 'obligationsucceeded':
		return 'Successful';
	case 'obligationfailed':
		return 'Failed';
	case 'obligationrejected':
		return 'Rejected';
	case 'obligationunresolved':
		return 'Active';
	}

	return status;
}

export function numberToString(number, divisor, units, decimals) {
	decimals = isFinite(decimals) ? decimals : 2;

	const num = new BigNumber(number);
	let unit = units[0],
		mag = new BigNumber(divisor);

	for (let i = 0; i < units.length; i++) {
		unit = units[i];

		if (num.isLessThan(mag)) {
			mag = mag.dividedBy(divisor);
			break;
		}

		mag = mag.multipliedBy(divisor);
	}

	return {
		value: new Intl.NumberFormat([], {
			type: 'decimal',
			minimumFractionDigits: decimals
		}).format(roundNumber(num.dividedBy(mag), decimals)),
		label: unit
	};
};

export function formatFriendlyBlockTimeString(blocks) {
	if (blocks <= 0) return '0 hours';

	const denoms = { year: 52560, month: 4320, week: 1008, day: 144, hour: 6 },
		segments = [];

	for (let key in denoms) {
		const d = denoms[key];

		if (blocks < d)
			continue;

		const value = Math.floor(blocks / d);
		blocks = blocks % d;

		if (value > 1)
			key += 's';

		segments.push(`${value} ${key}`);
	}

	if (segments.length === 0)
		return '0 hours';
	else if (segments.length > 2)
		return segments.slice(0, 2).join(' ');

	return segments.join(' ');
}

export function formatBlockTimeString(blocks) {
	if (blocks <= 0)
		return '0 hr';

	const denoms = { month: 4320, week: 1008, day: 144, hour: 6 };

	for (let key in denoms) {
		const d = denoms[key];

		if (blocks < d)
			continue;

		const value = Math.floor((blocks / d) * 100) / 100;

		if (value > 1)
			key += 's';

		return {
			value: value.toString(),
			label: key
		};
	}

	return {
		value: 0,
		label: 'hours'
	};
}

export function formatDate(date) {
	return date.toLocaleString([], {
		dateStyle: 'short',
		timeStyle: 'short'
	});
}

export function formatShortDateString(date) {
	return date.toLocaleDateString([], { dateStyle: 'short' });
}

export function formatShortTimeString(date) {
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(sec, short) {
	if (sec <= 0)
		return '0 sec';

	let denoms;

	if (short)
		denoms = { d: 86400, h: 3600, m: 60 };
	else
		denoms = { day: 86400, hour: 3600, min: 60 };

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

	return '< 1 m';
}

export function formatByteString(val, unit, dec) {
	if (unit === 'decimal')
		return numberToString(val, 1000, ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'], dec);

	return numberToString(val, 1024, ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'], dec);
};

export function formatByteSpeed(val, unit, dec) {
	if (unit === 'decimal')
		return numberToString(val, 1000, ['B', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'], dec);

	return numberToString(val, 1024, ['B/s', 'KiB/s', 'MiB/s', 'GiB/s', 'TiB/s', 'PiB/s'], dec);
}

export function formatNumber(val, dec) {
	if (!dec)
		dec = 0;

	val = new BigNumber(val);

	return new Intl.NumberFormat([], {
		type: 'decimal',
		minimumFractionDigits: dec
	}).format(roundNumber(val, dec));
}

function roundNumber(val, dec) {
	const str = val.abs().toString(10),
		neg = val.lt(0),
		parts = str.split('.');

	if (parts.length === 1)
		return str;

	let decimals = new BigNumber(`0.${parts[1]}`).abs();

	if (decimals.isNaN() || !decimals.isFinite())
		decimals = new BigNumber(0);

	let num = new BigNumber(parts[0]).plus(decimals.sd(dec)).toNumber();

	if (neg)
		num *= -1;

	return num;
}

function formatCryptoString(val, dec, currency = 'sc', rate = 1, precision = new BigNumber(1e24)) {
	dec = dec || 4;

	if (val.isEqualTo(0) || !rate) {
		return {
			value: '0',
			label: currency.toLowerCase()
		};
	}

	return {
		value: new Intl.NumberFormat([], {
			type: 'decimal',
			minimumFractionDigits: dec,
			maximumFractionDigits: 20
		}).format(roundNumber(val.dividedBy(precision).times(rate), dec)),
		label: currency.toLowerCase()
	};
}

/**
 * Safari does not support 'narrowSymbol' and will throw an exception
 */
const symbolStyle = (() => {
	try {
		new Intl.NumberFormat([], {
			style: 'currency',
			currency: 'usd',
			currencyDisplay: 'narrowSymbol'
		}).format(1.512);

		return 'narrowSymbol';
	} catch (ex) {
		return 'symbol';
	}
})();

export function formatCurrency(v, rate = 0.015, code = 'usd', sign = 'always', maxDigits = 4, precision = new BigNumber('1e24')) {
	const value = v.div(precision).times(rate).toFixed(4);
	let formatted;

	switch (code) {
	case 'btc':
	case 'eth':
		formatted = new Intl.NumberFormat([], {
			signDisplay: sign,
			minimumFractionDigits: 2,
			maximumFractionDigits: maxDigits
		}).format(value);
		return `${formatted} ${code.toUpperCase()}`;
	default:
		return new Intl.NumberFormat([], {
			signDisplay: sign,
			style: 'currency',
			currency: code,
			currencyDisplay: symbolStyle,
			minimumFractionDigits: 2,
			maximumFractionDigits: maxDigits
		}).format(value);
	}
}

function formatCurrencyString(val, currency, rate, precision = new BigNumber(1e24)) {
	const formatter = new Intl.NumberFormat([], { style: 'currency', currency: currency || 'usd', maximumFractionDigits: 20 });

	if (val.isEqualTo(0) || !rate) {
		return {
			value: formatter.format(0),
			label: currency.toLowerCase()
		};
	}

	return {
		value: formatter.format(roundNumber(val.dividedBy(precision).times(rate), 2)),
		label: currency.toLowerCase()
	};
};

export function formatSiafundString(val) {
	if (!val || val.isEqualTo(0)) {
		return {
			value: '0',
			label: 'sf'
		};
	}

	return {
		value: new Intl.NumberFormat([], {
			type: 'decimal',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(val),
		label: 'sf'
	};
};

export function formatSCPFundString(val) {
	if (!val || val.isEqualTo(0)) {
		return {
			value: '0',
			label: 'scpf'
		};
	}

	return {
		value: new Intl.NumberFormat([], {
			type: 'decimal',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(val),
		label: 'scpf'
	};
}

export function formatPriceString(val, dec, currency, rate, precision = new BigNumber(1e24)) {
	if (!val)
		val = new BigNumber(0);

	if (supportedCrypto.indexOf(currency) >= 0 && rate)
		return formatCryptoString(val, dec, currency, rate, precision);

	if (supportedCurrency.indexOf(currency) >= 0 && rate)
		return formatCurrencyString(val, currency, rate, precision);

	return formatCryptoString(val, dec, currency, 1, precision);
}