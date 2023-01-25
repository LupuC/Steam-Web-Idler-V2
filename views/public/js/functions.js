const crypto = require("crypto");

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
}
return result;
}

const algorithm = "aes-256-cbc";
const initVectorString = "1234567890zxcvbn";
const SecuritykeyString = "1234567890zxcvbn1234567890zxcvbn";
const initVector = Buffer.from(initVectorString, "utf-8");
const Securitykey = Buffer.from(SecuritykeyString, "utf-8");

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
}
function decrypt(text) {
    const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
    let decryptedData = decipher.update(text, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
}

module.exports = { makeid, encrypt, decrypt }