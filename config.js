// config.js
if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }
module.exports = {
	port: process.env.PORT,
	listing_url: process.env.LISTING_URL,
	phone_nr: process.env.PHONE_NR,
	image_today: process.env.IMAGE_TODAY,
	dest_folder: process.env.DEST_FOLDER,
	api_account: process.env.API_ACCOUNT,
	key: process.env.KEY,
	cloud_id: process.env.CLOUD_ID,
	cloud_key: process.env.CLOUD_KEY,
	cloud_secret: process.env.CLOUD_SECRET
};

