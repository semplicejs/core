![](http://subirimagen.me/uploads/20190128131637.png)
# SempliceJS

**Micro framework for NodeJS**



Semplice is a micro framework for Node JS written completely from scratch for the development of API`s Restful

semplice has several predefined features such as sending email and using WebSockets

to use Semplice we can do it through the [CLI](https://www.npmjs.com/package/semplice-cli "CLI") or by installing the framework with the following command



`$ npm install --save semplice`



##Mode of use:

First we create a new instance of Semplice with which we will create our server with the Listen () method by passing it the listening port.

with the addRoute method we create the routes that we need for our project.


```javascript
// We import semplice
const Semplice = require('semplice');

// We created a new instance of semplice
const server = new Semplice();

// We create an array of routes for the APIs
const routes = [
	{
        path:'/',
        method:'GET',
        controller: (req,res,utils) => {
            res.send(200,{ message: 'Semplice' });
        }
    },
    {
        path:'/',
        method:'POST',
        controller: (req,res,utils) => {
            console.log(req.body);
			res.send(200,{message:'data received'})
        }
    },
];

// We create an array of events that will be executed 
// when data is sent by WebSockets
const events = [
	{
        name:'send',
        controller:function(ws,data){
            console.log('data received -> ', data );
            ws.send({ event:'received', data: { message: 'success' } });
        }
    }
];
//We go through the array of routes and add them
routes.map(e => server.addRoute(e));
//We go through the array of events and add them
events.forEach(e => server.addEventWS(e));

server.listen(3000, (err) => {
    if(err){console.log('error',err)}
    console.log('running server');
})

```


                    
###General methods
                    
| Function name | Description                    | type
| ------------- | ------------------------------ | --------------------------------- |
| `addRoute(route)`      | Add a new route.       | Function
| `addSocket(event)`   | Add a new event websocket    | Function
| `listen(port,callback)`   | Initialize the server in the indicated port    | Function

###Methods for routes

#### Req
| Property name | Description                    | type
| ------------- | ------------------------------ | --------------------------------- |
| `req.headers`      | Returns the headers of the request.       | Object
| `req.body`   | Returns an object with the data sent by the POST method    | Object
| `req.files`   | Returns an object with the files sent by the POST method    | Object
| `req.params`   | Returns an object with the dynamic parameters of the url    | Object
| `req.queryParams`   | Returns an object with the parameters that are sent in the url (query params)    | Object


#### Res
| Function name | Description                    | type
| ------------- | ------------------------------ | --------------------------------- |
| `res.send(status,data,websocket)`      |  Method that sends a complete answer, with a status code (mandatory), an object with the data to send and an object websocket (alternative)   | Function
| `res.status(code)`   | Send a status code    | Function
| `res.json(data)`   | Send a response in JSON format    | Function
| `res.socket(event,data)`   | Send data through websocket, receive two parameters the first is the name of the event and the second the data to send.   | Function

#### Utils
| Function name | Description                    | type
| ------------- | ------------------------------ | --------------------------------- |
| `generateToken(user)`      | Generate a new authentication token with JWT  | Function
| `fileUpload(file,name,folder)`   | It allows to upload a file to the server and returns the url to save it in the database  | Function
| `generateUIAvatar(name,size)`   | Generate a new user avatar through the api of ui-avatars.com and return the url to save in the database  | Function
| `sendMail(smtpOptions,mailOption,callback)`   | Send emails  | Function



###Methods Websockets events
| Function name | Description                    | type
| ------------- | ------------------------------ | --------------------------------- |
| `ws.send(event,data)` | sends data through websocket passing as parameters the event to ejecura in the front and the data to send  | Function
