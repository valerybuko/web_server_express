import crypto from 'crypto';

export default class PasswordHelper {
    bytesSize = 16
    encodingType = 'hex'
    algorithmType = 'sha256'

    constructor() {

    }

    generateSalt = () => {
        return crypto.randomBytes(this.bytesSize).toString(this.encodingType);
    }

    generateHash = (salt, password) => {
        return  crypto.createHash(this.algorithmType).update(password + salt).digest(this.encodingType);
    }
}
