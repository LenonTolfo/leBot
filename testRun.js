// load config
let config;
try {
    config = require('./config');
} catch (e) {
    console.error('Please configure before running:');
    console.error('  1. cp config.sample.js config.js');
    console.error('  2. edit config.js');
    return;
}

// load puppeteer
const puppeteer = require('puppeteer');

(async () => {
    /**
     * Setup
     */
    const browser = await puppeteer.launch({headless: !config.showBrowserAndKeepItOpen, ignoreHTTPSErrors: true});
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 800});


    /**
     * Seiten durchgehen
     */
    let run = 1;
    let releasesPage = [];
    await doLogin(page, config);

    while (false) {

        logInfo('Lauf #' + run++, config);


    }

    // Logout
    await doLogout(page, config);

    /**
     * Close browser
     */
    if (!config.showBrowserAndKeepItOpen) {
        await browser.close();
    }
})();

async function doLogin(page, config) {
    await page.goto(config.loginUrl);
    await page.waitForSelector('input[name=username]');
    await page.type('input[name=username]', config.username);
    await page.type('input[name=password]', config.password);
    await page.click('input[type=submit]');
    await page.waitForSelector('#responsive-tab');
    logInfo('Login done', config);
}

async function doLogout(page, config) {
    await page.goto(config.Url + '/user/logout');
    await page.waitForSelector('input[name=username]');
    await page.waitForSelector('input[name=username]');
    logInfo('Logout done', config);
}


function logInfo(message, config) {
    if (config.consoleOutput) {
        console.log('[' + getFormattedDate() + '] ℹ ' + message);
    }
}

function getFormattedDate() {
    var d = new Date();
    d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
    return d;
}
