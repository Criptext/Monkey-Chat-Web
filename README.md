# MonkeyChat-Web-React

MonkeyChat help you set up your own chat in your site.

* If you need to add your chat the fast way to do it:
## MonkeyChat CDN
Use monkeyChat.js from CDN, this MonkeyChat has MonkeyUI and MonkeySDK
```
https://cdn.criptext.com/v2.0.0/monkeyChat.js
```
#### monkeychat.init(String, String, String, String, boolean, Obj, Obj)
To start setup chat.
```
  monkeychat.init(IDDIV, MONKEY_APP_ID, MONKEY_APP_KEY, CONVERSATION_ID, MONKEY_DEBUG_MODE, VIEW, STYLES);
```
IDDIV: Id of <div> tag where you will add the chat in your html.
MONKEY_APP_ID: Monkey ID from your app.
MONKEY_APP_KEY: Monkey KEY from your app.
CONVERSATION_ID: Id of your group conversation of your support chat.
MONKEY_DEBUG_MODE: true/false development debug mode.
VIEW: To define the type chat view.
STYLES: To define the styles of the chat view.





* If you need to add your chat the customize way to do it:
## MonkeyChat REACT
Use monkeyUI using REACT, and you can pass props and methods to your React Class:
#### view (props)
To define the type chat view.
```
  let view = {
    screen: {
      type: '',
      data: {
        width: '',
        height: ''
      },
    }
  };
  ...
  <MonkeyUI view={view}>
```




#### userSession (props)
To define the user session.
```
  let userSession = {
    id: '',
    name: '',
    urlAvatar: ''
  }

```




## Options
The following options are supported in view:
type: 'classic' | 'fullscreen'
If use 'classic' add the data:
data: {width: '380px',height: '500px'}
