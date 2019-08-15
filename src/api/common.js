import request from 'request';

export async function sendJSONRequest(url, opts) {
	opts = {
		method: 'GET',
		timeout: 60000,
		...(opts || {})
	};

	return new Promise((resolve, reject) => {
		if (url.indexOf('http') < 0)
			url = `http://${url}`;

		if (opts.body && typeof opts.body !== 'string')
			opts.body = JSON.stringify(opts.body);

		request(url, opts, (err, resp, body) => {
			if (err)
				return reject(err);

			const r = { ...resp.toJSON() };

			try {
				r.body = JSON.parse(body);
			} catch (ex) {}

			if (r.statusCode >= 200 && r.statusCode < 300)
				r.statusCode = 200;

			resolve(r);
		});
	});
}