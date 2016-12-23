# MonkeyChat-Web

MonkeyChat helps you set up your own chat in your site.

***

* If you need to add your chat, the fast way to do it:

## MonkeyChat CDN
Use monkeyChat.js from our CDN, this MonkeyChat has MonkeyUI and MonkeySDK
```
https://cdn.criptext.com/v2.0.0/monkeyChat.js
```
#### monkeychat.init(String, String, String, String, boolean, Obj, Obj)
To start setup chat.
```
monkeychat.init(IDDIV, MONKEY_APP_ID, MONKEY_APP_KEY, CONVERSATION_ID, MONKEY_DEBUG_MODE, VIEW, STYLES, COMPANY_NAME);
```
IDDIV: Id of 'div' tag where you will add the chat in your html.

MONKEY_APP_ID: App ID of your App, which you can get in this admin panel.

MONKEY_APP_KEY: App KEY of your App, which you can get in this admin panel

CONVERSATION_ID: Id of your group conversation of your support chat.

MONKEY_DEBUG_MODE: true/false development debug mode.

VIEW: To define the type of chat view.

STYLES: To define the styles of the chat view.

COMPANY_NAME: To define name conversation of chat view.

***

### * Options
The following options are supported in view:

type: 'classic' | 'fullscreen'

If use 'classic' add the data:

data: {width: '380px',height: '500px'}


### Example

Monkeychat is distributed with a few examples in its [source code](https://github.com/Criptext/MonkeyChat-Web-React/tree/master/examples).
