
import SMSClient from '@alicloud/sms-sdk';
import config from './config';
import makeSingleton from '../helpers/makeSingleton';

const accessKeyId = config.aliCloud.smsAccessKeyId;
const secretAccessKey = config.aliCloud.smsSecretAccessKey;

export class MySMSClient extends SMSClient {
    constructor() {
        super({ accessKeyId, secretAccessKey });
    }
}

export default makeSingleton(MySMSClient);

