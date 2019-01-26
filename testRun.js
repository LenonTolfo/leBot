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

const keepLogin = true;

(async () => {
    /**
     * Setup
     */
    const browser = await puppeteer.launch({headless: !config.showBrowserAndKeepItOpen, ignoreHTTPSErrors: true});
    const page = await browser.newPage();
    await page.setViewport({width: 1600, height: 900});


    /**
     * Seiten durchgehen
     */
    let run = 1;

    logInfo('Start:', config);

    await doLogin(page, config);

    await page.waitFor(1*1000);
    // Adresslistenmanagement
    // let adresslistenPage = await browser.newPage();
    // await openSubpage(adresslistenPage, '/adresslistenmanagement', config);
    // await adresslistenPage.evaluate(() => {
    //     jQuery('#edit-filter-geschaeftsberichtbox-22')[0].click();
    //     jQuery('#edit-filter-funktionen-field-prokuristen')[0].click();
    //     jQuery('#edit-filter-geschaeftsberichtbox-23')[0].click();
    //     jQuery('#edit-submit')[0].click();
    // });
    // await adresslistenPage.close();

    // Mysql-Datenbanken
    //await openSubpage(page, '/mysql-overview', config);

    // PhpMyAdmin
    //await openSubpage(page, '/phpmyadmin/db745973610', config);

    if (keepLogin){
        // Logout
        //await doLogout(page, config);
    }

    /*


        // Beiteiligungen
        await openBeteiligung(page, 'AWS', config);
        await page.evaluate(() => {
            jQuery('a.print-pdf')[0].click();
        });
        //await openBeteiligung(page, 'SWZ', config);
    }
    */

    /**
     * Close browser
     */
    if (!config.showBrowserAndKeepItOpen) {
        await browser.close();
    }
})();

async function doLogin(page, config) {

    // Enter host page
    await page.goto(config.urlLogin + '');
    await page.waitForSelector('a[href="#login"]');
    await page.click('a[href="#login"]');
    
    // user name come with outofocus
    await page.type('input[name="username"]', config.username);
    await page.waitForSelector('input[name="password"]');
    
    // set the focus on the password input
    await page.click('input[name="password"]');
    await page.type('#id_password', config.password);
    
    await page.click('input[type="submit"]');
    logInfo('Login done', config);
    
    // goto Game page
    await page.goto(config.url + '');
}

async function doLogout(page, config) {
    await page.goto('/logout');
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    logInfo('Logout done', config);
}


async function openSubpage(page, url, config) {
    await page.goto(config.url + url);
    await page.waitForSelector('body');
    logInfo(url + ' geöffnet', config);
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
