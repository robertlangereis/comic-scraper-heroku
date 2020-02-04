const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });

console.log('Welcome to Nightmare scrape\n==========');

let currentDate = new Date(),
	day = currentDate.getDate(),
	month = currentDate.getMonth() + 1,
	year = currentDate.getFullYear(),
	date = day + '-' + month + '-' + year;

const {
	listing_url,
	phone_nr,
	image_today,
	key,
	api_account,
	cloud_id,
	cloud_key,
	cloud_secret,
	port
} = require('./config');

const screenshotSelector = require('nightmare-screenshot-selector');
Nightmare.action('screenshotSelector', screenshotSelector);

const Clipper = require('image-clipper');
Clipper.configure({
	canvas: require('canvas')
});

// const mergeImg = require('merge-img');
// const cloudinary = require('cloudinary').v2;
// const fs = require('fs');
const cheerio = require('cheerio');

const getData = html => {
	const $ = cheerio.load(html);
	let data = [];
	$(image_today).each((i, elem) => {
		if (elem.attribs.src === undefined) return;
		data.push({
			src: elem.attribs.src
		});
	});
	return data[0].src;
};

const run = async function() {
    const webScrape = await nightmare
    .goto(listing_url)
    .wait('.gc-card__image.gc-card__image--overlay')
    .evaluate(() => document.querySelector('body').innerHTML)
    // .end()
    .then(response => getData(response))
    .then(result => {
        return nightmare
            .goto(`${result}`)
            .screenshotSelector({ selector: 'img', path: `./image/${date}.png` })
            .end(console.log('webscraper done'));
    })
    .catch(error => {
        console.log(error, 'ERROR');
    });

const cropFirstPicture = await new Promise(resolve => {
    console.log('cropFirstPicture');
    Clipper(`./image/${date}.png`, function() {
        this.crop(0, 0, 535, 458).toFile(`./sliced/${date}-1.png`, function() {
            resolve(console.log('saved 1st drawing!'));
        });
    });
});
const cropSecondPicture = await new Promise(resolve => {
    console.log('cropSecondPicture');
    Clipper(`./image/${date}.png`, function() {
        this.crop(535, 0, 535, 458).toFile(`./sliced/${date}-2.png`, function() {
            resolve(console.log('saved 2nd drawing!'));
        });
    });
});
const cropThirdPicture = await new Promise(resolve => {
    console.log('cropThirdPicture');
    Clipper(`./image/${date}.png`, function() {
        this.crop(1070, 0, 535, 458).toFile(`./sliced/${date}-3.png`, function() {
            resolve(console.log('saved 3rd drawing!'));
        });
    });
});


	let finalResult =
		webScrape +
		cropFirstPicture +
		cropSecondPicture +
        cropThirdPicture 
        
return await finalResult;
};
try {
	run();
} catch (error) {
	console.log('error', error);
}