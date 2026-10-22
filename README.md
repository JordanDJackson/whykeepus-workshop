# Your first human signal 🚀

Run your own tiny **Node.js + Express server**, send a fictional message, and watch it arrive on the WhyKeepUs globe.

**Node.js** runs JavaScript outside the browser. **Express** helps your server listen for requests and send replies.

## 1. Get ready

Install [Node.js 22 or newer](https://nodejs.org/en/download). You also need a code editor and a terminal.

Click **Code → Download ZIP** on this page, extract the ZIP, and open the extracted folder in your editor. You do not need a GitHub account or Git. Open a terminal **inside that folder**.

```sh
node --version
npm ci
npm start
```

Open http://localhost:3001. Your server should say **Mission control is ready**. Leave that terminal running.

## 2. Prepare your signal

Open `mission.mjs`. Fill the three empty strings with a made-up character and a broad city:

```js
const body = {
  displayName: "SnackPilot",
  location: "Detroit, MI, USA",
  reason: "I rescue forgotten cookies."
};
```

Set the empty `method` to `"POST"`. POST asks the app to create a record. Save the file; your server will read the changes on the next send.

**The live registry is public.** Use a fictional alias. Keep full names, schools, addresses, emails, phone numbers, and private details out. Your character's city need not be where you live.

## 3. Launch

Open a **second terminal in the same folder**:

```sh
npm run send
```

Send once. A **201** reply means the app saved your message. Find the record ID in the reply, then watch [WhyKeepUs](https://whykeepus.com) on the shared screen. Arrivals may queue. Reload the website and find the same record again: that is the persistence check.

Another accepted POST creates another record. It does not edit the first. If the reply is lost, check the registry before resending.

```text
send.mjs → your Express server → WhyKeepUs API → database
                                                    ↓
                                      presenter's browser + globe
```

## The three small files

| File | What it does |
| --- | --- |
| `mission.mjs` | Your message and the request you fill in. |
| `server.mjs` | Express listens at `/send` and runs your mission. |
| `send.mjs` | Sends a request to your own server and prints its reply. |

## Practice without posting publicly

Stop your server with **Ctrl+C**, then run:

```sh
npm run start:mock
```

Use `npm run send` from the second terminal. Replies say **MOCK: not saved to WhyKeepUs**. Practice checks fields but does not save data, light up the website, resolve cities, or moderate text. Restarting resets its pretend IDs.

## Troubleshooting

| What you see | What to try |
| --- | --- |
| `node` or `npm` is not recognized | Install Node, then reopen the terminal/editor. |
| PowerShell says scripts are disabled | Use `npm.cmd` instead of `npm`, or use Command Prompt. |
| Can't find `package.json` | Open the terminal in the extracted project folder. |
| `EADDRINUSE` | Another server uses port 3001. Stop your earlier copy or see the port setting below. |
| No local reply | Keep `npm start` running in the first terminal. |
| 400 | Check the required fields: alias ≤48, location ≤100, reason ≤240 characters. |
| 422 | Read the error; use a clearer city and a respectful public message. |
| 503 | The site's service is unavailable. Ask the facilitator. |
| 502 or timeout | Save `mission.mjs`, check `POST` and your connection. Check for your live record before resending. |
| 201, but no arrival yet | Wait for the queue and check the registry; don't resend to fix an animation. |

## For facilitators

Preinstall Node before class and rehearse one fictional submission over the venue Wi-Fi. Students need no API keys, database credentials, GitHub accounts, or public servers. Have them send in small groups; each arrival takes about seven seconds.

To target your local app, set `WHYKEEPUS_URL` before starting:

```sh
# macOS / Linux
WHYKEEPUS_URL=http://localhost:3000 npm start
```

```powershell
# Windows PowerShell
$env:WHYKEEPUS_URL = 'http://localhost:3000'
npm start
```

Your app needs its own database and moderation configuration. `localhost` means the computer running the command. Students on other laptops need your reachable LAN address or the normal hosted site. The default is https://whykeepus.com.

If port 3001 is occupied, set `PORT=3101` for **both** terminals (`PORT=3101 npm start` and `PORT=3101 npm run send` on macOS/Linux; `$env:PORT='3101'` in each PowerShell terminal). The starter listens only on the student's own computer.

Run `npm test` to check the starter against local mock/fixture endpoints. Automated tests never post to the public registry.
