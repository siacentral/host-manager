import BigNumber from 'bignumber.js';

const BASE_CURRENCY_PRECISION = 1e24,
	BASE_CURRENCY_LABEL = 'SC';

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

	return {
		value: new Intl.NumberFormat([], {
			type: 'decimal',
			minimumFractionDigits: decimals
		}).format(roundNumber(num.dividedBy(mag), decimals)),
		label: unit
	};
};

export function formatBlockTimeString(blocks) {
	if (blocks <= 0)
		return '0 hr';

	const denoms = { 'month': 4320, 'week': 1008, 'day': 144, 'hour': 6 };

	for (let key in denoms) {
		const d = denoms[key];

		if (blocks < d)
			continue;

		const value = Math.floor(blocks / d);

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

export function formatMonth(date) {
	return date.toLocaleString([], {
		year: 'numeric',
		month: 'short'
	});
}

export function formatDate(date) {
	return date.toLocaleDateString([], {
		year: 'numeric',
		month: 'short',
		day: '2-digit'
	});
}

export function formatDateTime(date) {
	return date.toLocaleString([], {
		dateStyle: 'short',
		timeStyle: 'short',
		year: 'numeric',
		month: 'short',
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
	if (sec < 60)
		return [{ value: 0, label: 'd' }, { value: 0, label: 'h' }, { value: 1, label: 'm' }];

	let denoms;

	if (short)
		denoms = { 'd': 86400, 'h': 3600, 'm': 60 };
	else
		denoms = { 'day': 86400, 'hour': 3600, 'min': 60 };

	const keys = Object.keys(denoms), len = keys.length, labels = [];

	let time = sec, label, i = 0, d;

	for (; i < len; i++) {
		label = keys[i];
		d = denoms[label];

		const amt = Math.floor(time / d);

		time = time % d;

		labels.push({
			value: amt,
			label: amt > 1 && !short ? label + 's' : label
		});
	}

	return labels;
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

function formatSiacoinString(val, dec) {
	if (!isFinite(dec))
		dec = 2;

	if (!val || val.isEqualTo(0)) {
		return {
			value: '0',
			label: BASE_CURRENCY_LABEL
		};
	}

	return {
		value: new Intl.NumberFormat([], {
			type: 'decimal',
			minimumFractionDigits: dec,
			maximumFractionDigits: 5
		}).format(roundNumber(val.dividedBy(BASE_CURRENCY_PRECISION), dec)),
		label: BASE_CURRENCY_LABEL
	};
};

function formatCryptoString(val, dec, currency, rate) {
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
			maximumFractionDigits: 5
		}).format(roundNumber(val.dividedBy(BASE_CURRENCY_PRECISION).times(rate), dec)),
		label: currency.toLowerCase()
	};
}

function formatCurrencyString(val, currency, rate) {
	const formatter = new Intl.NumberFormat([], { style: 'currency', currency: currency || 'usd', maximumFractionDigits: 5 });

	if (val.isEqualTo(0) || !rate) {
		return {
			value: formatter.format(0),
			label: currency.toLowerCase()
		};
	}

	return {
		value: formatter.format(roundNumber(val.dividedBy(BASE_CURRENCY_PRECISION).times(rate), 2)),
		label: currency.toLowerCase()
	};
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

export function formatDataPriceString(val, dec, unit, currency, rate) {
	if (!val)
		val = new BigNumber(0);

	const byteFactor = unit !== 'binary' ? 1e12 : 1099511627776;

	if (supportedCrypto.indexOf(currency) >= 0 && rate)
		return formatCryptoString(val.times(byteFactor), dec, currency, rate);

	if (supportedCurrency.indexOf(currency) >= 0 && rate)
		return formatCurrencyString(val.times(byteFactor), currency, rate);

	return formatSiacoinString(val.times(byteFactor), dec);
};

export function formatMonthlyPriceString(val, dec, unit, currency, rate) {
	if (!val)
		val = new BigNumber(0);

	const byteFactor = unit !== 'binary' ? 1e12 : 1099511627776;

	if (supportedCrypto.indexOf(currency) >= 0 && rate)
		return formatCryptoString(val.times(byteFactor).times(4320), dec, currency, rate);

	if (supportedCurrency.indexOf(currency) >= 0 && rate)
		return formatCurrencyString(val.times(byteFactor).times(4320), currency, rate);

	return formatSiacoinString(val.times(byteFactor).times(4320), dec, currency, rate);
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

export function formatPriceString(val, dec, currency, rate) {
	if (!val)
		val = new BigNumber(0);

	if (supportedCrypto.indexOf(currency) >= 0 && rate)
		return formatCryptoString(val, dec, currency, rate);

	if (supportedCurrency.indexOf(currency) >= 0 && rate)
		return formatCurrencyString(val, currency, rate);

	return formatSiacoinString(val, dec);
}