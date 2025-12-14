# Introduction

This application was prepared and developed **only for testing purposes**. It provides:

- GUI
- API

All data (such as users and other entities) are stored in json file.

> [!TIP]
> If you are looking for a more advanced demo application, check out our application [**🦎 GAD**](https://github.com/jaktestowac/gad-gui-api-demo)! It contains much more features and a better user interface!

# Deployment

Instructions how to deploy presented service to various free hosting sites.

- [Deploy to Glitch](#deploy-to-glitch)
- [Deploy to Render](#deploy-to-render)
- [Deploy to Heroku](#deploy-to-heroku)

## Deploy on **Local**

Requirements:

- **node.js** installed in system

Steps:

1. Open project root directory in cmd/terminal
1. Run `npm i`
1. Run `npm run start`

Application will be available at `http://localhost:3000`

## Deploy to **Glitch**

> [!WARNING]
> **This deployment method is obsolete and no longer recommended.**
>
> Glitch has changed their [platform policies](https://blog.glitch.com/post/changes-are-coming-to-glitch/) and this deployment method may no longer work as expected. Please use one of the other deployment methods instead.

~~No account needed - but your project will be deleted in 5 days.~~

~~After clicking button below wait a minute or two to finish deployment.~~

~~[![Remix on Glitch](https://cdn.glitch.me/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button-v2.svg)](https://glitch.com/edit/#!/import/github/jaktestowac/rest-api-demo)~~

## Deploy to **Render**

 - Create a free account: https://dashboard.render.com/register
 - After successful registration, click the Deploy button below:

 [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jaktestowac/rest-api-demo)

 Deployment steps (high level):

 - Name your app
 - Click Apply
 - Wait for the deploy to finish and open the project link to view your app

 Note: Render offers free instance types and paid plans — check the Render pricing page for current limits and terms

Note about Node version on Render

- If you see an error like:

```
TypeError: Cannot read properties of undefined (reading 'prototype')
	at Object.<anonymous> (node_modules/buffer-equal-constant-time/index.js:37:35)
```

This is caused by a transitive dependency that expects an older Node runtime (it references `SlowBuffer`), while Render may use a very recent Node version by default. To fix this, pin the Node version in `package.json` (we recommend `18.x`) or set the Node version in your Render service settings. The project already includes an `.nvmrc` with `18` to help local development.

## Deploy to **Heroku**

> [!WARNING]
> **This deployment method is obsolete and no longer recommended.**
>
> Heroku has changed their [platform policies](https://blog.heroku.com/next-chapter) and this deployment method may no longer work as expected. Please use one of the other deployment methods instead.

~~<a href="https://heroku.com/deploy?template=https://github.com/jaktestowac/rest-api-demo/tree/main"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy"></a>~~

Heroku was a ~~free~~ hosting service for hosting small projects. Easy setup and deploy from the command line via _git_.
**Data are not persistent! They will be restored to default state** after shutting down application after 30 mins of inactivity.
If an app has a free web dyno, and that dyno receives no web traffic in a 30-minute period, it will sleep.
More: https://devcenter.heroku.com/articles/free-dyno-hours#dyno-sleeping

## 📞 Contact & Support

Feel free to reach out to us:

- 🌐 **Website**: [jaktestowac.pl](https://jaktestowac.pl)
- 💼 **LinkedIn**: [jaktestowac.pl](https://www.linkedin.com/company/jaktestowac/)
- 💬 **Discord**: [Polish Playwright Community](https://discord.gg/mUAqQ7FUaZ)
- 📧 **Support**: Check our website for contact details
- 🐛 **Issues**: [GitHub Issues](https://github.com/jaktestowac/playwright-tools/issues)

---

## Learning Resources

We have gathered a collection of resources to help you learn and master Playwright, both in Polish and English. Whether you're a beginner or an advanced user, these resources will help you enhance your skills and knowledge.

### **🇵🇱 Polish Resources**

- [Free Playwright Resources](https://jaktestowac.pl/darmowy-playwright/) - Comprehensive Polish learning materials
- [Playwright Basics](https://www.youtube.com/playlist?list=PLfKhn9AcZ-cD2TCB__K7NP5XARaCzZYn7) - YouTube series (Polish)
- [Playwright Elements](https://www.youtube.com/playlist?list=PLfKhn9AcZ-cAcpd-XN4pKeo-l4YK35FDA) - Advanced concepts (Polish)
- [Playwright MCP](https://www.youtube.com/playlist?list=PLfKhn9AcZ-cCqD34AG5YRejujaBqCBgl4) - MCP course (Polish)
- [Discord Community](https://discord.gg/mUAqQ7FUaZ) - First Polish Playwright community!
- [Playwright Info](https://playwright.info/) - first and only Polish Playwright blog

### **🇬🇧 English Resources**

- [VS Code Extensions](https://marketplace.visualstudio.com/publishers/jaktestowac-pl) - Our free Playwright plugins
- [Playwright Documentation](https://playwright.dev/docs/intro) - Official documentation
- [Playwright GitHub](https://github.com/microsoft/playwright) - Source code and issues

_PS. For more resources and updates, follow us on our [website](https://jaktestowac.pl) and [GitHub](https://github.com/jaktestowac)._

---

Powered by **[jaktestowac.pl](https://www.jaktestowac.pl) team!** 💚❤️
