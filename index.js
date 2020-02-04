const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });

const URL = 'http://blog.oscarmorrison.com/nightmarejs-on-heroku-the-ultimate-scraping-setup/';
console.log('Welcome to Nightmare scrape\n==========');

const run = async function() {
    const webScrape = await nightmare
    .goto(URL)
    .wait('.post-title')
    .evaluate(() => document.querySelector('.post-title').textContent)
    .end()
    .then((result) => {
        console.log(result);
        console.log('=========\nAll done');
    })
    .catch((error) => {
        console.error('an error has occurred: ' + error);
    })
    .then(() => (console.log('process exit'), process.exit()));
    let finalResult =
    webScrape
return await finalResult;
};
try {
	run();
} catch (error) {
	console.log('error', error);
}