# OpenSea Sales X Bot 🤖

A simple bot that monitors Opensea sales for a given collection & then posts them to X.

## Want to include sales from other markets (X2Y2, LooksRare etc.) too? ⚠️ 

To track sales across multiple marketplaces (X2Y2, LooksRare etc.), use my new repo [NFT Sales X Bot](https://github.com/dsgriffin/nft-sales-x-bot) instead.

## Donations 💵

Eth Address: 0x51C96e813e377E1a18B6867F932aE1B7b1600372

Thank you 🙏

## Requirements 📝

- [X Developer Account](https://developer.x.com/)

- An OpenSea API Key (request one [here](https://docs.opensea.io/reference/api-overview))

- A Heroku Account; a free account should be ok if you tweak the project to run less often than every minute (by default it is every minute), otherwise a $7 a month dyno instance is more than enough

## Setup 🔧

- Clone/Fork/Copy this project to your local public/private git repo

- Create an X Developer App (make sure you change it to have both read/write permissions)

- Create a new Heroku app & set it as a remote branch of your git repo (see [Heroku Remote](https://devcenter.heroku.com/articles/git#creating-a-heroku-remote))

- Make sure you are logged in to the X account you want the bot to run on (as the next step will be authorizing the bot to post on your account)

- Install [Twurl](https://github.com/twitter/twurl) and, using your X Developer consumer key & secret, generate the access token & access secret

In the Settings section of your Heroku app you'll see a Config Vars section. Add the following config vars:

- **CONSUMER_KEY** - Your X Developer App's Consumer Key
- **CONSUMER_SECRET** - Your X Developer App's Consumer Secret
- **ACCESS_TOKEN_KEY** - The Access Token Key of the X Account your bot is posting from
- **ACCESS_TOKEN_SECRET** - The Access Token Secret of the X Account your bot is posting from
- **OPENSEA_COLLECTION_SLUG** - The OpenSea collection name you wish to track (e.g. `cryptopunks`)
- **X_API_KEY** - Your unique OpenSea API key

Now you're ready to release - just push up the code via. git to the Heroku remote (see [Heroku Remote](https://devcenter.heroku.com/articles/git#creating-a-heroku-remote) if unsure how).

Make sure you are using `worker` dynos and not `web` dynos - you can set this in the CLI your project with:

```sh
heroku ps:scale web=0
heroku ps:scale worker=1
```

## Modification 🛠

By default I am just include the name, price in eth & usd, a hashtag or two and a link to the NFT on OpenSea. Check out the [OpenSea Events API](https://docs.opensea.io/reference#retrieving-asset-events) if you want to include additional info (such as seller/buyer addresses etc.).

There is `tweetWithImage` function that you can use instead of the default `tweet` method if you prefer - this will display the full image file as part of the tweet, instead of the standard OpenSea preview image.

In `app.js`, on line 24 you can see there's a commented out conditional if you'd like to only tweet out sales above a certain amount of Eth.

As mentioned at the top of the README, it runs every 60 seconds by default - you can change this to run less often if you'd like to keep it on a free Heroku instance.

## License 📃

This code is licensed under the [ISC License](https://choosealicense.com/licenses/isc/).

Please include proper attribution to my original repo if you fork, modify or utilize this repo in any way. Thank you!
