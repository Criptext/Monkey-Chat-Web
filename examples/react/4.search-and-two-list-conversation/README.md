# Examples: 4.search-two-list-conversation

The code about 'typing' example, here show you the code necessary to implement this behaviors.

## Code
### Define variables to two list conversation
How define the state to two list conversation.

```javascript
...
class MonkeyChat extends Component {
  constructor(props){
    super(props);
    this.state = {
      alternateConversations: null
    }
    
    this.handleConversationFilter = this.handleConversationFilter.bind(this);

    /* options */
    this.options = {
      conversation: {
        header1: 'Individual',
        header2: 'Group'
      }
    }
  }

  render() {
    return (
      <MonkeyUI conversations={this.props.store.conversations}
        alternateConversations={this.state.alternateConversations}
        searchUpdated = {this.handleSearchUpdate}/>
    )
  }

  /* Conversation */

  handleConversationFilter() {
    let conversations = store.getState().conversations;
    let individualConversation = {};
    let groupConversation = {};

    Object.keys(conversations).map( conversationId => {
      let conversation = conversations[conversationId];

      if(isConversationGroup(conversation.id)){
        groupConversation[conversation.id] = conversation;
      }else{
        individualConversation[conversation.id] = conversation;
      }
    });

    this.setState({
      individualConversations: individualConversation,
      groupConversations: groupConversation
    });
  }
...
}


### Calling handleConversationFilter method
How call handleConversationFilter method.

```javascript
...

// MonkeyChat: Conversation

function loadConversations(timestamp, firstTime) {
  if(!monkeyChatInstance.state.conversationsLoading){
  monkeyChatInstance.setState({ isLoadingConversations: true });
}

  monkey.getConversations(timestamp, CONVERSATIONS_LOAD, function(err, resConversations){
    if(err){
      monkeyChatInstance.setState({ isLoadingConversations: false });
      monkeyChatInstance.handleShowConversationsLoading(false);
    }else if(resConversations && resConversations.length > 0){
      let conversations = {};
      let users = {};
      let usersToGetInfo = {};
      resConversations.map (conversation => {

        if(!conversation.info || !Object.keys(conversation.info).length){
          conversation.info = {};
        }

        // define message
        let messages = {};
        let messageId = null;
        if (conversation.last_message.protocolType != 207){
          let message = defineBubbleMessage(conversation.last_message);
          if(message){
            message.status = conversation.last_message.status == 'read' ? 52 : 51;
            messages[message.id] = message;
            messageId = message.id;	
          }
        }

        // define conversation
        let conversationTmp = {
          id: conversation.id,
          name: conversation.info.name || 'Unknown',
          urlAvatar: conversation.info.avatar,
          messages: messages,
          lastMessage: messageId,
          lastModified: conversation.last_modified*1000,
          unreadMessageCounter: conversation.unread,
          description: null,
          loading: false,
          info: conversation.info
        }

        // define group conversation
        if(isConversationGroup(conversation.id)){
          conversationTmp.description = '';
          conversationTmp.admin = conversation.info.admin || '',
          conversationTmp.members = conversation.members;
          conversationTmp.online = false;
          // add users into usersToGetInfo
          conversation.members.map( id => {
            if(!users[id]){
              usersToGetInfo[id] = id;
            }
          });
        }else{ // define personal conversation
          conversationTmp.lastOpenMe = undefined;
          conversationTmp.lastSeen = undefined;
          conversationTmp.online = undefined;
          // add user into users
          let userTmp = {
            id: conversation.id,
            name: conversation.info.name || 'Unknown',
          }
          users[userTmp.id] = userTmp;
          // delete user from usersToGetInfo
          delete usersToGetInfo[userTmp.id];
        }

        conversations[conversationTmp.id] = conversationTmp;
      })

      if(Object.keys(usersToGetInfo).length){
        // define usersToGetInfo to array
        let ids = [];
        Object.keys(usersToGetInfo).map(id => {
          if (id !== '' && id !== 'null'){
            ids.push(id);
          }
        })

        // get user info
        monkey.getInfoByIds(ids, function(err, res){
          if(err){
            console.log(err);
            monkeyChatInstance.setState({ isLoadingConversations: false });
          }else if(res){
            if(res.length){
              let userTmp;
              // add user into users
              res.map(user => {
                userTmp = {
                  id: user.monkey_id,
                  name: user.name == undefined ? 'Unknown' : user.name,
                  urlAvatar: user.avatar
                }
                if(!store.getState().users[user.monkey_id]){
                  users[userTmp.id] = userTmp;
                }
              });
            }
          }

          if(Object.keys(users).length){
            store.dispatch(actions.addUsersContact(users));
          }
          store.dispatch(actions.addConversations(conversations));
          // HERE
          monkeyChatInstance.handleConversationFilter();
          if(firstTime){
            monkey.getPendingMessages();
          }
          monkeyChatInstance.setState({ isLoadingConversations: false });
          monkeyChatInstance.handleShowConversationsLoading(false);
        });
      }else{
        if(Object.keys(users).length){
          store.dispatch(actions.addUsersContact(users));
        }
        store.dispatch(actions.addConversations(conversations));
        // HERE
        monkeyChatInstance.handleConversationFilter();
        if(firstTime){
          monkey.getPendingMessages();
        }
        monkeyChatInstance.setState({ isLoadingConversations: false });
        monkeyChatInstance.handleShowConversationsLoading(false);
      }
    }else{
      monkeyChatInstance.setState({ isLoadingConversations: false });
      monkeyChatInstance.handleShowConversationsLoading(false);
    }
  });
}

```
