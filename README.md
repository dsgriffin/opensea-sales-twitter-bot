# OpenSea Sales Twitter Bot

A (very quickly put together) bot that monitors Opensea sales for a given collection & then posts them to Twitter.

## Donations

If you find this script/repo useful for your project, any ETH/token donations are greatly appreciated 🙏 

Ethereum Address: 0xDCA88f66CEc8972D23DE7d5e69c40E087C92132f

## Requirements

- [Twitter Developer Account](https://developer.twitter.com/en/apply-for-access)

- Heroku Account (Free Tier is fine)

## Setup

Once you have been granted access to a Twitter Developer Account, created a project there + created an account on Heroku

- Clone/Fork/Copy this project to your local public/private git repo

- Create a new Heroku app, link up your Github repo to it so you're able to push commits up and see builds happening in Heroku.

- Log in to the Twitter bot account, then use [Twurl](https://github.com/twitter/twurl) to authorize the app & also to  retrieve the access token & access key

- Make sure you are using `worker` dynos and not `web` dynos - can set this in the CLI your project with:

```sh
heroku ps:scale web=0
heroku ps:scale worker=1
```

In the Settings section of your Heroku app you'll see a Config Vars section. Add the following config vars:

- **CONSUMER_KEY** - Your Twitter App's Consumer Key
- **CONSUMER_SECRET** - Your Twitter App's Consumer Secret
- **ACCESS_TOKEN_KEY** - The Access Token Key of the Twitter Account your bot is posting from
- **ACCESS_TOKEN_SECRET** - The Access Token Secret of the Twitter Account your bot is posting from
- **OPENSEA_COLLECTION_SLUG** - The OpenSea collection name you wish to track (e.g. `cryptopunks`)

## Tweet Content

By default, in the tweet itself I am including an image of the item that was sold, the name of the item, the price in both ETH & USD, an external link if one exists + a couple of hashtags. Check out the [OpenSea Events API](https://docs.opensea.io/reference#retrieving-asset-events) and include whatever extra properties you'd like (such as seller/buyer addresses etc.).

## Useful Resources

If you are having trouble setting up your Twitter Developer project, Heroku project etc. the following resources may be of use

- [Heroku - Deploying with Git](https://devcenter.heroku.com/articles/git)
- [Twurl - Generate Access Token Key/Secret Locally](https://github.com/twitter/twurl)
- [OpenSea Events API](https://docs.opensea.io/reference#retrieving-asset-events)

## License

This code is licensed under the [ISC License](https://choosealicense.com/licenses/isc/).

Please include proper attribution if you fork or modify this project in some way. Thank you!
