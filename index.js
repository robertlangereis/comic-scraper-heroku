//import the environment variables from the config file
const {
	listing_url,
	phone_nr,
	image_today,
	key,
	api_account,
	cloud_id,
	cloud_key,
	cloud_secret,
	sender_email,
	receiver_email,
	email_password
} = require('./config');

// Clipper allows for the cropping of the comic images
const Clipper = require('image-clipper');

// Merging the cropped images into one (rearranged) comic once more
const mergeImg = require('merge-img');

// fs: for deleting and addressing certain files in the directories, for instance deleting the cropped images after being merged
const fs = require('fs');

// Cheerio is a simple jQuery for Node.js library. Cheerio makes it easy to select, edit, and view DOM elements.
const cheerio = require('cheerio');
const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });
const screenshotSelector = require('nightmare-screenshot-selector');
Nightmare.action('screenshotSelector', screenshotSelector);

// Twilio: a service provider for sending the final image via Whatsapp
const twilio = require('twilio');
const client = twilio(api_account, key);

// Cloudinary used for storing the final comic image, as it has to be sent as a image final url using Twilio
const cloudinary = require('cloudinary').v2;
cloudinary.config({
	cloud_name: cloud_id,
	api_key: cloud_key,
	api_secret: cloud_secret
});

// Package for cropping and chopping the images
Clipper.configure({
	canvas: require('canvas')
});

// Package for mailing the garfield of the day those who prefer mail over Whatsapp
const nodemailer = require('nodemailer');

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

// async..await is not allowed in global scope, must use a wrapper
async function mailComic() {
	// let smtpTransport = nodemailer.createTransport("SMTP", {

	// let smtpTransport = nodemailer.createTransport({
	// 	service: "Gmail",
	// 	auth: {
	// 	  XOAuth2: {
	// 		user: sender_email, // Your gmail address.
	// 		clientId: "640345018023-sh2dbqji56oe81uum1m917st9hidkdh7.apps.googleusercontent.com",
	// 		clientSecret: "N7csiVlgC8H4bHhKhNdISqT6",
	// 		refreshToken: "1//045lxUcji9VIcCgYIARAAGAQSNwF-L9IrAPJzSbDoq1MXCPkrywTnfm3Ud3nOBzdNpvkWswwcWDXJAZaVSdUYm4R2mK_ZXT8N0Is"
	// 	  }
	// 	}
	//   });
	
	var smtpTransport = nodemailer.createTransport("SMTP", {
		service: "Gmail",
		auth: {
		  XOAuth2: {
			user: "your_email_address@gmail.com", // Your gmail address.
												  // Not @developer.gserviceaccount.com
			clientId: "your_client_id",
			clientSecret: "your_client_secret",
			refreshToken: "your_refresh_token"
		  }
		}
	  });

	  var mailOptions = {
		from: sender_email, // sender address
		to: receiver_email, // list of receivers
		subject: `The Garfield of today! ${date}`, // Subject line
		text: `The Garfield of today! ${date}`, // plain text body
		html: 'Embedded image: <img src="cid:unique@nodemailer.com"/>',
		attachments: [
			{
				filename: `${date}-verticle.png`,
				path: `./image/${date}-verticle.png`,
				cid: 'unique@nodemailer.com' //same cid value as in the html img src
			}
		]
	  };
	  
	  smtpTransport.sendMail(mailOptions, function(error, response) {
		if (error) {
		  console.log(error);
		} else {
		  console.log(response);
		}
		smtpTransport.close();
	  });
	  


	// let info = await smtpTransport.sendMail({
	// 	from: sender_email, // sender address
	// 	to: receiver_email, // list of receivers
	// 	subject: `The Garfield of today! ${date}`, // Subject line
	// 	text: `The Garfield of today! ${date}`, // plain text body
	// 	html: 'Embedded image: <img src="cid:unique@nodemailer.com"/>',
	// 	attachments: [
	// 		{
	// 			filename: `${date}-verticle.png`,
	// 			path: `./image/${date}-verticle.png`,
	// 			cid: 'unique@nodemailer.com' //same cid value as in the html img src
	// 		}
	// 	]
	// });
	console.log('Message sent: %s', info.messageId);
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

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
		Clipper(`./image/${date}.png`, function() {
			this.crop(0, 0, 265, 227).toFile(`./image/${date}-1.png`, function() {
				resolve(console.log('saved 1st drawing!'));
			});
		});
	});
	const cropSecondPicture = await new Promise(resolve => {
		Clipper(`./image/${date}.png`, function() {
			this.crop(265, 0, 265, 227).toFile(`./image/${date}-2.png`, function() {
				resolve(console.log('saved 2nd drawing!'));
			});
		});
	});
	const cropThirdPicture = await new Promise(resolve => {
		Clipper(`./image/${date}.png`, function() {
			this.crop(530, 0, 265, 227).toFile(`./image/${date}-3.png`, function() {
				resolve(console.log('saved 3rd drawing!'));
			});
		});
	});

	const mergePictures = await new Promise(resolve => {
		mergeImg([
			{ src: `./image/${date}-1.png` },
			{ src: `./image/${date}-2.png`, offsetX: -265, offsetY: 227 },
			{ src: `./image/${date}-3.png`, offsetX: -265, offsetY: 454 }
		]).then(img => {
			return img.write(`./image/${date}-verticle.png`, () =>
				resolve(console.log('done merging images'))
			);
		});
	});

	const deleteOriginal = async () => {
		await fs.unlink(`./image/${date}.png`, () =>
			console.log('deleted original comic!')
		);
		await fs.unlink(`./image/${date}-1.png`, () =>
			console.log('deleted 1st drawing!')
		);
		await fs.unlink(`./image/${date}-2.png`, () =>
			console.log('deleted 2nd drawing!')
		);
		await fs.unlink(`./image/${date}-3.png`, () =>
			console.log('deleted 3rd drawing!'),
			console.log('sender_email', sender_email),
			console.log('email_password', email_password),
			console.log('receiver_email', receiver_email)
		);
	};

	const sentImageWithWhatsapp = async url =>
		await client.messages
			.create({
				from: 'whatsapp:+14155238886',
				body: `The Garfield of today! ${date}`,
				to: `whatsapp:${phone_nr}`,
				mediaUrl: url
			})
			.then(msg => console.log('Msg ID = ', msg.sid))
			.catch(console.error);

	const cloudinaryUpload = async () =>
		await cloudinary.uploader.upload(`./image/${date}-verticle.png`, function(
			error,
			result
		) {
			error && console.log(error);
			sentImageWithWhatsapp(result.url);
		});

	let finalResult =
		webScrape +
		cropFirstPicture +
		cropSecondPicture +
		cropThirdPicture +
		mergePictures +
		mailComic().catch(console.error) +
		deleteOriginal() +
		cloudinaryUpload();

	return await finalResult;
};

try {
	run();
} catch (error) {
	console.log('error', error);
}
