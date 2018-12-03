
import * as https from 'https';
import config from '../config/config';

let cachedTicket = {
    ticket: "",
    expiresIn: 0,
};

let cachedAccessToken = {
    accessToken: "",
    expiresIn: 0,
};

let timerAccessToken: NodeJS.Timer;
let timerTicket: NodeJS.Timer;

async function getAccessTokenTimerHandler() {
    cachedAccessToken.expiresIn -= 1;

    if (cachedAccessToken.expiresIn <= 600) {
        clearInterval(timerAccessToken);

        let accessTokenResult = await getAccessTokenAsync().catch(error => {
            console.error(error);
        });
        cachedAccessToken.accessToken = accessTokenResult.access_token;
        cachedAccessToken.expiresIn = +accessTokenResult.expires_in;

        timerAccessToken = setInterval(getAccessTokenTimerHandler, 1000);
    }
}

async function getTicketTimerHandler() {
    cachedTicket.expiresIn -= 1;

    if (cachedTicket.expiresIn <= 600) {
        clearInterval(timerTicket);

        let ticketResult = await getJsApiTicketAsync().catch(error => {
            console.error(error);
        });
        cachedTicket.ticket = ticketResult.ticket;
        cachedTicket.expiresIn = +ticketResult.expires_in;

        timerTicket = setInterval(getTicketTimerHandler, 1000);
    }
}

export async function getJsApiTicket() {
    if (cachedAccessToken.expiresIn <= 600) {
        clearInterval(timerAccessToken);

        let accessTokenResult = await getAccessTokenAsync().catch(error => {
            console.error(error);
        });

        if (accessTokenResult) {
            cachedAccessToken.accessToken = accessTokenResult.access_token;
            cachedAccessToken.expiresIn = +accessTokenResult.expires_in;

            timerAccessToken = setInterval(getAccessTokenTimerHandler, 1000);
        }
    }

    if (!cachedAccessToken.accessToken) {
        return;
    }

    if (cachedTicket.expiresIn <= 600) {
        clearInterval(timerTicket);

        let ticketResult = await getJsApiTicketAsync().catch(error => {
            console.error(error);
        });

        if (ticketResult) {
            cachedTicket.ticket = ticketResult.ticket;
            cachedTicket.expiresIn = +ticketResult.expires_in;

            timerTicket = setInterval(getTicketTimerHandler, 1000);
        }
    }

    return cachedTicket.ticket;
}

export async function getJsApiTicketAsync(): Promise<any> {
    // https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi
    const hostname = "api.weixin.qq.com";
    const path = `/cgi-bin/ticket/getticket?access_token=${cachedAccessToken.accessToken}&type=jsapi`;

    return new Promise((resolve, reject) => {
        let request = https.request({
            hostname: hostname,
            port: 443,
            path: path,
            method: "GET",
        }, (wxRes) => {
            console.log("response from wx api.");

            let wxData = "";
            wxRes.on("data", (chunk) => {
                wxData += chunk;
            });

            wxRes.on("end", async () => {
                // {
                // "errcode":0,
                // "errmsg":"ok",
                // "ticket":"bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
                // "expires_in":7200
                // }
                let result = JSON.parse(wxData) as any;

                let { errcode, errmsg, ticket, expires_in } = result;
                if (ticket) {
                    return resolve(result);
                }
                else {
                    return reject(result);
                }
            });
        });
        request.end();
    });
}

export async function getAccessTokenAsync(): Promise<any> {
    // https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    const hostname = "api.weixin.qq.com";
    const path = `/cgi-bin/token?grant_type=client_credential&appid=${config.wx.appId}&secret=${config.wx.appSecret}`;

    return new Promise((resolve, reject) => {
        let request = https.request({
            hostname: hostname,
            port: 443,
            path: path,
            method: "GET",
        }, (wxRes) => {
            console.log("response from wx api.");

            let wxData = "";
            wxRes.on("data", (chunk) => {
                wxData += chunk;
            });

            wxRes.on("end", async () => {
                // {"access_token":"ACCESS_TOKEN","expires_in":7200}
                let result = JSON.parse(wxData) as any;

                let { access_token, expires_in, errcode, errmsg } = result;
                if (access_token) {
                    resolve(result);
                }
                else {
                    reject(`${errcode}: ${errmsg}`);
                }
            });
        });
        request.end();
    });
}