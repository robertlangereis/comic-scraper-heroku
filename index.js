const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });

const URL = 'https://www.gocomics.com/garfield';
console.log('Welcome to Nightmare scrape\n==========');

const run = async function() {
	const webScrape = await nightmare
		.goto(URL)
		.wait('.gc-card__image.gc-card__image--overlay')
		.evaluate(() => document.querySelector('body').innerHTML)
		// .end()
		.then(response => console.log(response))
		// .then(result => {
		// 	return nightmare
		// 		.goto(`${result}`)
		// 		.screenshotSelector({ selector: 'img', path: `./image/${date}.png` })
		// 		.end(console.log('webscraper done'));
		// })
		.catch(error => {
			console.log(error, 'ERROR');
		});


    let finalResult =
    webScrape
return await finalResult;
};
try {
	run();
} catch (error) {
	console.log('error', error);
}