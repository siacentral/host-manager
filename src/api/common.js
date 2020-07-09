export async function sendJSONRequest(url, opts) {
	const headers = new Headers();

	if (opts.headers) {
		const keys = Object.keys(headers);

		for (let i = 0; i < keys.length; i++)
			headers.append(keys[i], headers[keys[i]]);
	}

	if (opts.auth)
		headers.append('Authorization', `Basic ${btoa(`${opts.auth.username}:${opts.auth.password}`)}`);

	opts.headers = headers;

	opts = {
		method: 'GET',
		timeout: 60000,
		mode: 'cors',
		cache: 'no-cache',
		...(opts || {})
	};

	if (opts.form && typeof opts.form === 'object') {
		const form = new FormData(),
			keys = Object.keys(opts.form);

		for (let i = 0; i < keys.length; i++)
			form.append(keys[i], opts.form[keys[i]]);

		opts.body = form;
	} else if (opts.body && typeof opts.body !== 'string')
		opts.body = JSON.stringify(opts.body);

	const r = await fetch(url, opts);

	let resp = { statusCode: r.status };

	try {
		const body = await r.json();

		resp = { statusCode: r.status, body: body };
	} catch (ex) {}

	if (resp.statusCode >= 200 && resp.statusCode < 300)
		resp.statusCode = 200;

	return resp;
}

export async function sendRAWRequest(url, opts) {
	opts = {
		method: 'GET',
		timeout: 60000,
		mode: 'cors',
		cache: 'no-cache',
		...(opts || {})
	};

	if (opts.body && typeof opts.body !== 'string')
		opts.body = JSON.stringify(opts.body);

	const r = await fetch(url, opts);

	let resp = { statusCode: r.status };

	try {
		const body = await r.json();

		resp = { ...resp, body: body };
	} catch (ex) {}

	if (resp.statusCode >= 200 && resp.statusCode < 300)
		resp.statusCode = 200;

	return resp;
}