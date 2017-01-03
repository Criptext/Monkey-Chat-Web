# React examples

We provide you these examples:

- 1.0.messenger
- 1.1.simplechat
- 2.typing
- 3.two-list-conversation
- 4.search-and-two-list-conversation
- 6.message-info

## Download
```
git clone https://github.com/Criptext/Monkey-Chat-Web.git
```

## Set Up
In the source project you find the folder 'examples/react', enter to any examples.
To each examples you need step up some variables, entry the folder 'utils' of the example that you selected.

1. Copy and paste the file 'monkey-const.template.js'.

2. Rename the copy file to 'monkey-const.js'.

3. In this file define your variables:
```
	MONKEY_APP_ID = ''		/* String: App Id from monkey app */
	MONKEY_APP_KEY = ''		/* String: Key from monkey app */
	MONKEY_DEBUG_MODE = ''	/* Boolean: true for development mode | false for production mode */
	userTest = ''			/* String: monkeyId of the user to test */
```

## Run the example
In the terminal, go to Monkey-Chat-Web project's folder and enter to the example selected and write this:
```
cd Monkey-Chat-Web/examples/react/1.0.messenger

npm install

npm test /* development environment or */ npm run build /* production environmnet */

open chat.html
```