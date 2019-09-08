import request from 'request';

export function checkDownloadOptions(opts) {
	if (!opts)
		throw new Error('options is required');

	if (!opts.uri && typeof opts.uri !== 'string')
		throw new Error('uri is required');

	if (typeof opts.progress !== 'function')
		opts.progress = () => {};

	if (typeof opts.done !== 'function')
		opts.done = () => {};

	if (typeof opts.error !== 'function')
		opts.error = () => {};

	return opts;
}

export function downloadFile(opts) {
	opts = checkDownloadOptions(opts);

	const req = request({
			method: 'GET',
			uri: opts.uri
		}),
		start = Date.now() / 1000;

	let downloadSize = 0, totalSize = 1, estimatedRemaining = 0, downloadSpeed = 0;

	req.on('response', (data) => {
		if (data.statusCode !== 200) {
			opts.error(new Error('unable to download file'));
			return;
		}

		totalSize = parseInt(data.headers['content-length'], 10);

		if (isNaN(totalSize) || !isFinite(totalSize))
			totalSize = 1;
	});

	req.on('error', opts.error);

	req.on('end', opts.done);

	req.on('data', (chunk) => {
		const elapsed = (Date.now() / 1000) - start;

		downloadSize += chunk.length;

		if (totalSize < downloadSize)
			return;

		downloadSpeed = downloadSize / elapsed;
		estimatedRemaining = (totalSize - downloadSize) / downloadSpeed;

		opts.progress({
			downloadSpeed,
			estimatedRemaining,
			downloaded: downloadSize,
			total: totalSize,
			progress: (downloadSize / totalSize) * 100
		});
	});

	return req;
}

/* export function extractSiaStats(inputPath, outputPath) {
	return new Promise((resolve, reject) => {
		const tmp = fs.createReadStream(inputPath);

		tmp.pipe(unzipper.Parse())
			.on('entry', async(entry) => {
				if (entry.path !== '/consensus/consensus.db') {
					entry.autodrain();
					return;
				}

				const outputFile = path.join(outputPath, 'consensus.db');

				await fs.promises.mkdir(outputPath, {
					recursive: true
				});

				entry.pipe(fs.createWriteStream(outputFile));
			});

		tmp.on('finish', resolve);
		tmp.on('error', reject);
	});
} */