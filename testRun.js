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
    const loginPage = await browser.newPage();
    await loginPage.setViewport({width: 1600, height: 900});


    /**
     * Seiten durchgehen
     */
    let run = 1;

    logInfo('Start:', config);

    await doLogin(loginPage, config);
    
    // open new tab for the game
    page = await browser.newPage();
    await page.setViewport({width: 1200, height: 1200});

    await page.goto(config.url + '/index.php?language=EN');
    await page.waitForSelector('a[href="http://www.moonid.net/api/account/connect/192/"]');
    await page.click('a[href="http://www.moonid.net/api/account/connect/192/"]');

    await doRaid(page, config);

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
}

async function doRaid (page, config) {
    logInfo('Start Raid sequence', config);
    
    for (i = 0; i < 10; i++){
        await page.goto(config.url + '/index.php?ac=raubzug');
        try {
            await page.waitForSelector('input[title="Next"]');
            await page.click('input[title="Next"]');
        } catch  (err) {
            await page.waitForSelector('input[src="img/EN/btn_repeat.jpg"]');
            await page.click('input[src="img/EN/btn_repeat.jpg"]');
            console.error("repeat");
        }
        // wait for 10 min
        await page.waitFor(590000);
    }
    
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
