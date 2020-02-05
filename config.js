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
	cloud_secret: process.env.CLOUD_SECRET,
	sender_email: process.env.SENDER_EMAIL,
	receiver_email: process.env.RECEIVER_EMAIL,
	email_password: process.env.EMAIL_PASSWORD,
	email_client_id:process.env.EMAIL_CLIENT_ID,
	email_client_secret:process.env.EMAIL_CLIENT_SECRET,
	refresh_token:process.env.REFRESH_TOKEN,
	access_token:process.env.ACCESS_TOKEN,
	expires_in:process.env.EXPIRS_IN
};