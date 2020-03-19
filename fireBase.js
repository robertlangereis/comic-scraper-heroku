// Import Admin SDK
var admin = require('firebase-admin');
// Fetch the service account key JSON file contents
var serviceAccount = require('./fb-config.json');

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://garfield-subscribers.firebaseio.com'
});

// Get a database reference to our posts
var db = admin.database();
var ref = db.ref('subscribers');

// Attach an asynchronous callback to read the data at our posts reference

const dataRetrieve = async () =>
	await ref.on(
		'value',
		function(snapshot) {
			const jsonObject = snapshot.val();
			const subscribersList = [];
			Object.values(jsonObject).map(subscriber =>
				subscribersList.push(subscriber)
			);
			// console.log('subscribersList', subscribersList);
			return subscribersList;
		},
		function(errorObject) {
			console.log('The read failed: ' + errorObject.code);
		}
	);
exports.dataRetrieve = dataRetrieve;

const emailList = [];
const phoneNumberList = [];
const emailRetrieve = async () =>
	await ref.on(
		'value',
		function(snapshot) {
			const jsonObject = snapshot.val();
			Object.values(jsonObject).map(subscriber => {
				if (subscriber.email !== '') emailList.push(subscriber.email);
				if (subscriber.phone !== '') phoneNumberList.push(subscriber.phone);
			});
			emailList.join(', ');
			exports.emailList = emailList;
		},
		function(errorObject) {
			console.log('The read failed: ' + errorObject.code);
		}
	);
exports.emailRetrieve = emailRetrieve;
exports.emailList = emailList;
exports.phoneNumberList = phoneNumberList;
