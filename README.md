## Deployment notes for Buku:

**ecosystem.config.json** - PM2 configuration file for managing both backend and frontend applications [e.g. buku_bill and reporting_client]

```bash
~/projects/buku/reporting_client$ pm2 start ecosystem.config.json
```
[PM2] App [buku_bill_backend] launched (1 instances)
[PM2] App [reporting_client_frontend] launched (1 instances)

After that you can use the following commands to manage the applications:

```bash
pm2 list
pm2 logs... etc.
``` 

Notes:
Notice VITE_BACKEND_URL defined in the .env; accessible via frontend code using import.meta.env.VITE_BACKEND_URL.



### Logs 
Available in ~/.pm2/logs; can be viewed using 'pm2 logs' command.

From **~/.pm2/logs/reporting-client-frontend-out.log:** and **~/.pm2/logs/buku-bill-backend-out.log:**:

1|reportin | > reporting-client@0.0.1 dev /home/dave/projects/buku/reporting_client
1|reportin |   VITE v5.4.0  ready in 1124 ms
1|reportin |   ➜  Local:   http://localhost:5173/
0|buku_bil | [GIN-debug] Listening and serving HTTP on :42069

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
yarn dev

# or start the server and open the app in a new browser tab
yarn dev -- --open
```

## Building

To create a production version of your app:

```bash
yarn build
```

You can preview the production build with `yarn preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
