# comic-scraper
This a small node-js app that scrapes a comic from your designated website, cuts it up an resizes it to the desired format (in this case: from landscape to verticle - so it's "mobile proof") and pushes it to a mobile phone number via whatsapp using Twilio. 

Libraries used: image-clipper, merge-img, cloudinary, fs, cheerio, nightmare, nightmare-screenshot-selector, twilio.

With special thanks to oscarmorrison for his "nightmare-heroku" repo setup (https://github.com/oscarmorrison/nightmare-heroku)


![Comic](/image.png)
