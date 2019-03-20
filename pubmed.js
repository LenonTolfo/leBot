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

    logInfo('Start pubmed search engine:', config);

    // open site page
    await page.goto(config.url);
    await page.waitForSelector('#term');
    let param = {field:'Title/Abstract', text: 'Machine Learning'};
    // await doSingleResearch(page, config, param);
    
    await doMultiResearch(page, config);

    await colectArticlesRef(page, config);

    /**
     * Close browser
     */
    if (!config.showBrowserAndKeepItOpen) {
        await browser.close();
    }
})();

async function doSingleResearch(page, config, param){
    await page.goto(config.advancedSearch);
    await page.waitForSelector('#fv_0');
    logInfo('Load advanced search:', config);
    
    page.select('select#ff_0', param.field); 
    logInfo('Selected field: ' + param.field, config);
    
    await page.type('#fv_0', param.text);
    logInfo('Type text: ' + param.text, config);
    
    await page.click('#search');
    logInfo('Search executed', config);
    
    await page.waitForSelector('#messagearea');
    logInfo('Search finished', config);
}

async function doMultiResearch(page, config){
    await page.goto(config.advancedSearch);
    await page.waitForSelector('#fv_0');
    logInfo('Load advanced search:', config);
    let params = config.searchParam; 
    let count = params.length;
    
    for (let i = 0; i < count; i++){
        logInfo('count: ' + count +' de '+ i, config);
        
        page.select('select#ff_' + i, params[i].field); 
        logInfo('Selected field '+i+': ' + params[i].field, config);
        await page.type('#fv_' + i, params[i].text);
        logInfo('Type text '+i+': ' + params[i].text, config);
        await page.waitFor(500);
    };

    await page.click('#search');
    await page.waitForSelector('#messagearea');
    logInfo('Advanced search finished', config);
}

async function colectArticlesRef(){
    await page.waitForSelector('#messagearea');
    logInfo('Start colectArticlesRef:', config);

    let data = await page.evaluate(() => {
        const divs = Array.from(document.querySelectorAll('.content'))
        logInfo(divs, config);
        return divs.map(td => {
            td.textContent
            logInfo(td, config);
            return td.textContent;
        })
    });
    logInfo('data:' + data, config);

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
