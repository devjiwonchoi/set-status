# set-status

> Set a custom HTTP status code for the client by utilizing proxy and a meta tag.

**Note: Manipulating HTTP status code is not recommended for production. Use at your own risk.**

## Install

```sh
pnpm add set-status
```

## Configuration

You can configure all settings with the environment variables.

- Set the `TARGET_URL` as your target app URL, `http://localhost:3000` by default.
- Set the `PROXY_SERVER_PORT` for the proxy server port, `3001` by default.
- Set the `TARGET_META_NAME` for the target `meta` tag, `set-status` by default.
- Set the `IGNORE_PATH_REGEX` for the regex to ignore the target path set to Next.js by default.

> See [`.env.example`](./.env.example) for an example.

## Usage

### Basic

Run the proxy server with the following command:

```sh
pnpm proxy-status
```

The proxy server will look for the target meta tag and set the status code to the client.

```html
<meta name="set-status" content="401" />
```

The meta tag above will let the proxy server set the status code to `401`.

### Recommended

Install [`concurrently`](https://www.npmjs.com/package/concurrently) to run the proxy server and your production app concurrently.

```sh
pnpm add concurrently
```

Set your `start` script in `package.json` as follows:

```json
{
  "scripts": {
    "start": "concurrently \"pnpm proxy-status\" \"YOUR PRODUCTION COMMAND\""
  }
}
```

```sh
pnpm start
```

### Next.js

In Next.js, you can statically set a custom `meta` tag by using a `Metadata` API.

Through this, we can set the status code read from the target meta tag.

```tsx
// page.tsx

export default function Unauthorized() {
  return (
    <div>
      <h1>401</h1>
      <p>Unauthorized</p>
    </div>
  )
}

export const metadata = {
  other: {
    'set-status': 401,
  },
}
```

Also, you can dynamically set the target meta tag by using `generateMetadata` function.

```tsx
// page.tsx

export async function generateMetadata() {
  const res = await fetch('https://example.com/api')
  
  if (res.status !== 200) {
    return {
      other: {
        'set-status': res.status,
      },
    }
  }
}
```

For more information about the `Metadata` API, see the [Next.js documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata).
