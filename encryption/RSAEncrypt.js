'use strict'

const logger = require('../logger/logger');
const forge = require('node-forge');

exports.RSAEncrypt = (data) => {
    logger.debug("Data received in RSA Encrypt (JSON format) :" + data);

    let dataString = JSON.stringify(data);
    let random32ByteKey = forge.random.getBytesSync(32);
    
    let pemContents = fs.readFileSync('public.pem', 'utf8');
    let publicKey = forge.pki.publicKeyFromPem(pemContents);

    logger.debug("pemContents :" + pemContents);
    logger.debug("publicKey :" + publicKey);

    const forgePublicKey = forge.pki.publicKeyFromPem(pemContents);
    logger.debug("forgePublicKey :" + forgePublicKey);

    const encryptedKey = forgePublicKey.encrypt(random32ByteKey, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
            hash: forge.md.sha256.create(),
            seed: random32ByteKey
        }
    });
    
    logger.debug("encryptedKey :" + encryptedKey);
    const sessionKey = forge.util.encode64(encryptedKey);
    logger.debug("sessionKey :" + sessionKey);

    const iv = forge.random.getBytesSync(16);
    logger.debug("iv :" + iv);

    const cipher = forge.cipher.createCipher('AES-CBC', random32ByteKey);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(dataString));
    cipher.finish();

    const payloadBytes = cipher.output.getBytes();

    let finalPayload = iv + payloadBytes;

    const base64EncodedPayload = forge.util.encode64(finalPayload);
    logger.debug("base64EncodedPayload :" + base64EncodedPayload);

    return base64EncodedPayload;
}

