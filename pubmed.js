// load config
let config;
try {
    config = require('./pubmedConfig');
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

    logInfo('Start:', config);

    // open site page
    await page.goto(config.url);
    await page.waitForSelector('#term');

    await page.type('#term', 'machine learning');    
    await page.click('#search');

    await page.waitForSelector('#term');
    await page.type('#term', 'pain');    
    await page.click('#search');
    /**
     * Close browser
     */
    if (!config.showBrowserAndKeepItOpen) {
        await browser.close();
    }
})();

async function doHideoutUpgrade(page, config){
    await collectRewards(page, config);
    logInfo("Check hideout upgrades.",config);
    let enough = true;
    let gold = 0;

    await page.goto(config.url + '/index.php?ac=unterschlupf');
    
    await page.waitForSelector('#goldbalance');
    let element = await page.$("#goldbalance");
    gold = await page.evaluate(element => element.textContent, element);
    gold = parseInt(gold.replace(",", ""));
    logInfo('Gold: ' + gold, config);
    let building = true;
    let wall = true;
    let building = true;
    let surroundings = true;

    try {
        element = await page.$('a[href="index.php?ac=unterschlupf&typ=unterschlupf&scrt=142198909#upgrade"]');
        let text = await page.evaluate(element => element.textContent, element);
        let buildingCost = text.split(' ');
        buildingCost = parseInt(buildingCost[3].replace(",", ""));
        logInfo(buildingCost, config);
    } catch(err){
        noBuilding = true;
    }

    try {
        element = await page.$('a[href="index.php?ac=unterschlupf&typ=mauer&scrt=142198909#upgrade"]');
        let text = await page.evaluate(element => element.textContent, element);
        let wallCost = text.split(' ');
        wallCost = parseInt(wallCost[3].replace(",", ""));
        logInfo(wallCost, config);
    } catch(err){
        
    }

    try {
        element = await page.$('a[]');
        let text = await page.evaluate(element => element.textContent, element);
        let wallCost = text.split(' ');
        wallCost = parseInt(wallCost[3].replace(",", ""));
        logInfo(wallCost, config);
    } catch(err){

    }

    try {
        element = await page.$('a[href="index.php?ac=unterschlupf&typ=umgebung&scrt=142198909#upgrade"]');
        let text = await page.evaluate(element => element.textContent, element);
        let surroundingsCost = text.split(' ');
        wallCost = parseInt(wallCost[3].replace(",", ""));
        logInfo(wallCost, config);
    } catch(err){

    }

}

async function doTrain(page, config) {
    await collectRewards(page, config);
    logInfo('Start Training sequence', config);

    try {

        await page.goto(config.url + '/index.php?ac=training');
        let enough = true;
        let gold = 0;
        
        while (enough) {
            
            await page.waitForSelector('#goldbalance');
            let element = await page.$("#goldbalance");
            gold = await page.evaluate(element => element.textContent, element);
            gold = parseInt(gold.replace(",", ""));
            logInfo('Gold: ' + gold, config);
            
            element = await page.$('a[href="index.php?ac=training&typ=staerke"]');
            let text = await page.evaluate(element => element.textContent, element);
            let strengthCost = text.split(' ');
            strengthCost = parseInt(strengthCost[3].replace(",", ""));
            
            element = await page.$('a[href="index.php?ac=training&typ=ausdauer"]');
            text = await page.evaluate(element => element.textContent, element);
            let staminaCost = text.split(' ');
            staminaCost = parseInt(staminaCost[3].replace(",", ""));
            
            element = await page.$('a[href="index.php?ac=training&typ=verteidigung"]');
            text = await page.evaluate(element => element.textContent, element);
            let defenceCost = text.split(' ');
            defenceCost = parseInt(defenceCost[3].replace(",", ""));
            
            element = await page.$('a[href="index.php?ac=training&typ=gewandtheit"]');
            text = await page.evaluate(element => element.textContent, element);
            let agilityCost = text.split(' ');
            agilityCost = parseInt(agilityCost[3].replace(",", ""));
            
            element = await page.$('a[href="index.php?ac=training&typ=charisma"]');
            text = await page.evaluate(element => element.textContent, element);
            let dexterityCost = text.split(' ');
            dexterityCost = parseInt(dexterityCost[3].replace(",", ""));
            
            switch (true){
                
                case gold >= defenceCost:    
                    await page.goto(config.url + '/index.php?ac=training&typ=verteidigung');
                    logInfo('Train defence for ' + defenceCost, config);
                    break;
                
                case gold >= agilityCost:
                    await page.goto(config.url + '/index.php?ac=training&typ=gewandtheit');
                    logInfo('Train agility for ' + agilityCost, config);
                    break;
                
                case gold >= strengthCost:
                    await page.goto(config.url + '/index.php?ac=training&typ=staerke');
                    logInfo('Train strength for ' + strengthCost, config);
                    break;
                
                case gold >= staminaCost:
                    await page.goto(config.url + '/index.php?ac=training&typ=ausdauer');
                    logInfo('Train stamina for ' + staminaCost, config);
                    break;
                
                case gold >= dexterityCost:
                    await page.goto(config.url + '/index.php?ac=training&typ=charisma');
                    logInfo('Train dexteritz for ' + dexterityCost, config);
                    break;
                
                default:
                    logInfo('Not enough gold!', config);
                    enough = false;
            }
        }    
    } catch (err) {
        logInfo(err, config);
    }

    logInfo('Finished training', config);
}
    
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

async function collectRewards (page, config) {
    // Collect Raid reward
    await page.goto(config.url + '/index.php?ac=raubzug');
    logInfo('Raid collected', config);
    await page.waitFor(1000);
    
    // collect work reward
    await page.goto(config.url + '/index.php?ac=friedhof');
    logInfo('Wage collected', config);
    await page.waitFor(1000);
}

async function doRaid (page, config) {
    await collectRewards(page, config);
    logInfo('Start Raid sequence', config);
    
    for (let i = 1; i <= 6; i++){
        await page.goto(config.url + '/index.php?ac=raubzug');
        try {
            await page.waitForSelector('input[title="Next"]');
            await page.click('input[title="Next"]');
        } catch  (err) {
            logInfo(err, config);
            try {
                await page.waitForSelector('input[src="img/EN/btn_repeat.jpg"]');
                await page.click('input[src="img/EN/btn_repeat.jpg"]');
            } catch (e) {
                logInfo(e, config);
            }
        }
        logInfo('Starded raid: ' + i, config);

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
