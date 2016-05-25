# MonkeyChat-Web-React

MonkeyChat help you set up your own chat in your site.

***

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
IDDIV: Id of 'div' tag where you will add the chat in your html.

MONKEY_APP_ID: Monkey ID from your app.

MONKEY_APP_KEY: Monkey KEY from your app.

CONVERSATION_ID: Id of your group conversation of your support chat.

MONKEY_DEBUG_MODE: true/false development debug mode.

VIEW: To define the type chat view.

STYLES: To define the styles of the chat view.

***

* If you need to add your chat the customize way to do it:

## MonkeyChat REACT
Use monkeyUI using REACT, and you can pass props and methods to your React Class:

#### view (prop)
To define the type chat view.
```
let view = {
  screen: {
    type: (String),
    data: {
      width: (String),
      height: (String)
    },
  }
}
...
<MonkeyUI view={view}>
```

#### userSession (prop)
To define the user session.
```
let userSession = {
  id: (String),
  name: (String),
  urlAvatar: (String)
}
...
<MonkeyUI userSession={userSession}>
```

#### conversation (prop)
To define the conversation to start the chat
```
let conversation = {
  id: (Strind),
  lastMessage: (String),
  messages: (Obj),
  name: (String),
  unreadMessageCounter: (int),
  urlAvatar: (String)
}
...
<MonkeyUI conversation={conversation}>
```

#### conversations (prop)
To define the list conversation of the chat
```
let conversations = {
  [conversationA.id]: conversationA,
  [conversationB.id]: conversationB,
  ...
}
...
<MonkeyUI conversations={conversations}>
```

#### userSessionToSet (method)
To receive a user's data from login
```
<MonkeyUI userSessionToSet={handleUserSessionToSet}>
...
handleUserSessionToSet(user){
}

```

#### messageToSet (method)
To receive a message generated from input.
```
<MonkeyUI messageToSet={handleMessageToSet}>
...
handleMessageToSet(message){
}
```

#### conversationOpened (method)
To recieve a conversation opened.
```
<MonkeyUI conversationOpened={handleConversationOpened}>
...
handleConversationOpened(conversation){
}
```

#### loadMessages (method)
To receive a conversation's data that need get more messages.
```
<MonkeyUI loadMessages={handleLoadMessages}>
...
handleLoadMessages(conversationId, firstMessageId){
}
```

#### form (React.Component)
To define a component form that you will add in the app.
```
import MyForm from './path/MyForm.js'
...
<MonkeyUI form={MyForm}>
```

#### dataDownloadRequest (method)
To receive the message data that need download source.
```
<MonkeyUI dataDownloadRequest={handleDownloadData}>
...
handleDownloadData(mokMessage){
}
```

#### getUserName (method)
To receive a user's id that the UI need to know the name; it is used from bubble. 
```
<MonkeyUI getUserName={handleGetUserName}>
...
handleGetUserName(userId){
}
```

#### styles (prop)
To define the styles of the chat view
```
let styles = {
  colorIn: (String),
  colorOut: (String),
  tabColor: (String),
  tabTextColor: (String),
  tabText: (String),
  logo: (String),
}
...
<MonkeyUI styles={styles}>
```


### * Options
The following options are supported in view:

type: 'classic' | 'fullscreen'

If use 'classic' add the data:

data: {width: '380px',height: '500px'}
