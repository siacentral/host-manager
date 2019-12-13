const forge = require('node-forge'),
	crypto = require('crypto'),
	fs = require('fs').promises,
	path = require('path');

const signatureRequired = ['.appimage', '.exe', '.deb', '.dmg'];

async function loadPrivateKey() {
	/**
	 * when signing with windows and linux we can use the provided CSC_LINK and CSC_KEY_PASSWORD
	 * with mac however we have to use different env vars since it pulls the cert from keychain
	 * and using CSC_LINK overrides that
	 */
	const privKeyFile = process.env.WIN_CSC_LINK || process.env.CSC_LINK || process.env.SIGNING_KEY,
		privKeyPassword = process.env.WIN_CSC_KEY_PASSWORD || process.env.CSC_KEY_PASSWORD || process.env.SIGNING_KEY_PASSWORD;

	const keyBuf = await fs.readFile(privKeyFile),
		p12Der = forge.util.decode64(keyBuf.toString('base64')),
		p12Asn1 = forge.asn1.fromDer(p12Der),
		p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, privKeyPassword);

	return forge.pki.privateKeyToPem(p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0].key);
}

async function signHash(artifactPath, key) {
	const digest = crypto.createSign('SHA256'),
		file = await fs.readFile(artifactPath);

	digest.update(file);

	return digest.sign(key);
}

async function generateSignature(result, artifactPath, key) {
	const sig = await signHash(artifactPath, key);

	await fs.writeFile(`${artifactPath}.sha256`, sig);
}

module.exports = async function(result) {
	const reqKey = [
			process.env.WIN_CSC_LINK,
			process.env.CSC_LINK,
			process.env.SIGNING_KEY
		],
		reqPass = [
			process.env.WIN_CSC_KEY_PASSWORD,
			process.env.CSC_KEY_PASSWORD,
			process.env.SIGNING_KEY_PASSWORD
		];

	if (reqKey.filter(r => r !== null && r !== undefined).length === 0 || reqPass.filter(r => r !== null && r !== undefined).length === 0)
		return;

	const files = result.artifactPaths;

	if (!Array.isArray(files) || files.length === 0)
		return;

	const executables = files.filter(f => {
		return signatureRequired.indexOf(path.extname(f).toLowerCase()) !== -1;
	});

	if (executables.length === 0)
		return;

	const key = await loadPrivateKey(),
		promises = [];

	for (let i = 0; i < executables.length; i++)
		promises.push(generateSignature(result, executables[i], key));

	await Promise.all(promises);
};