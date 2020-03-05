import crypto from 'crypto';

export default class CorrectPasswordCheck {
    encodingType = 'hex'
    algorithmType = 'sha256'

    constructor() {

    }

    comparePassword = (salt, password, hashedPassword) => {
        return crypto.createHash(this.algorithmType).update(password + salt).digest(this.encodingType) === hashedPassword;
    }
}
