import crypto from 'crypto';
import {injectable} from "inversify";

@injectable()
export default class PasswordService {
    bytesSize: number;
    encodingType: string;
    algorithmType: any;

    constructor() {
        this.bytesSize = 16;
        this.encodingType = 'hex';
        this.algorithmType = 'sha256';
    }

    generateSalt = () => {
        return crypto.randomBytes(this.bytesSize).toString(this.encodingType);
    }

    generateHash = (salt: string, password: string) => {
        return  crypto.createHash(this.algorithmType).update(password + salt).digest(this.encodingType);
    }

    comparePassword = (salt: string, password: string, hashedPassword: string) => {
        return this.generateHash(salt, password) === hashedPassword;
    }
}
