# Griphite

Griphite is a fully local markdown notes application.

![](https://cdn.hackclub.com/019fb596-67d2-7f42-9ad7-4db49cddfc73/Screenshot_20260730_203127.png)

![](https://cdn.hackclub.com/019fb596-67c7-7ae5-a68e-82d714161e30/Screenshot_20260730_203136.png)

## Why

I love the Obsidian app but I dont like how it is closed source so I am building an open one.

## Running the program

Downloads and run the AppImage.

## Why offline?

So many services are required or have huge amounts of funtionality locked behind a network wall for what reason? So when the WAN or even the LAN goes down, your notes should not go with it. Have all the code for the app, every letter of every note stored on your disk in the `notes` directory. Not a single line of code makes any network request!

## Dev stuff

### Running dev

To run the program for development use the following command

```bash
npm run start
```

### Building

To build the program for production:

```bash
npm run app:dist
```
