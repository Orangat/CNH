## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


## Deploy 
https://app.netlify.com/teams/orangat/sites Login with Github (Serhii Nazarov)
Auto publishing is on. Deploys from main are published automatically.

## Admin panel (content management)

This site includes an **admin panel** powered by **Decap CMS** (formerly Netlify CMS).

- **URL**: `/admin` (for example: `https://your-site.netlify.app/admin`)
- **Editable content** lives in:
  - `public/content/site.json` (service times, footer address/phone/map link, home announcement, giving phone, optional “game time”)
  - `public/content/leaders.json` (leadership list order + details)
  - `public/content/we-believe.json` (“We Believe” content in English + Ukrainian)

### One-time Netlify setup

In Netlify site settings:

- **Create a GitHub OAuth App** (recommended, avoids deprecated Git Gateway):
  - GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
  - **Homepage URL**: `https://churchofnewhope.org`
  - **Authorization callback URL**: `https://churchofnewhope.org/.netlify/functions/callback`
- **Set Netlify environment variables**:
  - Site settings → Build & deploy → Environment → Environment variables
  - `OAUTH_CLIENT_ID` = (from GitHub OAuth App)
  - `OAUTH_CLIENT_SECRET` = (from GitHub OAuth App)
  - `REDIRECT_URL` = `https://churchofnewhope.org/.netlify/functions/callback`
  - Optional: `SCOPES` = `repo,user`

After that, open `/admin`, log in with GitHub, edit content, and publish — changes are committed to the repo and Netlify will auto-deploy.

### Local development (optional)

If you want to use the admin panel locally:

```bash
npx decap-server
```

Then run the app (`npm start`) and open `http://localhost:3000/admin`.