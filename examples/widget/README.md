# Widget example

This is the easiest and fastest way to implement monkey chat in your site.

## Installation
You can serve the JavaScript from a CDN. In your HTML file where you like to add the chat put the script.

```html
<script src="https://cdn.criptext.com/v2.1.0/monkeyChatEnterprise.js"></script>
```

## Set Up
Inside the `<body>` tag of your HTML add the widget `<div>` where you will like the widget to show on your page:

```html
<div id='myDivForMonkey'></div>
```

Initialized the widget with:

```javascript
<script type="text/javascript">
  (function() {
    monkeychat.init('myDivForMonkey',
                    'YOUR_APP_ID', 
                    'YOUR_APP_KEY', 
                    'YOUR_ACCESS_TOKEN',
                    null,
                    false,
                    { type: 'classic',
                      data: { width: '380px',
                              height: '500px'},
                    }
                    null,
                    'COMPANY_NAME',
                    true);
  })();
    </script>
```

Define your variables:
```javascript
  YOUR_APP_ID = ''		/* String: App Id from monkey app */
  YOUR_APP_KEY = ''		/* String: Key from monkey app */
  YOUR_ACCESS_TOKEN = ''	/* String: Your access token */
```

Run the example:
```sh
cd Monkey-Chat-Web/examples/widget

open widget.html
```