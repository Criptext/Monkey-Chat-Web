# Examples

MonkeyChat is distributed with a few examples in its source code.

### Download

```
git clone https://github.com/Criptext/MonkeyChat-Web-React.git
```

#### Widget

Using MonkeyChat from CDN.

Set Up:

In widget.html define your variables:
myDivForMonkey, YOUR_APP_ID, YOUR_APP_KEY, YOUR_CONVERSATION_ID, COMPANY_NAME.

Run the example:

```
cd MonkeyChat-Web/examples/widget

open widget.html
```


#### Chat

Set Up:

Copy and paste the file 'monkey-const.template.js' on  MonkeyChat-Web/utils.

Rename to 'monkey-const.js'.

In this file define your variables: MONKEY_APP_ID, MONKEY_APP_ID, MONKEY_DEBUG_MODE.

Run the example:

```

cd MonkeyChat-Web/examples/chat

npm install

npm start

open chat.html
```