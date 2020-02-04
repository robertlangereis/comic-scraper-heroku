// const express = require('express');
// app = express();
// const cron = require('node-cron');

// require environment variables
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
// console.log('listing_url', listing_url);

const Clipper = require('image-clipper');
const mergeImg = require('merge-img');
const cloudinary = require('cloudinary').v2;

const fs = require('fs');
const cheerio = require('cheerio');
const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });
const screenshotSelector = require('nightmare-screenshot-selector');
Nightmare.action('screenshotSelector', screenshotSelector);

const twilio = require('twilio');
const client = twilio(api_account, key);

// let image = { cloudinaryImageUrl: '' };
cloudinary.config({
	cloud_name: cloud_id,
	api_key: cloud_key,
	api_secret: cloud_secret
});

// Package for cropping and chopping the images
Clipper.configure({
	canvas: require('canvas')
});

let currentDate = new Date(),
	day = currentDate.getDate(),
	month = currentDate.getMonth() + 1,
	year = currentDate.getFullYear(),
	date = day + '-' + month + '-' + year;

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
	console.log('RUN STARTING');
	console.log('listing_url', listing_url);
	const webScrape = await nightmare
		.goto(listing_url)
		.wait('.gc-card__image.gc-card__image--overlay')
		.evaluate(() => document.querySelector('body').innerHTML)
		// .end()
		.then(response => getData(response))
		.then(result => {
			return nightmare
				.goto(`${result}`)
				.screenshotSelector({ selector: 'img', path: `app/image/${date}.png` })
				.end(console.log('webscraper done'));
		})
		.catch(error => {
			console.log(error, 'ERROR');
		});

	const cropFirstPicture = await new Promise(resolve => {
		console.log('cropFirstPicture');
		Clipper(`./image/${date}.png`, function() {
			this.crop(0, 0, 535, 458).toFile(`app/sliced/${date}-1.png`, function() {
				resolve(console.log('saved 1st drawing!'));
			});
		});
	});
	const cropSecondPicture = await new Promise(resolve => {
		console.log('cropSecondPicture');
		Clipper(`./image/${date}.png`, function() {
			this.crop(535, 0, 535, 458).toFile(`app/sliced/${date}-2.png`, function() {
				resolve(console.log('saved 2nd drawing!'));
			});
		});
	});
	const cropThirdPicture = await new Promise(resolve => {
		console.log('cropThirdPicture');
		Clipper(`./image/${date}.png`, function() {
			this.crop(1070, 0, 535, 458).toFile(`app/sliced/${date}-3.png`, function() {
				resolve(console.log('saved 3rd drawing!'));
			});
		});
	});

	const mergePictures = await new Promise(resolve => {
		console.log('mergePictures');
		mergeImg([
			{ src: `app/sliced/${date}-1.png` },
			{ src: `app/sliced/${date}-2.png`, offsetX: -535, offsetY: 458 },
			{ src: `app/sliced/${date}-3.png`, offsetX: -535, offsetY: 916 }
		]).then(img => {
			return img.write(`app/image/${date}-verticle.png`, () =>
				resolve(console.log('done merging images'))
			);
		});
	});

	const deleteOriginal = async () => {
		await fs.unlink(`app/image/${date}.png`, () =>
			console.log('deleted original comic!')
		);
		await fs.unlink(`app/sliced/${date}-1.png`, () =>
			console.log('deleted 1st drawing!')
		);
		await fs.unlink(`app/sliced/${date}-2.png`, () =>
			console.log('deleted 2nd drawing!')
		);
		await fs.unlink(`app/sliced/${date}-3.png`, () =>
			console.log('deleted 3rd drawing!')
		);
	};

	const sentImageWithWhatsapp = async () =>
		console.log('sentImageWithWhatsapp');
	await client.messages
		.create({
			from: 'whatsapp:+14155238886',
			body: `The Garfield of today! ${date}`,
			to: `whatsapp:${phone_nr}`,
			mediaUrl: listing_url
		})
		.then(msg => console.log('Msg ID = ', msg.sid))
		.catch(console.error);

	const cloudinaryUpload = async () => console.log('cloudinaryUpload');
	await cloudinary.uploader.upload(`app/image/${date}-verticle.png`, function(
		error,
		result
	) {
		// image.cloudinaryImageUrl = result.url;
		error && console.log(error);
		sentImageWithWhatsapp(result.url);
	});

	let finalResult =
		webScrape +
		cropFirstPicture +
		cropSecondPicture +
		cropThirdPicture +
		mergePictures +
		deleteOriginal() +
		cloudinaryUpload();

	// !Promise.allSettled not yet working in this form
	// let finalResult = Promise.allSettled(
	// 	[
	// 	webScrape, cropFirstPicture,
	// 	cropSecondPicture,
	// 	cropThirdPicture,
	// 	mergePictures,
	// 	deleteOriginal,
	// 	cloudinaryUpload]
	// ).then(results => results.forEach(result => console.log(result.status)));

	return await finalResult;
};

// cron.schedule('30 12 * * 1-6', function() {
// 	try {
// 		run();
// 	} catch (error) {
// 		console.log('error', error);
// 	}
// });

// cron.schedule('00 14 * * 1-6', function() {
try {
	run();
} catch (error) {
	console.log('error', error);
}
// });

// app.listen(port);
