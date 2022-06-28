# Introduction

This application was prepared and developed **only for testing purposes**. It provides:
- GUI
- API

All data (such as users and other entities) are stored in json file.

# Deployment

Instructions how to deploy presented service to various free hosting sites. 


* [Deploy to Heroku](#deploy-to-heroku)

## Deploy on **Local**

Requirements:
- **node.js** installed in system

Steps:
1. Open project root directory in cmd/terminal
1. Run `npm i`
1. Run `npm run start`

Application will be available at `http://localhost:3000`

## Deploy to **Heroku**
<a href="https://heroku.com/deploy?template=https://github.com/jaktestowac/rest-api-demo/tree/main">
    <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

Heroku is a free hosting service for hosting small projects. Easy setup and deploy from the command line via _git_.
**Data are not persistent! They will be restored to default state** after shutting down application after 30 mins of inactivity.
If an app has a free web dyno, and that dyno receives no web traffic in a 30-minute period, it will sleep.
More: https://devcenter.heroku.com/articles/free-dyno-hours#dyno-sleeping


###### Pros

* PaaS
* Easy and fast setup
* Free

###### Cons (Free Version)

* Application is shut down after 30 mins of inactivity.
  Starts back up when you visit the site but it takes a few extra seconds.


