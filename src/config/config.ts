import * as Joi from 'joi';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
import * as dotenv from 'dotenv';

dotenv.config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  SERVICE_NAME: Joi.string().required(),
  SERVICE_PEER_NAME: Joi.string().required(),
  SERVICE_PEER_HOST: Joi.string().required(),
  SERVICE_PEER_PORT: Joi.number().required(),
  SERVICE_JWT_SECRET: Joi.string().required(),
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  SERVER_PORT: Joi.number()
    .default(4040),
  SSL_SERVER_PORT: Joi.number()
    .default(40400),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number()
    .default(27017),
  ROOT_URI: Joi.string().required()
    .description('Root Uri'),
  WX_APP_ID: Joi.string().required()
    .description('WeChat AppId'),
  WX_APP_SECRET: Joi.string().required()
    .description('WeChat AppSecret'),
  WX_SANDBOX: Joi.boolean().default(false)
    .description('Wechat Payment Sandbox'),
  WXLOGIN_URI: Joi.string().required()
    .description('WeChat LoginUri'),
  REDIRECT_URI: Joi.string().required()
    .description('WeChat RedirectUri'),
  MSSQL_HOST: Joi.string().required()
    .description('MSSQL_HOST'),
  MSSQL_USER: Joi.string().required()
    .description('MSSQL_USER'),
  MSSQL_PASSWORD: Joi.string().required()
    .description('MSSQL_PASSWORD'),
  MSSQL_DATABASE: Joi.string().required()
    .description('MSSQL_DATABASE'),
  SMS_ACCESS_KEY_ID: Joi.string().required()
    .description('SMS_ACCESS_KEY_ID'),
  SMS_SECRET_ACCESS_KEY: Joi.string().required()
    .description('SMS_SECRET_ACCESS_KEY'),
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  service: {
    name: envVars.SERVICE_NAME,
    peerName: envVars.SERVICE_PEER_NAME,
    peerHost: envVars.SERVICE_PEER_HOST,
    peerPort: envVars.SERVICE_PEER_PORT,
    jwtSecret: envVars.SERVICE_JWT_SECRET,
  },
  env: envVars.NODE_ENV,
  port: envVars.SERVER_PORT,
  sslPort: envVars.SSL_SERVER_PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET,
  mongo: {
    host: envVars.MONGO_HOST,
    port: envVars.MONGO_PORT
  },
  wx: {
    mchId: envVars.WX_MCH_ID,
    mchKey: envVars.WX_MCH_KEY,
    appId: envVars.WX_APP_ID,
    appSecret: envVars.WX_APP_SECRET,
    loginUrl: envVars.WXLOGIN_URI,
    redirectUrl: encodeURI(envVars.REDIRECT_URI),
    notifyUrl: envVars.NOTIFY_URI,
    sandbox: envVars.WX_SANDBOX,
  },
  mysql: {
    host: envVars.MYSQL_HOST,
    user: envVars.MYSQL_USER,
    password: envVars.MYSQL_PASSWORD,
    database: envVars.MYSQL_DATABASE,
  },
  mssql: {
    host: envVars.MSSQL_HOST,
    user: envVars.MSSQL_USER,
    password: envVars.MSSQL_PASSWORD,
    database: envVars.MSSQL_DATABASE,
  },
  rootUrl: envVars.ROOT_URI,
  aliCloud: {
    smsAccessKeyId: envVars.SMS_ACCESS_KEY_ID,
    smsSecretAccessKey: envVars.SMS_SECRET_ACCESS_KEY,
  }
};

export default config;
