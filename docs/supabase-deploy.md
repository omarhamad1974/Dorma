# Database changes from GitHub

Dorma's database schema lives in `supabase/migrations/`. The **Supabase** GitHub Actions workflow
(`.github/workflows/supabase.yml`) puts new migrations live, so after the first setup nobody pastes
SQL into the SQL Editor by hand.

| When | What happens |
| --- | --- |
| A pull request changes anything in `supabase/` | **Check migrations on a fresh database**: a throwaway Supabase database starts inside GitHub and every migration is applied in order. A broken migration fails before it can be merged. Nothing touches the live project. |
| The pull request is merged into `main` | **Apply migrations to live**: migrations the live project has not had yet are applied (`supabase db push`). Migrations already applied never run again. |
| You press **Run workflow** on the Actions tab (branch `main`) | The same deploy, for example after adding the secrets. |

## One-time setup: add two secrets (about 5 minutes)

### 1. Make a Supabase access token

1. Open <https://supabase.com/dashboard/account/tokens>.
2. Click **Generate new token**, name it `GitHub Dorma`, and click **Generate token**.
3. Copy the token (it starts with `sbp_`). It is shown only once.

### 2. Set the database password

The Dorma project was created for you, so nobody has its database password yet. Open the project,
go to **Project Settings → Database**, click **Reset database password**, and copy the new one.
The site doesn't use this password (it uses the public API key), so resetting it changes nothing else.

### 3. Add the secrets to GitHub

Open <https://github.com/omarhamad1974/Dorma/settings/secrets/actions> and add:

| Name | Value |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | the `sbp_…` token from step 1 |
| `SUPABASE_DB_PASSWORD` | the database password from step 2 |
| `SUPABASE_PROJECT_REF` | `uhytsroauemdkuanwdoh` (optional, it's the default) |

### 4. Run it once

Actions tab → **Supabase** → **Run workflow** on `main`. It marks `0001`, which was run by hand when
the project was set up, as applied, and applies anything newer.

## Adding a database change later

Add a new file such as `supabase/migrations/0002_something.sql`, open a pull request, wait for the
check to pass, and merge. Never edit a migration that is already live: add a new one instead.
