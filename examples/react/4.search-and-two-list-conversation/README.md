# Examples: 4.search-and-two-list-conversation

The code about 'search-and-two-list-conversation' example, here show you the code necessary to implement this behaviors.

## Code
### Define variables to second list conversation
How define the state to alternate list conversation.

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
        onSecondSort: this.handleSecondSortConversations,
        header1: 'Conversations',
        header2: 'Users'
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

  handleSecondSortConversations(conversation1, conversation2) {
    return conversation1.name.toLowerCase().localeCompare(conversation2.name.toLowerCase());
  }

  handleSearchUpdate(term){
    if(term != null && term.length > 0){
      var searchUsers = {};
      var users = store.getState().users;
      var conversations = store.getState().conversations;
      Object.keys(users).forEach( (monkeyId) => {
        if(conversations[monkeyId] == null){
          var conversation = {
            id: monkeyId,
            name: users[monkeyId].name,
            urlAvatar: users[monkeyId].urlAvatar,
            messages: {},
            lastMessage: null,
            lastModified: -1,
            unreadMessageCounter: 0,
            description: null,
            loading: false
          }
          searchUsers[monkeyId] = conversation;
        }
      })
      this.setState({ alternateConversations: searchUsers });
    }else{
      this.setState({ alternateConversations: null });
    }
  }

...
}

```
