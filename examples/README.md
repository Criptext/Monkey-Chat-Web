# Examples

MonkeyChat is distributed with a few examples in its source code.

## Download
```
git clone https://github.com/Criptext/MonkeyChat-Web.git
```

## React examples
In the source project you find the folder 'examples'.

Enter to any examples:
1.0.messenger
1.1.simplechat
2.group-typing
3.two-list-conversation

### Set Up:
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

### Run the example:
In the terminal access to MonkeyChat-Web project and entry to example selected and write this 
```
cd MonkeyChat-Web/examples/1.0.messenger

npm install

npm test /* development environment or */ npm run build /* production environmnet */

open chat.html
```

## Widget

Using MonkeyChat from CDN.

Set Up:

In widget.html define your variables:
myDivForMonkey, YOUR_APP_ID, YOUR_APP_KEY, YOUR_CONVERSATION_ID, COMPANY_NAME.

Run the example:

```
cd MonkeyChat-Web/examples/widget

open widget.html
```