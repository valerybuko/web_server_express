import crypto from 'crypto';
import { injectable } from "inversify";
import {IPasswordService} from "../Domain";

@injectable()
export default class PasswordService implements IPasswordService{
    bytesSize: number;
    encodingType: any;
    algorithmType: any;

    constructor() {
        this.bytesSize = 16;
        this.encodingType = 'hex';
        this.algorithmType = 'sha256';
    }

    generateSalt = (): string => {
        return crypto.randomBytes(this.bytesSize).toString(this.encodingType);
    }

    generateHash = (salt: string, password: string): string => {
        return  crypto.createHash(this.algorithmType).update(password + salt).digest(this.encodingType);
    }

    comparePassword = (salt: string, password: string, hashedPassword: string): boolean => {
        return this.generateHash(salt, password) === hashedPassword;
    }
}
