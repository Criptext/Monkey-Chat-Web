var monkey =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _MOKMessage = __webpack_require__(1);

	var _MOKMessage2 = _interopRequireDefault(_MOKMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
		Main lib of monkey that will be bundled with webpack
	*/

	/*
		The following libs in scripts are loaded using the module script-loader 
		of webpack, to be used as global scripts.
		This is a replacement of <script tag>
	*/
	__webpack_require__(2);
	__webpack_require__(5);
	__webpack_require__(7);

	window.MOKMessage = _MOKMessage2.default;

	var STATUS = {
	    OFFLINE: 0,
	    HANDSHAKE: 1,
	    CONNECTING: 2,
	    ONLINE: 3
	};

	var MOKMessageProtocolCommand = {
	    MESSAGE: 200,
	    GET: 201,
	    TRANSACTION: 202,
	    OPEN: 203,
	    SET: 204,
	    ACK: 205,
	    PUBLISH: 206,
	    DELETE: 207,
	    CLOSE: 208,
	    SYNC: 209,
	    MESSAGENOTDELIVERED: 50,
	    MESSAGEDELIVERED: 51,
	    MESSAGEREAD: 52
	};

	var MOKMessageType = {
	    TEXT: 1,
	    FILE: 2,
	    TEMP_NOTE: 3,
	    NOTIF: 4,
	    ALERT: 5
	};

	var MOKMessageFileType = {
	    AUDIO: 1,
	    VIDEO: 2,
	    PHOTO: 3,
	    ARCHIVE: 4
	};

	var MOKGetType = {
	    HISTORY: 1,
	    GROUPS: 2
	};

	var MOKSyncType = {
	    HISTORY: 1,
	    GROUPS: 2
	};

	var jQueryScriptOutputted = false;

	function initJQuery() {

	    //if the jQuery object isn't available
	    if (typeof jQuery == 'undefined') {

	        if (!jQueryScriptOutputted) {
	            //only output the script once..
	            jQueryScriptOutputted = true;
	            var $script = __webpack_require__(9);
	            $script("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js", function () {

	                console.log("Monkey is ready");
	            });
	        }
	        //setTimeout("initJQuery()", 50);
	    } else {

	            $(function () {
	                //do anything that needs to be done on document.ready
	                console.log("Monkey is ready");
	            });
	        }
	}

	initJQuery();

	/* Start monkey,js implementation */

	//updates from feeds

	var socketConnection = null;

	var monkey = new function () {

	    this.session = { id: null, serverPublic: null, userData: null };
	    this.appKey = null;
	    this.secretKey = null;
	    this.keyStore = null;
	    this.session.expiring = 0;
	    this.domainUrl = "monkey.criptext.com";
	    this.status = STATUS.OFFLINE; // offline default
	    this.lastTimestamp = 0;
	    this.lastMessageId = 0;

	    this.init = function (appKey, secretKey, userObj, optionalExpiring, optionalDebuging) {
	        this.appKey = appKey;
	        this.secretKey = secretKey;
	        this.session.userData = userObj; // validate JSON String
	        this.keyStore = {};
	        this.debugingMode = false;

	        optionalExpiring ? this.session.expiring = 1 : this.session.expiring = 0;

	        optionalDebuging ? this.debugingMode = true : this.debugingMode = false;

	        if (userObj) {
	            userObj.monkey_id ? this.session.id = userObj.monkey_id : this.session.id = null;
	        }

	        console.log("====  init domain " + this.domainUrl);

	        startSession();
	    };

	    this.generateLocalizedPush = generateLocalizedPush;
	    //network
	    this.sendMessage = sendMessage;
	    this.sendEncryptedMessage = sendEncryptedMessage;
	    this.sendOpenToUser = sendOpenToUser;
	    this.sendNotification = sendNotification;
	    this.publish = publish;
	    this.getPendingMessages = getPendingMessages;

	    //http
	    this.subscribe = subscribe;
	    this.sendFile = sendFile;
	    this.sendEncryptedFile = sendEncryptedFile;
	    this.downloadFile = downloadFile;
	    this.createGroup = createGroup;
	    this.addMemberToGroup = addMemberToGroup;
	    this.removeMemberFromGroup = removeMemberFromGroup;
	    this.getInfoById = getInfoById;
	    this.getAllConversations = getAllConversations;
	    this.getConversationMessages = getConversationMessages;
	    //check if there's reason for this to exist
	    this.getMessagesSince = getMessagesSince;
	}();

	/*
	    NETWORKING
	 */

	function sendCommand(command, args) {
	    var finalMessage = JSON.stringify({ cmd: command, args: args });
	    console.log("================");
	    console.log("Monkey - sending message: " + finalMessage);
	    console.log("================");
	    socketConnection.send(finalMessage);
	}
	function sendOpenToUser(monkeyId) {
	    sendCommand(MOKMessageProtocolCommand.OPEN, { rid: monkeyId });
	}
	function startConnection(monkey_id) {

	    var token = monkey.appKey + ":" + monkey.secretKey;

	    if (monkey.debugingMode) {
	        //no ssl

	        socketConnection = new WebSocket('ws://' + monkey.domainUrl + '/websockets?monkey_id=' + monkey_id + '&p=' + token, 'criptext-protocol');
	    } else {
	        socketConnection = new WebSocket('wss://' + monkey.domainUrl + '/websockets?monkey_id=' + monkey_id + '&p=' + token, 'criptext-protocol');
	    }

	    socketConnection.onopen = function () {
	        monkey.status = STATUS.ONLINE;
	        $(monkey).trigger("onConnect", { monkey_id: monkey.session.id });
	        getPendingMessages();
	    };

	    socketConnection.onmessage = function (evt) {
	        console.log("incoming message: " + evt.data);
	        var jsonres = JSON.parse(evt.data);

	        if (jsonres.args.app_id == null) {
	            jsonres.args.app_id = monkey.appKey;
	        }

	        var msg = new _MOKMessage2.default(jsonres.cmd, jsonres.args);
	        switch (parseInt(jsonres.cmd)) {
	            case MOKMessageProtocolCommand.MESSAGE:
	                {
	                    processMOKProtocolMessage(msg);
	                    break;
	                }
	            case MOKMessageProtocolCommand.PUBLISH:
	                {
	                    processMOKProtocolMessage(msg);
	                    break;
	                }
	            case MOKMessageProtocolCommand.ACK:
	                {
	                    //msg.protocolCommand = MOKMessageProtocolCommand.ACK;
	                    //msg.monkeyType = set status value from props
	                    processMOKProtocolACK(msg);
	                    break;
	                }
	            case MOKMessageProtocolCommand.GET:
	                {
	                    //notify watchdog
	                    switch (jsonres.args.type) {
	                        case MOKGetType.HISTORY:
	                            {
	                                var arrayMessages = jsonres.args.messages;
	                                var remaining = jsonres.args.remaining_messages;

	                                processGetMessages(arrayMessages, remaining);
	                                break;
	                            }
	                        case MOKGetType.GROUPS:
	                            {
	                                msg.protocolCommand = MOKMessageProtocolCommand.GET;
	                                msg.protocolType = MOKMessageType.NOTIF;
	                                //monkeyType = MOKGroupsJoined;
	                                msg.text = jsonres.args.messages;

	                                $(monkey).trigger("onNotification", msg);
	                                break;
	                            }
	                    }

	                    break;
	                }
	            case MOKMessageProtocolCommand.SYNC:
	                {
	                    //notify watchdog
	                    switch (jsonres.args.type) {
	                        case MOKSyncType.HISTORY:
	                            {
	                                var arrayMessages = jsonres.args.messages;
	                                var remaining = jsonres.args.remaining_messages;

	                                processSyncMessages(arrayMessages, remaining);
	                                break;
	                            }
	                        case MOKSyncType.GROUPS:
	                            {
	                                msg.protocolCommand = MOKMessageProtocolCommand.GET;
	                                msg.protocolType = MOKMessageType.NOTIF;
	                                //monkeyType = MOKGroupsJoined;
	                                msg.text = jsonres.args.messages;

	                                $(monkey).trigger("onNotification", msg);
	                                break;
	                            }
	                    }

	                    break;
	                }
	            case MOKMessageProtocolCommand.OPEN:
	                {
	                    msg.protocolCommand = MOKMessageProtocolCommand.OPEN;
	                    $(monkey).trigger("onNotification", msg);
	                    break;
	                }
	            default:
	                {
	                    $(monkey).trigger("onNotification", msg);
	                    break;
	                }
	        }
	    };

	    socketConnection.onclose = function (evt) {
	        //check if the web server disconnected me
	        if (evt.wasClean) {
	            console.log("Websocket closed - Connection closed... " + evt);
	            monkey.status = STATUS.OFFLINE;
	        } else {
	            //web server crashed, reconnect
	            console.log("Websocket closed - Reconnecting... " + evt);
	            monkey.status = STATUS.CONNECTING;
	            setTimeout(startConnection(monkey_id), 2000);
	        }

	        $(monkey).trigger("onDisconnect");
	    };
	}

	function processGetMessages(messages, remaining) {
	    processMultipleMessages(messages);

	    if (remaining > 0) {
	        requestMessagesSinceId(monkey.lastMessageId, 15, false);
	    }
	}

	function processSyncMessages(messages, remaining) {
	    processMultipleMessages(messages);

	    if (remaining > 0) {
	        requestMessagesSinceTimestamp(monkey.lastTimestamp, 15, false);
	    }
	}

	function getPendingMessages() {
	    requestMessagesSinceTimestamp(monkey.lastTimestamp, 15, false);
	}

	function requestMessagesSinceId(lastMessageId, quantity, withGroups) {
	    var args = {
	        messages_since: lastMessageId,
	        qty: quantity
	    };

	    if (withGroups == true) {
	        args.groups = 1;
	    }

	    sendCommand(MOKMessageProtocolCommand.GET, args);
	}

	function requestMessagesSinceTimestamp(lastTimestamp, quantity, withGroups) {
	    var args = {
	        since: lastTimestamp,
	        qty: quantity
	    };

	    if (withGroups == true) {
	        args.groups = 1;
	    }

	    sendCommand(MOKMessageProtocolCommand.SYNC, args);
	}

	function processMOKProtocolMessage(message) {
	    console.log("===========================");
	    console.log("MONKEY - Message in process: " + message.id + " type: " + message.protocolType);
	    console.log("===========================");

	    switch (message.protocolType) {
	        case MOKMessageType.TEXT:
	            {
	                incomingMessage(message);
	                break;
	            }
	        case MOKMessageType.FILE:
	            {
	                fileReceived(message);
	                break;
	            }
	        default:
	            {
	                $(monkey).trigger("onNotification", message);
	                break;
	            }
	    }
	}

	function processMultipleMessages(messages) {
	    for (var i = messages.length - 1; i >= 0; i--) {
	        var msg = new _MOKMessage2.default(MOKMessageProtocolCommand.MESSAGE, messages[i]);
	        processMOKProtocolMessage(msg);
	    }
	}

	function processMOKProtocolACK(message) {
	    console.log("===========================");
	    console.log("MONKEY - ACK in process");
	    console.log("===========================");

	    //Aditional treatment can be done here

	    $(monkey).trigger("onAcknowledge", message);
	}

	function incomingMessage(message) {
	    if (message.isEncrypted()) {
	        try {
	            message.text = aesDecryptIncomingMessage(message);
	        } catch (error) {
	            console.log("===========================");
	            console.log("MONKEY - Fail decrypting: " + message.id + " type: " + message.protocolType);
	            console.log("===========================");
	            //get keys
	            getAESkeyFromUser(message.senderId, message, function (response) {
	                if (response != null) {
	                    incomingMessage(message);
	                }
	            });
	            return;
	        }

	        if (message.text == null) {
	            //get keys
	            getAESkeyFromUser(message.senderId, message, function (response) {
	                if (response != null) {
	                    incomingMessage(message);
	                }
	            });
	            return;
	        }
	    } else {
	        message.text = message.encryptedText;
	    }

	    if (message.id > 0) {
	        monkey.lastTimestamp = message.datetimeCreation;
	        monkey.lastMessageId = message.id;
	    }

	    switch (message.protocolCommand) {
	        case MOKMessageProtocolCommand.MESSAGE:
	            {
	                $(monkey).trigger("onMessage", message);
	                break;
	            }
	        case MOKMessageProtocolCommand.PUBLISH:
	            {
	                $(monkey).trigger("onChannelMessages", message);
	                break;
	            }
	    }
	}

	function fileReceived(message) {
	    if (message.id > 0) {
	        monkey.lastTimestamp = message.datetimeCreation;
	        monkey.lastMessageId = message.id;
	    }

	    $(monkey).trigger("onMessage", message);
	}

	/*
	    API CONNECTOR
	 */

	/** Handling any type ajax request to api */

	function basicAjaxRequest(methodName, endpointUrl, dataObj, onSuccess) {

	    console.log("Sending keys app " + monkey.appKey + " sec " + monkey.secretKey);
	    console.log("==== domainUrl " + monkey.domainUrl + " endpointUrl " + endpointUrl);

	    var basic = getAuthParamsBtoA(monkey.appKey + ":" + monkey.secretKey);

	    //setup request url
	    var reqUrl = monkey.domainUrl + endpointUrl;
	    if (monkey.debugingMode) {
	        //no ssl
	        reqUrl = "http://" + reqUrl;
	    } else {
	        reqUrl = "https://" + reqUrl;
	    }

	    $.ajax({
	        type: methodName,
	        url: reqUrl,
	        data: { data: JSON.stringify(dataObj) },
	        async: true,
	        xhrFields: { withCredentials: true },
	        beforeSend: function beforeSend(xhr) {
	            xhr.setRequestHeader('Accept', '*/*');
	            xhr.setRequestHeader("Authorization", "Basic " + basic);
	        },
	        success: function success(respObj) {
	            onSuccess(null, respObj);
	        },
	        error: function error(err) {
	            onSuccess(err);
	        }
	    }); // end of AJAX CALL
	}

	function startSession() {

	    var currentMonkeyId = null;

	    if (monkey.session.id) {
	        currentMonkeyId = monkey.session.id;
	    }

	    var params = { user_info: monkey.session.userData, session_id: currentMonkeyId, expiring: monkey.session.expiring };

	    monkey.status = STATUS.HANDSHAKE;

	    basicAjaxRequest("POST", "/user/session", params, function (err, respObj) {

	        if (err) {
	            console.log(err);
	            return;
	        }

	        if (respObj.data.monkeyId) {

	            monkey.session.id = respObj.data.monkeyId;
	        }

	        monkey.session.serverPublic = respObj.data.publicKey;

	        $(monkey).trigger("onSession", { monkey_id: monkey.session.id });

	        monkey.status = STATUS.CONNECTING;

	        if (currentMonkeyId == monkey.session.id) {

	            console.log("Reusing Monkey ID : " + monkey.session.id);

	            return syncKeys(monkey.session.id);
	        }
	        var myKeyParams = generateSessionKey(); // generates local AES KEY
	        var encryptedConnectParams = encryptSessionParams(myKeyParams, respObj.data.publicKey);

	        monkey.keyStore[monkey.session.id] = { key: monkey.session.myKey, iv: monkey.session.myIv };
	        connect(monkey.session.id, encryptedConnectParams);
	    });
	} /// end of function startSession

	function connect(monkeyId, usk) {

	    console.log(" MonkeyId " + monkeyId + " USK " + usk);
	    basicAjaxRequest("POST", "/user/connect", { monkey_id: monkeyId, usk: usk }, function (err, respObj) {

	        if (err) {
	            console.log(err);
	            return;
	        }

	        console.log("Monkey - Connection to establish " + respObj);

	        startConnection(monkeyId);
	    });
	}

	function subscribe(channelname, callback) {

	    basicAjaxRequest("POST", "/channel/subscribe/" + channelname, { monkey_id: monkey.session.id }, function (err, respObj) {

	        if (err) {
	            return;
	        }
	        $(monkey).trigger("onSubscribe", respObj);
	    });
	}

	function syncKeys(monkeyId) {

	    // generate public key and private key for exchange
	    // send public key to the server to encrypt the data at the server and then decrypt it
	    generateExchangeKeys();
	    basicAjaxRequest("POST", "/user/key/sync", { monkey_id: monkeyId, public_key: monkey.session.exchangeKeys.getPublicKey() }, function (err, respObj) {
	        if (err) {
	            console.log(err);
	            return;
	        }
	        console.log(respObj);
	        console.log(JSON.stringify(respObj));

	        monkey.lastTimestamp = respObj.data.last_time_synced;
	        monkey.lastMessageId = respObj.data.last_message_id;

	        var decryptedAesKeys = monkey.session.exchangeKeys.decrypt(respObj.data.keys);
	        console.log("de " + decryptedAesKeys);
	        var myAesKeys = decryptedAesKeys.split(":");
	        monkey.session.myKey = myAesKeys[0];
	        monkey.session.myIv = myAesKeys[1];
	        //var myKeyParams=generateSessionKey();// generates local AES KEY
	        monkey.keyStore[monkeyId] = { key: monkey.session.myKey, iv: monkey.session.myIv };
	        startConnection(monkeyId);
	    });
	}

	function createGroup(members, groupInfo, optionalPush, optionalId, callback) {
	    //check if I'm already in the proposed members
	    if (members.indexOf(monkey.session.id) == -1) {
	        members.push(monkey.session.id);
	    }

	    basicAjaxRequest("POST", "/group/create", {
	        monkey_id: monkey.session.id,
	        members: members.join(),
	        info: groupInfo,
	        group_id: optionalId,
	        push_all_members: optionalPush }, function (err, respObj) {

	        if (err) {
	            console.log("Monkey - error creating group: " + err);
	            return callback(err);
	        }
	        console.log("Monkey - Success creating group" + respObj.data.group_id);

	        return callback(null, respObj.data);
	    });
	}

	function addMemberToGroup(groupId, newMemberId, optionalPushNewMember, optionalPushExistingMembers, callback) {

	    basicAjaxRequest("POST", "/group/addmember", {
	        monkey_id: monkey.session.id,
	        new_member: newMemberId,
	        group_id: groupId,
	        push_new_member: optionalPushNewMember,
	        push_all_members: optionalPushExistingMembers }, function (err, respObj) {

	        if (err) {
	            console.log("Monkey - error adding member: " + err);
	            return callback(err);
	        }

	        return callback(null, respObj.data);
	    });
	}

	function removeMemberFromGroup(groupId, memberId, callback) {

	    basicAjaxRequest("POST", "/group/delete", { monkey_id: memberId, group_id: groupId }, function (err, respObj) {

	        if (err) {
	            console.log("Monkey - error removing member: " + err);
	            return callback(err);
	        }

	        return callback(null, respObj.data);
	    });
	}

	function getInfoById(monkeyId, callback) {
	    var endpoint = "/info/" + monkeyId;

	    //check if it's a group
	    if (monkeyId.indexOf("G:") > -1) {
	        endpoint = "/group" + endpoint;
	    } else {
	        endpoint = "/user" + endpoint;
	    }

	    basicAjaxRequest("GET", endpoint, {}, function (err, respObj) {

	        if (err) {
	            console.log("Monkey - error get info: " + err);
	            return callback(err);
	        }

	        return callback(null, respObj.data);
	    });
	}

	/*
	    SECURITY
	 */
	function getAESkeyFromUser(monkeyId, pendingMessage, callback) {
	    basicAjaxRequest("POST", "/user/key/exchange", { monkey_id: monkey.session.id, user_to: monkeyId }, function (err, respObj) {
	        if (err) {
	            console.log("Monkey - error on getting aes keys " + err);
	            return;
	        }

	        console.log("Monkey - Received new aes keys");
	        var newParamKeys = aesDecrypt(respObj.data.convKey, monkey.session.id).split(":");
	        var newAESkey = newParamKeys[0];
	        var newIv = newParamKeys[1];

	        var currentParamKeys = monkey.keyStore[respObj.data.session_to];

	        monkey.keyStore[respObj.data.session_to] = { key: newParamKeys[0], iv: newParamKeys[1] };

	        if (typeof currentParamKeys == "undefined") {
	            return callback(pendingMessage);
	        }

	        //check if it's the same key
	        if (newParamKeys[0] == currentParamKeys.key && newParamKeys[1] == currentParamKeys.iv) {
	            requestEncryptedTextForMessage(pendingMessage, function (decryptedMessage) {
	                callback(decryptedMessage);
	            });
	        } else {
	            //it's a new key
	            callback(pendingMessage);
	        }
	    });
	}

	function requestEncryptedTextForMessage(message, callback) {
	    basicAjaxRequest("GET", "/message/" + message.id + "/open/secure", {}, function (err, respObj) {
	        if (err) {
	            console.log("Monkey - error on requestEncryptedTextForMessage: " + err);
	            return callback(null);
	        }

	        console.log(respObj);
	        message.encryptedText = respObj.data.message;
	        message.encryptedText = aesDecrypt(message.encryptedText, monkey.session.id);
	        if (message.encryptedText == null) {
	            if (message.id > 0) {
	                monkey.lastTimestamp = message.datetimeCreation;
	                monkey.lastMessageId = message.id;
	            }
	            return callback(null);
	        }
	        message.encryptedText = message.text;
	        message.setEncrypted(false);
	        return callback(message);
	    });
	}

	function aesDecryptIncomingMessage(message) {
	    return aesDecrypt(message.encryptedText, message.senderId);
	}

	function aesDecrypt(dataToDecrypt, monkeyId) {
	    var aesObj = monkey.keyStore[monkeyId];
	    var aesKey = CryptoJS.enc.Base64.parse(aesObj.key);
	    var initV = CryptoJS.enc.Base64.parse(aesObj.iv);
	    var cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(dataToDecrypt) });
	    var decrypted = CryptoJS.AES.decrypt(cipherParams, aesKey, { iv: initV }).toString(CryptoJS.enc.Utf8);

	    return decrypted;
	}

	function decryptFile(fileToDecrypt, monkeyId) {

	    var aesObj = monkey.keyStore[monkeyId];

	    var aesKey = CryptoJS.enc.Base64.parse(aesObj.key);
	    var initV = CryptoJS.enc.Base64.parse(aesObj.iv);

	    var decrypted = CryptoJS.AES.decrypt(fileToDecrypt, aesKey, { iv: initV }).toString(CryptoJS.enc.Base64);

	    // console.log('el tipo del archivo decriptado: '+ typeof(decrypted));

	    return decrypted;
	}

	function aesEncrypt(dataToEncrypt, monkeyId) {

	    var aesObj = monkey.keyStore[monkeyId];
	    var aesKey = CryptoJS.enc.Base64.parse(aesObj.key);
	    var initV = CryptoJS.enc.Base64.parse(aesObj.iv);

	    var encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, aesKey, { iv: initV });

	    return encryptedData.toString();
	}

	function compress(fileData) {
	    var binData = mok_convertDataURIToBinary(fileData);
	    var gzip = new Zlib.Gzip(binData);
	    var compressedBinary = gzip.compress(); //descompress
	    // Uint8Array to base64
	    var compressedArray = new Uint8Array(compressedBinary);
	    var compressedBase64 = mok_arrayBufferToBase64(compressedArray);

	    //this should be added by client 'data:image/png;base64'
	    return compressedBase64;
	}

	function decompress(fileData) {
	    var binData = mok_convertDataURIToBinary(fileData);
	    var gunzip = new Zlib.Gunzip(binData);
	    var decompressedBinary = gunzip.decompress(); //descompress
	    // Uint8Array to base64
	    var decompressedArray = new Uint8Array(decompressedBinary);
	    var decompressedBase64 = mok_arrayBufferToBase64(decompressedArray);

	    //this should be added by client 'data:image/png;base64'
	    return decompressedBase64;
	}

	/*
	    TO BE DETERMINED
	 */

	function generateTemporalId() {
	    return Math.round(new Date().getTime() / 1000 * -1);
	}

	function mok_convertDataURIToBinary(dataURI) {
	    var raw = window.atob(dataURI);
	    var rawLength = raw.length;
	    var array = new Uint8Array(new ArrayBuffer(rawLength));

	    for (var i = 0; i < rawLength; i++) {
	        array[i] = raw.charCodeAt(i);
	    }
	    return array;
	}
	function mok_arrayBufferToBase64(buffer) {
	    var binary = '';
	    var bytes = new Uint8Array(buffer);
	    var len = bytes.byteLength;
	    for (var i = 0; i < len; i++) {
	        binary += String.fromCharCode(bytes[i]);
	    }
	    return window.btoa(binary);
	}
	function mok_getFileExtension(fileName) {
	    var arr = fileName.split('.');
	    var extension = arr[arr.length - 1];

	    return extension;
	}

	function cleanFilePrefix(fileData) {
	    var cleanFileData = fileData;

	    //check for possible ;base64,
	    if (fileData.indexOf(",") > -1) {
	        cleanFileData = fileData.slice(fileData.indexOf(",") + 1);
	    }

	    return cleanFileData;
	}
	/*
	    ARGS:{
	        rid .- recipient monkey id 
	        msg .- message text to send
	        params. JSON object with encr==1 if encrypted, eph=1 if ephemeral, compr:gzip
	        type .- 1 messsage, 2 files, 3 temporal notes, 4 notifications, 5 alerts
	    }
	    
	    params:{
	        encr:1,

	    }
	*/

	function sendMessage(text, recipientMonkeyId, optionalParams, optionalPush) {
	    var props = {
	        device: "web",
	        encr: 0
	    };

	    return sendText(MOKMessageProtocolCommand.MESSAGE, text, recipientMonkeyId, props, optionalParams, optionalPush);
	}

	function sendEncryptedMessage(text, recipientMonkeyId, optionalParams, optionalPush) {
	    var props = {
	        device: "web",
	        encr: 1
	    };

	    return sendText(MOKMessageProtocolCommand.MESSAGE, text, recipientMonkeyId, props, optionalParams, optionalPush);
	}

	function sendText(cmd, text, recipientMonkeyId, props, optionalParams, optionalPush) {

	    var args = prepareMessageArgs(recipientMonkeyId, props, optionalParams, optionalPush);
	    args.msg = text;
	    args.type = MOKMessageType.TEXT;

	    var message = new _MOKMessage2.default(cmd, args);

	    args.id = message.id;
	    args.oldId = message.oldId;

	    if (message.isEncrypted()) {
	        message.encryptedText = aesEncrypt(text, monkey.session.id);
	        args.msg = message.encryptedText;
	    }

	    sendCommand(cmd, args);

	    return message;
	}

	function sendNotification(recipientMonkeyId, optionalParams, optionalPush) {
	    var props = {
	        device: "web"
	    };

	    var args = prepareMessageArgs(recipientMonkeyId, props, optionalParams, optionalPush);
	    args.type = MOKMessageType.NOTIF;

	    var message = new _MOKMessage2.default(MOKMessageProtocolCommand.MESSAGE, args);

	    args.id = message.id;
	    args.oldId = message.oldId;

	    sendCommand(MOKMessageProtocolCommand.MESSAGE, args);

	    return message;
	}

	function prepareMessageArgs(recipientMonkeyId, props, optionalParams, optionalPush) {
	    var args = {
	        app_id: monkey.appKey,
	        sid: monkey.session.id,
	        rid: recipientMonkeyId,
	        props: JSON.stringify(props),
	        params: JSON.stringify(optionalParams)
	    };

	    switch (typeof optionalPush === "undefined" ? "undefined" : _typeof(optionalPush)) {
	        case "object":
	            {
	                if (optionalPush == null) {
	                    optionalPush = {};
	                }
	                break;
	            }
	        case "string":
	            {
	                optionalPush = generateStandardPush(optionalPush);
	                break;
	            }
	        default:
	            optionalPush = {};
	            break;
	    }

	    args["push"] = JSON.stringify(optionalPush);

	    return args;
	}

	function publish(text, channelName, optionalParams) {
	    var props = {
	        device: "web",
	        encr: 0
	    };

	    return sendText(MOKMessageProtocolCommand.PUBLISH, text, channelName, props, optionalParams);
	}

	function sendFile(data, recipientMonkeyId, fileName, mimeType, fileType, shouldCompress, optionalParams, optionalPush, callback) {
	    var props = {
	        device: "web",
	        encr: 0,
	        file_type: fileType,
	        ext: mok_getFileExtension(fileName),
	        filename: fileName
	    };

	    if (shouldCompress) {
	        props.cmpr = "gzip";
	    }

	    if (mimeType) {
	        props.mime_type = mimeType;
	    }

	    return uploadFile(data, recipientMonkeyId, fileName, props, optionalParams, function (error, message) {
	        if (error) {
	            callback(error, message);
	        }

	        callback(null, message);
	    });
	}

	function sendEncryptedFile(data, recipientMonkeyId, fileName, mimeType, fileType, shouldCompress, optionalParams, optionalPush, callback) {
	    var props = {
	        device: "web",
	        encr: 1,
	        file_type: fileType,
	        ext: mok_getFileExtension(fileName),
	        filename: fileName
	    };

	    if (shouldCompress) {
	        props.cmpr = "gzip";
	    }

	    if (mimeType) {
	        props.mime_type = mimeType;
	    }

	    return uploadFile(data, recipientMonkeyId, fileName, props, optionalParams, optionalPush, function (error, message) {
	        if (error) {
	            callback(error, message);
	        }

	        callback(null, message);
	    });
	}

	function uploadFile(fileData, recipientMonkeyId, fileName, props, optionalParams, optionalPush, callback) {

	    fileData = cleanFilePrefix(fileData);

	    var binData = mok_convertDataURIToBinary(fileData);
	    props.size = binData.size;

	    var args = prepareMessageArgs(recipientMonkeyId, props, optionalParams, optionalPush);
	    args.msg = fileName;
	    args.type = MOKMessageType.FILE;

	    var message = new _MOKMessage2.default(MOKMessageProtocolCommand.MESSAGE, args);

	    args.id = message.id;
	    args.oldId = message.oldId;
	    args.props = message.props;
	    args.params = message.params;

	    if (message.isCompressed()) {
	        fileData = compress(fileData);
	    }

	    if (message.isEncrypted()) {
	        fileData = aesEncrypt(fileData, monkey.session.id);
	    }

	    var fileToSend = new Blob([fileData.toString()], { type: message.props.file_type });
	    fileToSend.name = fileName;

	    var basic = getAuthParamsBtoA(monkey.appKey + ":" + monkey.secretKey);

	    var data = new FormData();
	    //agrega el archivo y la info al form
	    data.append("file", fileToSend);
	    data.append("data", JSON.stringify(args));

	    //setup request url
	    var reqUrl = monkey.domainUrl + "/file/new/base64";
	    if (monkey.debugingMode) {
	        //no ssl
	        reqUrl = "http://" + reqUrl;
	    } else {
	        reqUrl = "https://" + reqUrl;
	    }

	    $.ajax({
	        url: reqUrl,
	        type: "POST",
	        data: data,
	        cache: false,
	        dataType: "json",
	        processData: false,
	        contentType: false,

	        beforeSend: function beforeSend(xhr) {
	            xhr.setRequestHeader('Accept', '*/*');
	            xhr.setRequestHeader("Authorization", "Basic " + basic);
	        },
	        success: function success(respObj) {
	            console.log('Monkey - upload file OK');
	            message.id = respObj.data.messageId;
	            callback(null, message);
	        }, error: function error(errorMSg) {

	            console.log('Monkey - upload file Fail');
	            callback(errorMSg.toString(), message);
	        }
	    });

	    return message;
	}
	function getAllConversations(onComplete) {

	    var basic = getAuthParamsBtoA(monkey.appKey + ":" + monkey.secretKey);

	    //setup request url
	    var reqUrl = monkey.domainUrl + "/user/" + monkey.session.id + "/conversations";
	    if (monkey.debugingMode) {
	        //no ssl
	        reqUrl = "http://" + reqUrl;
	    } else {
	        reqUrl = "https://" + reqUrl;
	    }

	    $.ajax({
	        type: "GET",
	        url: reqUrl,
	        xhrFields: { withCredentials: true },
	        beforeSend: function beforeSend(xhr) {
	            xhr.setRequestHeader('Accept', '*/*');
	            xhr.setRequestHeader("Authorization", "Basic " + basic);
	        },
	        success: function success(respObj) {
	            console.log("GET ALL CONVERSATIONS");
	            onComplete(respObj);
	        },
	        error: function error(err) {
	            console.log('FAIL TO GET ALL CONVERSATIONS');
	            onComplete(null, err.toString());
	        }
	    }); // end of AJAX CALL
	}

	function getConversationMessages(conversationId, numberOfMessages, lastMessageId, onComplete) {

	    if (lastMessageId == null) {
	        lastMessageId = "";
	    }
	    var basic = getAuthParamsBtoA(monkey.appKey + ":" + monkey.secretKey);

	    //setup request url
	    var reqUrl = monkey.domainUrl + "/conversation/messages/" + monkey.session.id + "/" + conversationId + "/" + numberOfMessages + "/" + lastMessageId;
	    if (monkey.debugingMode) {
	        //no ssl
	        reqUrl = "http://" + reqUrl;
	    } else {
	        reqUrl = "https://" + reqUrl;
	    }

	    $.ajax({
	        type: "GET",
	        url: reqUrl,
	        xhrFields: { withCredentials: true },
	        beforeSend: function beforeSend(xhr) {
	            xhr.setRequestHeader('Accept', '*/*');
	            xhr.setRequestHeader("Authorization", "Basic " + basic);
	        },
	        success: function success(respObj) {
	            console.log("GET CONVERSATION MESSAGES");

	            var messages = respObj.data.messages;
	            var messagesArray = [];
	            for (var i = messages.length - 1; i >= 0; i--) {
	                var msg = new _MOKMessage2.default(MOKMessageProtocolCommand.MESSAGE, messages[i]);
	                messagesArray.push(msg);
	            }

	            //TODO: decrypt bulk messages and send to callback
	            decryptBulkMessages(messagesArray, [], function (decryptedMessages) {
	                onComplete(null, decryptedMessages);
	            });
	        },
	        error: function error(err) {
	            console.log('FAIL TO GET CONVERSATION MESSAGES');
	            onComplete(err);
	        }
	    }); // end of AJAX CALL
	}

	//recursive function
	function decryptBulkMessages(messages, decryptedMessages, onComplete) {

	    if (!(typeof messages != "undefined" && messages != null && messages.length > 0)) {
	        return onComplete(decryptedMessages);
	    }

	    var message = messages.shift();

	    if (message.isEncrypted() && message.protocolType != MOKMessageType.FILE) {
	        try {
	            message.text = aesDecryptIncomingMessage(message);
	        } catch (error) {
	            console.log("===========================");
	            console.log("MONKEY - Fail decrypting: " + message.id + " type: " + message.protocolType);
	            console.log("===========================");
	            //get keys
	            getAESkeyFromUser(message.senderId, message, function (response) {
	                if (response != null) {
	                    messages.unshift(message);
	                }

	                decryptBulkMessages(messages, decryptedMessages, onComplete);
	            });
	            return;
	        }

	        if (message.text == null) {
	            //get keys
	            getAESkeyFromUser(message.senderId, message, function (response) {
	                if (response != null) {
	                    messages.unshift(message);
	                }

	                decryptBulkMessages(message, decryptedMessages, onComplete);
	            });
	            return;
	        }
	    } else {
	        message.text = message.encryptedText;
	    }

	    decryptedMessages.push(message);

	    decryptBulkMessages(messages, decryptedMessages, onComplete);
	}

	function getMessagesSince(timestamp, onComplete) {

	    var basic = getAuthParamsBtoA(monkey.appKey + ":" + monkey.secretKey);

	    //setup request url
	    var reqUrl = monkey.domainUrl + "/user/" + monkey.session.id + "/messages/" + timestamp;
	    if (monkey.debugingMode) {
	        //no ssl
	        reqUrl = "http://" + reqUrl;
	    } else {
	        reqUrl = "https://" + reqUrl;
	    }

	    $.ajax({
	        type: "GET",
	        url: reqUrl,
	        xhrFields: { withCredentials: true },
	        beforeSend: function beforeSend(xhr) {
	            xhr.setRequestHeader('Accept', '*/*');
	            xhr.setRequestHeader("Authorization", "Basic " + basic);
	        },
	        success: function success(respObj) {
	            console.log("GET MESSAGES");
	            onComplete(respObj);
	        },
	        error: function error(err) {
	            console.log('FAIL TO GET MESSAGES');
	            onComplete(null, err.toString());
	        }
	    }); // end of AJAX CALL
	}

	function generateStandardPush(stringMessage) {
	    return {
	        "text": stringMessage,
	        "iosData": {
	            "alert": stringMessage,
	            "sound": "default"
	        },
	        "andData": {
	            "alert": stringMessage
	        }
	    };
	}

	/*
	locKey = string,
	locArgs = array
	 */
	function generateLocalizedPush(locKey, locArgs, defaultText, sound) {
	    var localizedPush = {
	        "iosData": {
	            "alert": {
	                "loc-key": locKey,
	                "loc-args": locArgs
	            },
	            "sound": sound ? sound : "default"
	        },
	        "andData": {
	            "loc-key": locKey,
	            "loc-args": locArgs
	        }
	    };

	    if (defaultText) {
	        localizedPush.text = defaultText;
	    }

	    return localizedPush;
	}
	function getExtention(filename) {
	    var arr = filename.split('.');
	    var extension = arr[arr.length - 1];

	    return extension;
	}
	function downloadFile(message, onComplete) {

	    var basic = getAuthParamsBtoA(monkey.appKey + ":" + monkey.secretKey);

	    //setup request url
	    var reqUrl = monkey.domainUrl + "/file/open/" + message.text + "/base64";
	    if (monkey.debugingMode) {
	        //no ssl
	        reqUrl = "http://" + reqUrl;
	    } else {
	        reqUrl = "https://" + reqUrl;
	    }

	    $.ajax({
	        type: "GET",
	        url: reqUrl,
	        xhrFields: { withCredentials: true },
	        beforeSend: function beforeSend(xhr) {
	            xhr.setRequestHeader('Accept', '*/*');
	            xhr.setRequestHeader("Authorization", "Basic " + basic);
	        },
	        success: function success(fileData) {
	            console.log("Monkey - Download File OK");

	            decryptDownloadedFile(fileData, message, function (error, finalData) {
	                if (error) {
	                    console.log("Monkey - Fail to decrypt downloaded file");
	                    return onComplete(error);
	                }
	                onComplete(null, finalData);
	            });

	            // fileCont = monkey.decryptFile(respObj, sid);
	            // var gunzip = new Zlib.Gunzip(fileCont);
	            // var resp = gunzip.decompress(); //this is not working
	            //drawImageMessageBubble(btoa(String.fromCharCode.apply(null, fileCont)),sid,fileName);
	        },
	        error: function error(err) {
	            console.log('Monkey - Download File Fail');
	            onComplete(err);
	        }
	    }); // end of AJAX CALL
	} /// end of function downloadFile

	function decryptDownloadedFile(fileData, message, callback) {
	    if (message.isEncrypted()) {
	        var decryptedData = null;
	        try {
	            var currentSize = fileData.length;
	            console.log("Monkey - encrypted file size: " + currentSize);

	            //temporal fix for media sent from web
	            if (message.props.device == "web") {
	                decryptedData = aesDecrypt(fileData, message.senderId);
	            } else {
	                decryptedData = decryptFile(fileData, message.senderId);
	            }

	            var newSize = decryptedData.length;
	            console.log("Monkey - decrypted file size: " + newSize);

	            if (currentSize == newSize) {
	                getAESkeyFromUser(message.senderId, message, function (response) {
	                    if (response != null) {
	                        decryptDownloadedFile(fileData, message, callback);
	                    } else {
	                        callback("Error decrypting downloaded file");
	                    }
	                });
	                return;
	            }
	        } catch (error) {
	            console.log("===========================");
	            console.log("MONKEY - Fail decrypting: " + message.id + " type: " + message.protocolType);
	            console.log("===========================");
	            //get keys
	            getAESkeyFromUser(message.senderId, message, function (response) {
	                if (response != null) {
	                    decryptDownloadedFile(fileData, message, callback);
	                } else {
	                    callback("Error decrypting downloaded file");
	                }
	            });
	            return;
	        }

	        if (decryptedData == null) {
	            //get keys
	            getAESkeyFromUser(message.senderId, message, function (response) {
	                if (response != null) {
	                    decryptDownloadedFile(fileData, message, callback);
	                } else {
	                    callback("Error decrypting downloaded file");
	                }
	            });
	            return;
	        }

	        fileData = decryptedData;
	    }

	    if (message.isCompressed()) {
	        fileData = decompress(fileData);
	    }

	    callback(null, fileData);
	}
	function postMessage(messageObj) {
	    /* {"cmd":"0","args":{"id":"-1423607192","rid":"i5zuxft2zkl3t35gjui60f6r","msg":"IX76YKyM90pXh+FL/R0cNQ=="}}*/
	    console.log("MessageObj sending " + JSON.stringify(messageObj));
	    basicAjaxRequest("POST", "/message/new", messageObj, function (err, respObj) {

	        if (err) {
	            console.log(err);
	            return;
	        }

	        if (parseInt(respObj.status) == 0) {
	            // now you can start the long polling calls or the websocket connection you are ready.
	            // we need to do a last validation here with an encrypted data that is sent from the server at this response, to validate keys are correct and the session too.
	            console.log("Message sent is " + JSON.stringify(respObj));
	            console.log("Message sent is " + respObj.data.messageId);
	        } else {
	            //throw error
	            console.log("Error in postMessage " + respObj.message);
	        }
	    });
	}

	function generateSessionKey() {
	    var key = CryptoJS.enc.Hex.parse(Generate_key(32)); //256 bits
	    var iv = CryptoJS.enc.Hex.parse(Generate_key(16)); //128 bits
	    monkey.session.myKey = btoa(key);
	    monkey.session.myIv = btoa(iv);
	    //now you have to encrypt
	    return monkey.session.myKey + ":" + monkey.session.myIv;
	}

	function Generate_key(len) {
	    var key = "";
	    var hex = "0123456789abcdef";
	    for (var i = 0; i < len; i++) {
	        key += hex.charAt(Math.floor(Math.random() * 16));
	    }
	    return key;
	}

	function generateExchangeKeys() {
	    var jsencrypt = new JSEncrypt();

	    //jsencrypt.getPublicKey()

	    monkey.session.exchangeKeys = jsencrypt;
	}

	function encryptSessionParams(sessionParams, publicKey) {
	    var jsencrypt = new JSEncrypt();
	    jsencrypt.setPublicKey(publicKey);
	    var encryptedData = jsencrypt.encrypt(sessionParams);
	    return encryptedData;
	}

	function getAuthParamsBtoA(connectAuthParamsString) {

	    //window.btoa not supported in <=IE9
	    if (window.btoa) {
	        var basic = window.btoa(connectAuthParamsString);
	    } else {
	        //for <= IE9
	        var base64 = {};
	        base64.PADCHAR = '=';
	        base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	        base64.makeDOMException = function () {
	            // sadly in FF,Safari,Chrome you can't make a DOMException
	            var e, tmp;

	            try {
	                return new DOMException(DOMException.INVALID_CHARACTER_ERR);
	            } catch (tmp) {
	                // not available, just passback a duck-typed equiv
	                // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
	                // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
	                var ex = new Error("DOM Exception 5");

	                // ex.number and ex.description is IE-specific.
	                ex.code = ex.number = 5;
	                ex.name = ex.description = "INVALID_CHARACTER_ERR";

	                // Safari/Chrome output format
	                ex.toString = function () {
	                    return 'Error: ' + ex.name + ': ' + ex.message;
	                };
	                return ex;
	            }
	        };

	        base64.getbyte64 = function (s, i) {
	            // This is oddly fast, except on Chrome/V8.
	            //  Minimal or no improvement in performance by using a
	            //   object with properties mapping chars to value (eg. 'A': 0)
	            var idx = base64.ALPHA.indexOf(s.charAt(i));
	            if (idx === -1) {
	                throw base64.makeDOMException();
	            }
	            return idx;
	        };

	        base64.decode = function (s) {
	            // convert to string
	            s = '' + s;
	            var getbyte64 = base64.getbyte64;
	            var pads, i, b10;
	            var imax = s.length;
	            if (imax === 0) {
	                return s;
	            }

	            if (imax % 4 !== 0) {
	                throw base64.makeDOMException();
	            }

	            pads = 0;
	            if (s.charAt(imax - 1) === base64.PADCHAR) {
	                pads = 1;
	                if (s.charAt(imax - 2) === base64.PADCHAR) {
	                    pads = 2;
	                }
	                // either way, we want to ignore this last block
	                imax -= 4;
	            }

	            var x = [];
	            for (i = 0; i < imax; i += 4) {
	                b10 = getbyte64(s, i) << 18 | getbyte64(s, i + 1) << 12 | getbyte64(s, i + 2) << 6 | getbyte64(s, i + 3);
	                x.push(String.fromCharCode(b10 >> 16, b10 >> 8 & 0xff, b10 & 0xff));
	            }

	            switch (pads) {
	                case 1:
	                    b10 = getbyte64(s, i) << 18 | getbyte64(s, i + 1) << 12 | getbyte64(s, i + 2) << 6;
	                    x.push(String.fromCharCode(b10 >> 16, b10 >> 8 & 0xff));
	                    break;
	                case 2:
	                    b10 = getbyte64(s, i) << 18 | getbyte64(s, i + 1) << 12;
	                    x.push(String.fromCharCode(b10 >> 16));
	                    break;
	            }
	            return x.join('');
	        };

	        base64.getbyte = function (s, i) {
	            var x = s.charCodeAt(i);
	            if (x > 255) {
	                throw base64.makeDOMException();
	            }
	            return x;
	        };

	        base64.encode = function (s) {
	            if (arguments.length !== 1) {
	                throw new SyntaxError("Not enough arguments");
	            }
	            var padchar = base64.PADCHAR;
	            var alpha = base64.ALPHA;
	            var getbyte = base64.getbyte;

	            var i, b10;
	            var x = [];

	            // convert to string
	            s = '' + s;

	            var imax = s.length - s.length % 3;

	            if (s.length === 0) {
	                return s;
	            }
	            for (i = 0; i < imax; i += 3) {
	                b10 = getbyte(s, i) << 16 | getbyte(s, i + 1) << 8 | getbyte(s, i + 2);
	                x.push(alpha.charAt(b10 >> 18));
	                x.push(alpha.charAt(b10 >> 12 & 0x3F));
	                x.push(alpha.charAt(b10 >> 6 & 0x3f));
	                x.push(alpha.charAt(b10 & 0x3f));
	            }
	            switch (s.length - imax) {
	                case 1:
	                    b10 = getbyte(s, i) << 16;
	                    x.push(alpha.charAt(b10 >> 18) + alpha.charAt(b10 >> 12 & 0x3F) + padchar + padchar);
	                    break;
	                case 2:
	                    b10 = getbyte(s, i) << 16 | getbyte(s, i + 1) << 8;
	                    x.push(alpha.charAt(b10 >> 18) + alpha.charAt(b10 >> 12 & 0x3F) + alpha.charAt(b10 >> 6 & 0x3f) + padchar);
	                    break;
	            }
	            return x.join('');
	        };
	        basic = base64.encode(connectAuthParamsString);
	    }

	    return basic;
	}

	module.exports = monkey;

	//  ===== END OF FILE

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	    Protocol Enums
	 */

	/*
	    Start Message class definition
	 */

	module.exports = function () {
	    function MOKMessage(command, args) {
	        _classCallCheck(this, MOKMessage);

	        if (args.app_id != null) {
	            this.app_id = args.app_id;
	        }
	        this.protocolCommand = command;
	        this.protocolType = parseInt(args.type);

	        this.senderId = args.sid;
	        this.recipientId = args.rid;

	        this.datetimeOrder = this.getCurrentTimestamp();
	        this.datetimeCreation = args.datetime == null ? this.datetimeOrder : args.datetime;

	        this.readByUser = false;

	        //parse props
	        if (args.props != null && typeof args.props != "undefined" && args.props != "") {
	            if (typeof args.props === "string") {
	                this.props = JSON.parse(args.props);
	            } else {
	                this.props = args.props;
	            }
	        } else {
	            this.props = { encr: 0 };
	        }

	        //parse params
	        if (args.params != null && args.params != "" && typeof args.params != "undefined") {
	            if (typeof args.params === "string") {
	                this.params = JSON.parse(args.params);
	            } else {
	                this.params = args.params;
	            }
	        }

	        //parse message id
	        if (args.id == null) {
	            //didn't come from the socket
	            this.id = this.generateRandomMessageId();
	            this.oldId = this.id;

	            this.props.old_id = this.id;
	        } else {
	            //it came from the socket
	            this.id = args.id;
	            this.oldId = this.props.old_id;
	        }

	        this.encryptedText = args.msg;
	        this.text = args.msg;

	        switch (command) {
	            case 205:
	                {
	                    this.buildAcknowledge(this.props);
	                    break;
	                }
	            default:
	                {
	                    break;
	                }
	        }
	    }

	    _createClass(MOKMessage, [{
	        key: "generateRandomMessageId",
	        value: function generateRandomMessageId() {
	            return Math.round(new Date().getTime() / 1000 * -1) + Math.random().toString(36).substring(14);
	        }
	    }, {
	        key: "getCurrentTimestamp",
	        value: function getCurrentTimestamp() {
	            return new Date().getTime() / 1000;
	        }
	    }, {
	        key: "buildAcknowledge",
	        value: function buildAcknowledge(props) {
	            if (typeof props.message_id != "undefined" || props.message_id != null) {
	                this.id = props.message_id;
	            }
	            if (typeof props.new_id != "undefined" || props.new_id != null) {
	                this.id = props.new_id;
	            }
	            if (typeof props.old_id != "undefined" || props.old_id != null) {
	                this.oldId = props.old_id;
	            }
	        }
	    }, {
	        key: "compressionMethod",
	        value: function compressionMethod() {
	            if (this.isCompressed) {
	                return this.props.cmpr;
	            }
	            return null;
	        }
	    }, {
	        key: "isCompressed",
	        value: function isCompressed() {
	            if (this.props == null || typeof this.props.cmpr == "undefined" || this.props.cmpr == null) {
	                console.log("MONKEY - props null");
	                return false;
	            }
	            return this.props.cmpr ? true : false;
	        }
	    }, {
	        key: "isEncrypted",
	        value: function isEncrypted() {
	            if (this.props == null || typeof this.props.encr == "undefined" || this.props.encr == null) {
	                console.log("MONKEY - props null");
	                return false;
	            }
	            return this.props.encr == 1 ? true : false;
	        }
	    }]);

	    return MOKMessage;
	}();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3)(__webpack_require__(4))

/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function(src) {
		if (typeof execScript === "function")
			execScript(src);
		else
			eval.call(null, src);
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = "var JSEncryptExports = {};\n(function(exports) {\nfunction BigInteger(a,b,c){null!=a&&(\"number\"==typeof a?this.fromNumber(a,b,c):null==b&&\"string\"!=typeof a?this.fromString(a,256):this.fromString(a,b))}function nbi(){return new BigInteger(null)}function am1(a,b,c,d,e,f){for(;--f>=0;){var g=b*this[a++]+c[d]+e;e=Math.floor(g/67108864),c[d++]=67108863&g}return e}function am2(a,b,c,d,e,f){for(var g=32767&b,h=b>>15;--f>=0;){var i=32767&this[a],j=this[a++]>>15,k=h*i+j*g;i=g*i+((32767&k)<<15)+c[d]+(1073741823&e),e=(i>>>30)+(k>>>15)+h*j+(e>>>30),c[d++]=1073741823&i}return e}function am3(a,b,c,d,e,f){for(var g=16383&b,h=b>>14;--f>=0;){var i=16383&this[a],j=this[a++]>>14,k=h*i+j*g;i=g*i+((16383&k)<<14)+c[d]+e,e=(i>>28)+(k>>14)+h*j,c[d++]=268435455&i}return e}function int2char(a){return BI_RM.charAt(a)}function intAt(a,b){var c=BI_RC[a.charCodeAt(b)];return null==c?-1:c}function bnpCopyTo(a){for(var b=this.t-1;b>=0;--b)a[b]=this[b];a.t=this.t,a.s=this.s}function bnpFromInt(a){this.t=1,this.s=0>a?-1:0,a>0?this[0]=a:-1>a?this[0]=a+DV:this.t=0}function nbv(a){var b=nbi();return b.fromInt(a),b}function bnpFromString(a,b){var c;if(16==b)c=4;else if(8==b)c=3;else if(256==b)c=8;else if(2==b)c=1;else if(32==b)c=5;else{if(4!=b)return void this.fromRadix(a,b);c=2}this.t=0,this.s=0;for(var d=a.length,e=!1,f=0;--d>=0;){var g=8==c?255&a[d]:intAt(a,d);0>g?\"-\"==a.charAt(d)&&(e=!0):(e=!1,0==f?this[this.t++]=g:f+c>this.DB?(this[this.t-1]|=(g&(1<<this.DB-f)-1)<<f,this[this.t++]=g>>this.DB-f):this[this.t-1]|=g<<f,f+=c,f>=this.DB&&(f-=this.DB))}8==c&&0!=(128&a[0])&&(this.s=-1,f>0&&(this[this.t-1]|=(1<<this.DB-f)-1<<f)),this.clamp(),e&&BigInteger.ZERO.subTo(this,this)}function bnpClamp(){for(var a=this.s&this.DM;this.t>0&&this[this.t-1]==a;)--this.t}function bnToString(a){if(this.s<0)return\"-\"+this.negate().toString(a);var b;if(16==a)b=4;else if(8==a)b=3;else if(2==a)b=1;else if(32==a)b=5;else{if(4!=a)return this.toRadix(a);b=2}var c,d=(1<<b)-1,e=!1,f=\"\",g=this.t,h=this.DB-g*this.DB%b;if(g-->0)for(h<this.DB&&(c=this[g]>>h)>0&&(e=!0,f=int2char(c));g>=0;)b>h?(c=(this[g]&(1<<h)-1)<<b-h,c|=this[--g]>>(h+=this.DB-b)):(c=this[g]>>(h-=b)&d,0>=h&&(h+=this.DB,--g)),c>0&&(e=!0),e&&(f+=int2char(c));return e?f:\"0\"}function bnNegate(){var a=nbi();return BigInteger.ZERO.subTo(this,a),a}function bnAbs(){return this.s<0?this.negate():this}function bnCompareTo(a){var b=this.s-a.s;if(0!=b)return b;var c=this.t;if(b=c-a.t,0!=b)return this.s<0?-b:b;for(;--c>=0;)if(0!=(b=this[c]-a[c]))return b;return 0}function nbits(a){var b,c=1;return 0!=(b=a>>>16)&&(a=b,c+=16),0!=(b=a>>8)&&(a=b,c+=8),0!=(b=a>>4)&&(a=b,c+=4),0!=(b=a>>2)&&(a=b,c+=2),0!=(b=a>>1)&&(a=b,c+=1),c}function bnBitLength(){return this.t<=0?0:this.DB*(this.t-1)+nbits(this[this.t-1]^this.s&this.DM)}function bnpDLShiftTo(a,b){var c;for(c=this.t-1;c>=0;--c)b[c+a]=this[c];for(c=a-1;c>=0;--c)b[c]=0;b.t=this.t+a,b.s=this.s}function bnpDRShiftTo(a,b){for(var c=a;c<this.t;++c)b[c-a]=this[c];b.t=Math.max(this.t-a,0),b.s=this.s}function bnpLShiftTo(a,b){var c,d=a%this.DB,e=this.DB-d,f=(1<<e)-1,g=Math.floor(a/this.DB),h=this.s<<d&this.DM;for(c=this.t-1;c>=0;--c)b[c+g+1]=this[c]>>e|h,h=(this[c]&f)<<d;for(c=g-1;c>=0;--c)b[c]=0;b[g]=h,b.t=this.t+g+1,b.s=this.s,b.clamp()}function bnpRShiftTo(a,b){b.s=this.s;var c=Math.floor(a/this.DB);if(c>=this.t)return void(b.t=0);var d=a%this.DB,e=this.DB-d,f=(1<<d)-1;b[0]=this[c]>>d;for(var g=c+1;g<this.t;++g)b[g-c-1]|=(this[g]&f)<<e,b[g-c]=this[g]>>d;d>0&&(b[this.t-c-1]|=(this.s&f)<<e),b.t=this.t-c,b.clamp()}function bnpSubTo(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);e>c;)d+=this[c]-a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d-=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d-=a[c],b[c++]=d&this.DM,d>>=this.DB;d-=a.s}b.s=0>d?-1:0,-1>d?b[c++]=this.DV+d:d>0&&(b[c++]=d),b.t=c,b.clamp()}function bnpMultiplyTo(a,b){var c=this.abs(),d=a.abs(),e=c.t;for(b.t=e+d.t;--e>=0;)b[e]=0;for(e=0;e<d.t;++e)b[e+c.t]=c.am(0,d[e],b,e,0,c.t);b.s=0,b.clamp(),this.s!=a.s&&BigInteger.ZERO.subTo(b,b)}function bnpSquareTo(a){for(var b=this.abs(),c=a.t=2*b.t;--c>=0;)a[c]=0;for(c=0;c<b.t-1;++c){var d=b.am(c,b[c],a,2*c,0,1);(a[c+b.t]+=b.am(c+1,2*b[c],a,2*c+1,d,b.t-c-1))>=b.DV&&(a[c+b.t]-=b.DV,a[c+b.t+1]=1)}a.t>0&&(a[a.t-1]+=b.am(c,b[c],a,2*c,0,1)),a.s=0,a.clamp()}function bnpDivRemTo(a,b,c){var d=a.abs();if(!(d.t<=0)){var e=this.abs();if(e.t<d.t)return null!=b&&b.fromInt(0),void(null!=c&&this.copyTo(c));null==c&&(c=nbi());var f=nbi(),g=this.s,h=a.s,i=this.DB-nbits(d[d.t-1]);i>0?(d.lShiftTo(i,f),e.lShiftTo(i,c)):(d.copyTo(f),e.copyTo(c));var j=f.t,k=f[j-1];if(0!=k){var l=k*(1<<this.F1)+(j>1?f[j-2]>>this.F2:0),m=this.FV/l,n=(1<<this.F1)/l,o=1<<this.F2,p=c.t,q=p-j,r=null==b?nbi():b;for(f.dlShiftTo(q,r),c.compareTo(r)>=0&&(c[c.t++]=1,c.subTo(r,c)),BigInteger.ONE.dlShiftTo(j,r),r.subTo(f,f);f.t<j;)f[f.t++]=0;for(;--q>=0;){var s=c[--p]==k?this.DM:Math.floor(c[p]*m+(c[p-1]+o)*n);if((c[p]+=f.am(0,s,c,q,0,j))<s)for(f.dlShiftTo(q,r),c.subTo(r,c);c[p]<--s;)c.subTo(r,c)}null!=b&&(c.drShiftTo(j,b),g!=h&&BigInteger.ZERO.subTo(b,b)),c.t=j,c.clamp(),i>0&&c.rShiftTo(i,c),0>g&&BigInteger.ZERO.subTo(c,c)}}}function bnMod(a){var b=nbi();return this.abs().divRemTo(a,null,b),this.s<0&&b.compareTo(BigInteger.ZERO)>0&&a.subTo(b,b),b}function Classic(a){this.m=a}function cConvert(a){return a.s<0||a.compareTo(this.m)>=0?a.mod(this.m):a}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a)}function cMulTo(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function cSqrTo(a,b){a.squareTo(b),this.reduce(b)}function bnpInvDigit(){if(this.t<1)return 0;var a=this[0];if(0==(1&a))return 0;var b=3&a;return b=b*(2-(15&a)*b)&15,b=b*(2-(255&a)*b)&255,b=b*(2-((65535&a)*b&65535))&65535,b=b*(2-a*b%this.DV)%this.DV,b>0?this.DV-b:-b}function Montgomery(a){this.m=a,this.mp=a.invDigit(),this.mpl=32767&this.mp,this.mph=this.mp>>15,this.um=(1<<a.DB-15)-1,this.mt2=2*a.t}function montConvert(a){var b=nbi();return a.abs().dlShiftTo(this.m.t,b),b.divRemTo(this.m,null,b),a.s<0&&b.compareTo(BigInteger.ZERO)>0&&this.m.subTo(b,b),b}function montRevert(a){var b=nbi();return a.copyTo(b),this.reduce(b),b}function montReduce(a){for(;a.t<=this.mt2;)a[a.t++]=0;for(var b=0;b<this.m.t;++b){var c=32767&a[b],d=c*this.mpl+((c*this.mph+(a[b]>>15)*this.mpl&this.um)<<15)&a.DM;for(c=b+this.m.t,a[c]+=this.m.am(0,d,a,b,0,this.m.t);a[c]>=a.DV;)a[c]-=a.DV,a[++c]++}a.clamp(),a.drShiftTo(this.m.t,a),a.compareTo(this.m)>=0&&a.subTo(this.m,a)}function montSqrTo(a,b){a.squareTo(b),this.reduce(b)}function montMulTo(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function bnpIsEven(){return 0==(this.t>0?1&this[0]:this.s)}function bnpExp(a,b){if(a>4294967295||1>a)return BigInteger.ONE;var c=nbi(),d=nbi(),e=b.convert(this),f=nbits(a)-1;for(e.copyTo(c);--f>=0;)if(b.sqrTo(c,d),(a&1<<f)>0)b.mulTo(d,e,c);else{var g=c;c=d,d=g}return b.revert(c)}function bnModPowInt(a,b){var c;return c=256>a||b.isEven()?new Classic(b):new Montgomery(b),this.exp(a,c)}function bnClone(){var a=nbi();return this.copyTo(a),a}function bnIntValue(){if(this.s<0){if(1==this.t)return this[0]-this.DV;if(0==this.t)return-1}else{if(1==this.t)return this[0];if(0==this.t)return 0}return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]}function bnByteValue(){return 0==this.t?this.s:this[0]<<24>>24}function bnShortValue(){return 0==this.t?this.s:this[0]<<16>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){return this.s<0?-1:this.t<=0||1==this.t&&this[0]<=0?0:1}function bnpToRadix(a){if(null==a&&(a=10),0==this.signum()||2>a||a>36)return\"0\";var b=this.chunkSize(a),c=Math.pow(a,b),d=nbv(c),e=nbi(),f=nbi(),g=\"\";for(this.divRemTo(d,e,f);e.signum()>0;)g=(c+f.intValue()).toString(a).substr(1)+g,e.divRemTo(d,e,f);return f.intValue().toString(a)+g}function bnpFromRadix(a,b){this.fromInt(0),null==b&&(b=10);for(var c=this.chunkSize(b),d=Math.pow(b,c),e=!1,f=0,g=0,h=0;h<a.length;++h){var i=intAt(a,h);0>i?\"-\"==a.charAt(h)&&0==this.signum()&&(e=!0):(g=b*g+i,++f>=c&&(this.dMultiply(d),this.dAddOffset(g,0),f=0,g=0))}f>0&&(this.dMultiply(Math.pow(b,f)),this.dAddOffset(g,0)),e&&BigInteger.ZERO.subTo(this,this)}function bnpFromNumber(a,b,c){if(\"number\"==typeof b)if(2>a)this.fromInt(1);else for(this.fromNumber(a,c),this.testBit(a-1)||this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(b);)this.dAddOffset(2,0),this.bitLength()>a&&this.subTo(BigInteger.ONE.shiftLeft(a-1),this);else{var d=new Array,e=7&a;d.length=(a>>3)+1,b.nextBytes(d),e>0?d[0]&=(1<<e)-1:d[0]=0,this.fromString(d,256)}}function bnToByteArray(){var a=this.t,b=new Array;b[0]=this.s;var c,d=this.DB-a*this.DB%8,e=0;if(a-->0)for(d<this.DB&&(c=this[a]>>d)!=(this.s&this.DM)>>d&&(b[e++]=c|this.s<<this.DB-d);a>=0;)8>d?(c=(this[a]&(1<<d)-1)<<8-d,c|=this[--a]>>(d+=this.DB-8)):(c=this[a]>>(d-=8)&255,0>=d&&(d+=this.DB,--a)),0!=(128&c)&&(c|=-256),0==e&&(128&this.s)!=(128&c)&&++e,(e>0||c!=this.s)&&(b[e++]=c);return b}function bnEquals(a){return 0==this.compareTo(a)}function bnMin(a){return this.compareTo(a)<0?this:a}function bnMax(a){return this.compareTo(a)>0?this:a}function bnpBitwiseTo(a,b,c){var d,e,f=Math.min(a.t,this.t);for(d=0;f>d;++d)c[d]=b(this[d],a[d]);if(a.t<this.t){for(e=a.s&this.DM,d=f;d<this.t;++d)c[d]=b(this[d],e);c.t=this.t}else{for(e=this.s&this.DM,d=f;d<a.t;++d)c[d]=b(e,a[d]);c.t=a.t}c.s=b(this.s,a.s),c.clamp()}function op_and(a,b){return a&b}function bnAnd(a){var b=nbi();return this.bitwiseTo(a,op_and,b),b}function op_or(a,b){return a|b}function bnOr(a){var b=nbi();return this.bitwiseTo(a,op_or,b),b}function op_xor(a,b){return a^b}function bnXor(a){var b=nbi();return this.bitwiseTo(a,op_xor,b),b}function op_andnot(a,b){return a&~b}function bnAndNot(a){var b=nbi();return this.bitwiseTo(a,op_andnot,b),b}function bnNot(){for(var a=nbi(),b=0;b<this.t;++b)a[b]=this.DM&~this[b];return a.t=this.t,a.s=~this.s,a}function bnShiftLeft(a){var b=nbi();return 0>a?this.rShiftTo(-a,b):this.lShiftTo(a,b),b}function bnShiftRight(a){var b=nbi();return 0>a?this.lShiftTo(-a,b):this.rShiftTo(a,b),b}function lbit(a){if(0==a)return-1;var b=0;return 0==(65535&a)&&(a>>=16,b+=16),0==(255&a)&&(a>>=8,b+=8),0==(15&a)&&(a>>=4,b+=4),0==(3&a)&&(a>>=2,b+=2),0==(1&a)&&++b,b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a)if(0!=this[a])return a*this.DB+lbit(this[a]);return this.s<0?this.t*this.DB:-1}function cbit(a){for(var b=0;0!=a;)a&=a-1,++b;return b}function bnBitCount(){for(var a=0,b=this.s&this.DM,c=0;c<this.t;++c)a+=cbit(this[c]^b);return a}function bnTestBit(a){var b=Math.floor(a/this.DB);return b>=this.t?0!=this.s:0!=(this[b]&1<<a%this.DB)}function bnpChangeBit(a,b){var c=BigInteger.ONE.shiftLeft(a);return this.bitwiseTo(c,b,c),c}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);e>c;)d+=this[c]+a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d+=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d+=a[c],b[c++]=d&this.DM,d>>=this.DB;d+=a.s}b.s=0>d?-1:0,d>0?b[c++]=d:-1>d&&(b[c++]=this.DV+d),b.t=c,b.clamp()}function bnAdd(a){var b=nbi();return this.addTo(a,b),b}function bnSubtract(a){var b=nbi();return this.subTo(a,b),b}function bnMultiply(a){var b=nbi();return this.multiplyTo(a,b),b}function bnSquare(){var a=nbi();return this.squareTo(a),a}function bnDivide(a){var b=nbi();return this.divRemTo(a,b,null),b}function bnRemainder(a){var b=nbi();return this.divRemTo(a,null,b),b}function bnDivideAndRemainder(a){var b=nbi(),c=nbi();return this.divRemTo(a,b,c),new Array(b,c)}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t),++this.t,this.clamp()}function bnpDAddOffset(a,b){if(0!=a){for(;this.t<=b;)this[this.t++]=0;for(this[b]+=a;this[b]>=this.DV;)this[b]-=this.DV,++b>=this.t&&(this[this.t++]=0),++this[b]}}function NullExp(){}function nNop(a){return a}function nMulTo(a,b,c){a.multiplyTo(b,c)}function nSqrTo(a,b){a.squareTo(b)}function bnPow(a){return this.exp(a,new NullExp)}function bnpMultiplyLowerTo(a,b,c){var d=Math.min(this.t+a.t,b);for(c.s=0,c.t=d;d>0;)c[--d]=0;var e;for(e=c.t-this.t;e>d;++d)c[d+this.t]=this.am(0,a[d],c,d,0,this.t);for(e=Math.min(a.t,b);e>d;++d)this.am(0,a[d],c,d,0,b-d);c.clamp()}function bnpMultiplyUpperTo(a,b,c){--b;var d=c.t=this.t+a.t-b;for(c.s=0;--d>=0;)c[d]=0;for(d=Math.max(b-this.t,0);d<a.t;++d)c[this.t+d-b]=this.am(b-d,a[d],c,0,0,this.t+d-b);c.clamp(),c.drShiftTo(1,c)}function Barrett(a){this.r2=nbi(),this.q3=nbi(),BigInteger.ONE.dlShiftTo(2*a.t,this.r2),this.mu=this.r2.divide(a),this.m=a}function barrettConvert(a){if(a.s<0||a.t>2*this.m.t)return a.mod(this.m);if(a.compareTo(this.m)<0)return a;var b=nbi();return a.copyTo(b),this.reduce(b),b}function barrettRevert(a){return a}function barrettReduce(a){for(a.drShiftTo(this.m.t-1,this.r2),a.t>this.m.t+1&&(a.t=this.m.t+1,a.clamp()),this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3),this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);a.compareTo(this.r2)<0;)a.dAddOffset(1,this.m.t+1);for(a.subTo(this.r2,a);a.compareTo(this.m)>=0;)a.subTo(this.m,a)}function barrettSqrTo(a,b){a.squareTo(b),this.reduce(b)}function barrettMulTo(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function bnModPow(a,b){var c,d,e=a.bitLength(),f=nbv(1);if(0>=e)return f;c=18>e?1:48>e?3:144>e?4:768>e?5:6,d=8>e?new Classic(b):b.isEven()?new Barrett(b):new Montgomery(b);var g=new Array,h=3,i=c-1,j=(1<<c)-1;if(g[1]=d.convert(this),c>1){var k=nbi();for(d.sqrTo(g[1],k);j>=h;)g[h]=nbi(),d.mulTo(k,g[h-2],g[h]),h+=2}var l,m,n=a.t-1,o=!0,p=nbi();for(e=nbits(a[n])-1;n>=0;){for(e>=i?l=a[n]>>e-i&j:(l=(a[n]&(1<<e+1)-1)<<i-e,n>0&&(l|=a[n-1]>>this.DB+e-i)),h=c;0==(1&l);)l>>=1,--h;if((e-=h)<0&&(e+=this.DB,--n),o)g[l].copyTo(f),o=!1;else{for(;h>1;)d.sqrTo(f,p),d.sqrTo(p,f),h-=2;h>0?d.sqrTo(f,p):(m=f,f=p,p=m),d.mulTo(p,g[l],f)}for(;n>=0&&0==(a[n]&1<<e);)d.sqrTo(f,p),m=f,f=p,p=m,--e<0&&(e=this.DB-1,--n)}return d.revert(f)}function bnGCD(a){var b=this.s<0?this.negate():this.clone(),c=a.s<0?a.negate():a.clone();if(b.compareTo(c)<0){var d=b;b=c,c=d}var e=b.getLowestSetBit(),f=c.getLowestSetBit();if(0>f)return b;for(f>e&&(f=e),f>0&&(b.rShiftTo(f,b),c.rShiftTo(f,c));b.signum()>0;)(e=b.getLowestSetBit())>0&&b.rShiftTo(e,b),(e=c.getLowestSetBit())>0&&c.rShiftTo(e,c),b.compareTo(c)>=0?(b.subTo(c,b),b.rShiftTo(1,b)):(c.subTo(b,c),c.rShiftTo(1,c));return f>0&&c.lShiftTo(f,c),c}function bnpModInt(a){if(0>=a)return 0;var b=this.DV%a,c=this.s<0?a-1:0;if(this.t>0)if(0==b)c=this[0]%a;else for(var d=this.t-1;d>=0;--d)c=(b*c+this[d])%a;return c}function bnModInverse(a){var b=a.isEven();if(this.isEven()&&b||0==a.signum())return BigInteger.ZERO;for(var c=a.clone(),d=this.clone(),e=nbv(1),f=nbv(0),g=nbv(0),h=nbv(1);0!=c.signum();){for(;c.isEven();)c.rShiftTo(1,c),b?(e.isEven()&&f.isEven()||(e.addTo(this,e),f.subTo(a,f)),e.rShiftTo(1,e)):f.isEven()||f.subTo(a,f),f.rShiftTo(1,f);for(;d.isEven();)d.rShiftTo(1,d),b?(g.isEven()&&h.isEven()||(g.addTo(this,g),h.subTo(a,h)),g.rShiftTo(1,g)):h.isEven()||h.subTo(a,h),h.rShiftTo(1,h);c.compareTo(d)>=0?(c.subTo(d,c),b&&e.subTo(g,e),f.subTo(h,f)):(d.subTo(c,d),b&&g.subTo(e,g),h.subTo(f,h))}return 0!=d.compareTo(BigInteger.ONE)?BigInteger.ZERO:h.compareTo(a)>=0?h.subtract(a):h.signum()<0?(h.addTo(a,h),h.signum()<0?h.add(a):h):h}function bnIsProbablePrime(a){var b,c=this.abs();if(1==c.t&&c[0]<=lowprimes[lowprimes.length-1]){for(b=0;b<lowprimes.length;++b)if(c[0]==lowprimes[b])return!0;return!1}if(c.isEven())return!1;for(b=1;b<lowprimes.length;){for(var d=lowprimes[b],e=b+1;e<lowprimes.length&&lplim>d;)d*=lowprimes[e++];for(d=c.modInt(d);e>b;)if(d%lowprimes[b++]==0)return!1}return c.millerRabin(a)}function bnpMillerRabin(a){var b=this.subtract(BigInteger.ONE),c=b.getLowestSetBit();if(0>=c)return!1;var d=b.shiftRight(c);a=a+1>>1,a>lowprimes.length&&(a=lowprimes.length);for(var e=nbi(),f=0;a>f;++f){e.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);var g=e.modPow(d,this);if(0!=g.compareTo(BigInteger.ONE)&&0!=g.compareTo(b)){for(var h=1;h++<c&&0!=g.compareTo(b);)if(g=g.modPowInt(2,this),0==g.compareTo(BigInteger.ONE))return!1;if(0!=g.compareTo(b))return!1}}return!0}function Arcfour(){this.i=0,this.j=0,this.S=new Array}function ARC4init(a){var b,c,d;for(b=0;256>b;++b)this.S[b]=b;for(c=0,b=0;256>b;++b)c=c+this.S[b]+a[b%a.length]&255,d=this.S[b],this.S[b]=this.S[c],this.S[c]=d;this.i=0,this.j=0}function ARC4next(){var a;return this.i=this.i+1&255,this.j=this.j+this.S[this.i]&255,a=this.S[this.i],this.S[this.i]=this.S[this.j],this.S[this.j]=a,this.S[a+this.S[this.i]&255]}function prng_newstate(){return new Arcfour}function rng_get_byte(){if(null==rng_state){for(rng_state=prng_newstate();rng_psize>rng_pptr;){var a=Math.floor(65536*Math.random());rng_pool[rng_pptr++]=255&a}for(rng_state.init(rng_pool),rng_pptr=0;rng_pptr<rng_pool.length;++rng_pptr)rng_pool[rng_pptr]=0;rng_pptr=0}return rng_state.next()}function rng_get_bytes(a){var b;for(b=0;b<a.length;++b)a[b]=rng_get_byte()}function SecureRandom(){}function parseBigInt(a,b){return new BigInteger(a,b)}function linebrk(a,b){for(var c=\"\",d=0;d+b<a.length;)c+=a.substring(d,d+b)+\"\\n\",d+=b;return c+a.substring(d,a.length)}function byte2Hex(a){return 16>a?\"0\"+a.toString(16):a.toString(16)}function pkcs1pad2(a,b){if(b<a.length+11)return console.error(\"Message too long for RSA\"),null;for(var c=new Array,d=a.length-1;d>=0&&b>0;){var e=a.charCodeAt(d--);128>e?c[--b]=e:e>127&&2048>e?(c[--b]=63&e|128,c[--b]=e>>6|192):(c[--b]=63&e|128,c[--b]=e>>6&63|128,c[--b]=e>>12|224)}c[--b]=0;for(var f=new SecureRandom,g=new Array;b>2;){for(g[0]=0;0==g[0];)f.nextBytes(g);c[--b]=g[0]}return c[--b]=2,c[--b]=0,new BigInteger(c)}function RSAKey(){this.n=null,this.e=0,this.d=null,this.p=null,this.q=null,this.dmp1=null,this.dmq1=null,this.coeff=null}function RSASetPublic(a,b){null!=a&&null!=b&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16)):console.error(\"Invalid RSA public key\")}function RSADoPublic(a){return a.modPowInt(this.e,this.n)}function RSAEncrypt(a){var b=pkcs1pad2(a,this.n.bitLength()+7>>3);if(null==b)return null;var c=this.doPublic(b);if(null==c)return null;var d=c.toString(16);return 0==(1&d.length)?d:\"0\"+d}function pkcs1unpad2(a,b){for(var c=a.toByteArray(),d=0;d<c.length&&0==c[d];)++d;if(c.length-d!=b-1||2!=c[d])return null;for(++d;0!=c[d];)if(++d>=c.length)return null;for(var e=\"\";++d<c.length;){var f=255&c[d];128>f?e+=String.fromCharCode(f):f>191&&224>f?(e+=String.fromCharCode((31&f)<<6|63&c[d+1]),++d):(e+=String.fromCharCode((15&f)<<12|(63&c[d+1])<<6|63&c[d+2]),d+=2)}return e}function RSASetPrivate(a,b,c){null!=a&&null!=b&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16),this.d=parseBigInt(c,16)):console.error(\"Invalid RSA private key\")}function RSASetPrivateEx(a,b,c,d,e,f,g,h){null!=a&&null!=b&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16),this.d=parseBigInt(c,16),this.p=parseBigInt(d,16),this.q=parseBigInt(e,16),this.dmp1=parseBigInt(f,16),this.dmq1=parseBigInt(g,16),this.coeff=parseBigInt(h,16)):console.error(\"Invalid RSA private key\")}function RSAGenerate(a,b){var c=new SecureRandom,d=a>>1;this.e=parseInt(b,16);for(var e=new BigInteger(b,16);;){for(;this.p=new BigInteger(a-d,1,c),0!=this.p.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE)||!this.p.isProbablePrime(10););for(;this.q=new BigInteger(d,1,c),0!=this.q.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE)||!this.q.isProbablePrime(10););if(this.p.compareTo(this.q)<=0){var f=this.p;this.p=this.q,this.q=f}var g=this.p.subtract(BigInteger.ONE),h=this.q.subtract(BigInteger.ONE),i=g.multiply(h);if(0==i.gcd(e).compareTo(BigInteger.ONE)){this.n=this.p.multiply(this.q),this.d=e.modInverse(i),this.dmp1=this.d.mod(g),this.dmq1=this.d.mod(h),this.coeff=this.q.modInverse(this.p);break}}}function RSADoPrivate(a){if(null==this.p||null==this.q)return a.modPow(this.d,this.n);for(var b=a.mod(this.p).modPow(this.dmp1,this.p),c=a.mod(this.q).modPow(this.dmq1,this.q);b.compareTo(c)<0;)b=b.add(this.p);return b.subtract(c).multiply(this.coeff).mod(this.p).multiply(this.q).add(c)}function RSADecrypt(a){var b=parseBigInt(a,16),c=this.doPrivate(b);return null==c?null:pkcs1unpad2(c,this.n.bitLength()+7>>3)}function hex2b64(a){var b,c,d=\"\";for(b=0;b+3<=a.length;b+=3)c=parseInt(a.substring(b,b+3),16),d+=b64map.charAt(c>>6)+b64map.charAt(63&c);for(b+1==a.length?(c=parseInt(a.substring(b,b+1),16),d+=b64map.charAt(c<<2)):b+2==a.length&&(c=parseInt(a.substring(b,b+2),16),d+=b64map.charAt(c>>2)+b64map.charAt((3&c)<<4));(3&d.length)>0;)d+=b64pad;return d}function b64tohex(a){var b,c,d=\"\",e=0;for(b=0;b<a.length&&a.charAt(b)!=b64pad;++b)v=b64map.indexOf(a.charAt(b)),v<0||(0==e?(d+=int2char(v>>2),c=3&v,e=1):1==e?(d+=int2char(c<<2|v>>4),c=15&v,e=2):2==e?(d+=int2char(c),d+=int2char(v>>2),c=3&v,e=3):(d+=int2char(c<<2|v>>4),d+=int2char(15&v),e=0));return 1==e&&(d+=int2char(c<<2)),d}function b64toBA(a){var b,c=b64tohex(a),d=new Array;for(b=0;2*b<c.length;++b)d[b]=parseInt(c.substring(2*b,2*b+2),16);return d}var dbits,canary=0xdeadbeefcafe,j_lm=15715070==(16777215&canary);j_lm&&\"Microsoft Internet Explorer\"==navigator.appName?(BigInteger.prototype.am=am2,dbits=30):j_lm&&\"Netscape\"!=navigator.appName?(BigInteger.prototype.am=am1,dbits=26):(BigInteger.prototype.am=am3,dbits=28),BigInteger.prototype.DB=dbits,BigInteger.prototype.DM=(1<<dbits)-1,BigInteger.prototype.DV=1<<dbits;var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP),BigInteger.prototype.F1=BI_FP-dbits,BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM=\"0123456789abcdefghijklmnopqrstuvwxyz\",BI_RC=new Array,rr,vv;for(rr=\"0\".charCodeAt(0),vv=0;9>=vv;++vv)BI_RC[rr++]=vv;for(rr=\"a\".charCodeAt(0),vv=10;36>vv;++vv)BI_RC[rr++]=vv;for(rr=\"A\".charCodeAt(0),vv=10;36>vv;++vv)BI_RC[rr++]=vv;Classic.prototype.convert=cConvert,Classic.prototype.revert=cRevert,Classic.prototype.reduce=cReduce,Classic.prototype.mulTo=cMulTo,Classic.prototype.sqrTo=cSqrTo,Montgomery.prototype.convert=montConvert,Montgomery.prototype.revert=montRevert,Montgomery.prototype.reduce=montReduce,Montgomery.prototype.mulTo=montMulTo,Montgomery.prototype.sqrTo=montSqrTo,BigInteger.prototype.copyTo=bnpCopyTo,BigInteger.prototype.fromInt=bnpFromInt,BigInteger.prototype.fromString=bnpFromString,BigInteger.prototype.clamp=bnpClamp,BigInteger.prototype.dlShiftTo=bnpDLShiftTo,BigInteger.prototype.drShiftTo=bnpDRShiftTo,BigInteger.prototype.lShiftTo=bnpLShiftTo,BigInteger.prototype.rShiftTo=bnpRShiftTo,BigInteger.prototype.subTo=bnpSubTo,BigInteger.prototype.multiplyTo=bnpMultiplyTo,BigInteger.prototype.squareTo=bnpSquareTo,BigInteger.prototype.divRemTo=bnpDivRemTo,BigInteger.prototype.invDigit=bnpInvDigit,BigInteger.prototype.isEven=bnpIsEven,BigInteger.prototype.exp=bnpExp,BigInteger.prototype.toString=bnToString,BigInteger.prototype.negate=bnNegate,BigInteger.prototype.abs=bnAbs,BigInteger.prototype.compareTo=bnCompareTo,BigInteger.prototype.bitLength=bnBitLength,BigInteger.prototype.mod=bnMod,BigInteger.prototype.modPowInt=bnModPowInt,BigInteger.ZERO=nbv(0),BigInteger.ONE=nbv(1),NullExp.prototype.convert=nNop,NullExp.prototype.revert=nNop,NullExp.prototype.mulTo=nMulTo,NullExp.prototype.sqrTo=nSqrTo,Barrett.prototype.convert=barrettConvert,Barrett.prototype.revert=barrettRevert,Barrett.prototype.reduce=barrettReduce,Barrett.prototype.mulTo=barrettMulTo,Barrett.prototype.sqrTo=barrettSqrTo;var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],lplim=(1<<26)/lowprimes[lowprimes.length-1];BigInteger.prototype.chunkSize=bnpChunkSize,BigInteger.prototype.toRadix=bnpToRadix,BigInteger.prototype.fromRadix=bnpFromRadix,BigInteger.prototype.fromNumber=bnpFromNumber,BigInteger.prototype.bitwiseTo=bnpBitwiseTo,BigInteger.prototype.changeBit=bnpChangeBit,BigInteger.prototype.addTo=bnpAddTo,BigInteger.prototype.dMultiply=bnpDMultiply,BigInteger.prototype.dAddOffset=bnpDAddOffset,BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo,BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo,BigInteger.prototype.modInt=bnpModInt,BigInteger.prototype.millerRabin=bnpMillerRabin,BigInteger.prototype.clone=bnClone,BigInteger.prototype.intValue=bnIntValue,BigInteger.prototype.byteValue=bnByteValue,BigInteger.prototype.shortValue=bnShortValue,BigInteger.prototype.signum=bnSigNum,BigInteger.prototype.toByteArray=bnToByteArray,BigInteger.prototype.equals=bnEquals,BigInteger.prototype.min=bnMin,BigInteger.prototype.max=bnMax,BigInteger.prototype.and=bnAnd,BigInteger.prototype.or=bnOr,BigInteger.prototype.xor=bnXor,BigInteger.prototype.andNot=bnAndNot,BigInteger.prototype.not=bnNot,BigInteger.prototype.shiftLeft=bnShiftLeft,BigInteger.prototype.shiftRight=bnShiftRight,BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit,BigInteger.prototype.bitCount=bnBitCount,BigInteger.prototype.testBit=bnTestBit,BigInteger.prototype.setBit=bnSetBit,BigInteger.prototype.clearBit=bnClearBit,BigInteger.prototype.flipBit=bnFlipBit,BigInteger.prototype.add=bnAdd,BigInteger.prototype.subtract=bnSubtract,BigInteger.prototype.multiply=bnMultiply,BigInteger.prototype.divide=bnDivide,BigInteger.prototype.remainder=bnRemainder,BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder,BigInteger.prototype.modPow=bnModPow,BigInteger.prototype.modInverse=bnModInverse,BigInteger.prototype.pow=bnPow,BigInteger.prototype.gcd=bnGCD,BigInteger.prototype.isProbablePrime=bnIsProbablePrime,BigInteger.prototype.square=bnSquare,Arcfour.prototype.init=ARC4init,Arcfour.prototype.next=ARC4next;var rng_psize=256,rng_state,rng_pool,rng_pptr;if(null==rng_pool){rng_pool=new Array,rng_pptr=0;var t;if(window.crypto&&window.crypto.getRandomValues){var z=new Uint32Array(256);for(window.crypto.getRandomValues(z),t=0;t<z.length;++t)rng_pool[rng_pptr++]=255&z[t]}var onMouseMoveListener=function(a){if(this.count=this.count||0,this.count>=256||rng_pptr>=rng_psize)return void(window.removeEventListener?window.removeEventListener(\"mousemove\",onMouseMoveListener):window.detachEvent&&window.detachEvent(\"onmousemove\",onMouseMoveListener));this.count+=1;var b=a.x+a.y;rng_pool[rng_pptr++]=255&b};window.addEventListener?window.addEventListener(\"mousemove\",onMouseMoveListener):window.attachEvent&&window.attachEvent(\"onmousemove\",onMouseMoveListener)}SecureRandom.prototype.nextBytes=rng_get_bytes,RSAKey.prototype.doPublic=RSADoPublic,RSAKey.prototype.setPublic=RSASetPublic,RSAKey.prototype.encrypt=RSAEncrypt,RSAKey.prototype.doPrivate=RSADoPrivate,RSAKey.prototype.setPrivate=RSASetPrivate,RSAKey.prototype.setPrivateEx=RSASetPrivateEx,RSAKey.prototype.generate=RSAGenerate,RSAKey.prototype.decrypt=RSADecrypt,function(){var a=function(a,b,c){var d=new SecureRandom,e=a>>1;this.e=parseInt(b,16);var f=new BigInteger(b,16),g=this,h=function(){var b=function(){if(g.p.compareTo(g.q)<=0){var a=g.p;g.p=g.q,g.q=a}var b=g.p.subtract(BigInteger.ONE),d=g.q.subtract(BigInteger.ONE),e=b.multiply(d);0==e.gcd(f).compareTo(BigInteger.ONE)?(g.n=g.p.multiply(g.q),g.d=f.modInverse(e),g.dmp1=g.d.mod(b),g.dmq1=g.d.mod(d),g.coeff=g.q.modInverse(g.p),setTimeout(function(){c()},0)):setTimeout(h,0)},i=function(){g.q=nbi(),g.q.fromNumberAsync(e,1,d,function(){g.q.subtract(BigInteger.ONE).gcda(f,function(a){0==a.compareTo(BigInteger.ONE)&&g.q.isProbablePrime(10)?setTimeout(b,0):setTimeout(i,0)})})},j=function(){g.p=nbi(),g.p.fromNumberAsync(a-e,1,d,function(){g.p.subtract(BigInteger.ONE).gcda(f,function(a){0==a.compareTo(BigInteger.ONE)&&g.p.isProbablePrime(10)?setTimeout(i,0):setTimeout(j,0)})})};setTimeout(j,0)};setTimeout(h,0)};RSAKey.prototype.generateAsync=a;var b=function(a,b){var c=this.s<0?this.negate():this.clone(),d=a.s<0?a.negate():a.clone();if(c.compareTo(d)<0){var e=c;c=d,d=e}var f=c.getLowestSetBit(),g=d.getLowestSetBit();if(0>g)return void b(c);g>f&&(g=f),g>0&&(c.rShiftTo(g,c),d.rShiftTo(g,d));var h=function(){(f=c.getLowestSetBit())>0&&c.rShiftTo(f,c),(f=d.getLowestSetBit())>0&&d.rShiftTo(f,d),c.compareTo(d)>=0?(c.subTo(d,c),c.rShiftTo(1,c)):(d.subTo(c,d),d.rShiftTo(1,d)),c.signum()>0?setTimeout(h,0):(g>0&&d.lShiftTo(g,d),setTimeout(function(){b(d)},0))};setTimeout(h,10)};BigInteger.prototype.gcda=b;var c=function(a,b,c,d){if(\"number\"==typeof b)if(2>a)this.fromInt(1);else{this.fromNumber(a,c),this.testBit(a-1)||this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this),this.isEven()&&this.dAddOffset(1,0);var e=this,f=function(){e.dAddOffset(2,0),e.bitLength()>a&&e.subTo(BigInteger.ONE.shiftLeft(a-1),e),e.isProbablePrime(b)?setTimeout(function(){d()},0):setTimeout(f,0)};setTimeout(f,0)}else{var g=new Array,h=7&a;g.length=(a>>3)+1,b.nextBytes(g),h>0?g[0]&=(1<<h)-1:g[0]=0,this.fromString(g,256)}};BigInteger.prototype.fromNumberAsync=c}();var b64map=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\",b64pad=\"=\",JSX=JSX||{};JSX.env=JSX.env||{};var L=JSX,OP=Object.prototype,FUNCTION_TOSTRING=\"[object Function]\",ADD=[\"toString\",\"valueOf\"];JSX.env.parseUA=function(a){var b,c=function(a){var b=0;return parseFloat(a.replace(/\\./g,function(){return 1==b++?\"\":\".\"}))},d=navigator,e={ie:0,opera:0,gecko:0,webkit:0,chrome:0,mobile:null,air:0,ipad:0,iphone:0,ipod:0,ios:null,android:0,webos:0,caja:d&&d.cajaVersion,secure:!1,os:null},f=a||navigator&&navigator.userAgent,g=window&&window.location,h=g&&g.href;return e.secure=h&&0===h.toLowerCase().indexOf(\"https\"),f&&(/windows|win32/i.test(f)?e.os=\"windows\":/macintosh/i.test(f)?e.os=\"macintosh\":/rhino/i.test(f)&&(e.os=\"rhino\"),/KHTML/.test(f)&&(e.webkit=1),b=f.match(/AppleWebKit\\/([^\\s]*)/),b&&b[1]&&(e.webkit=c(b[1]),/ Mobile\\//.test(f)?(e.mobile=\"Apple\",b=f.match(/OS ([^\\s]*)/),b&&b[1]&&(b=c(b[1].replace(\"_\",\".\"))),e.ios=b,e.ipad=e.ipod=e.iphone=0,b=f.match(/iPad|iPod|iPhone/),b&&b[0]&&(e[b[0].toLowerCase()]=e.ios)):(b=f.match(/NokiaN[^\\/]*|Android \\d\\.\\d|webOS\\/\\d\\.\\d/),b&&(e.mobile=b[0]),/webOS/.test(f)&&(e.mobile=\"WebOS\",b=f.match(/webOS\\/([^\\s]*);/),b&&b[1]&&(e.webos=c(b[1]))),/ Android/.test(f)&&(e.mobile=\"Android\",b=f.match(/Android ([^\\s]*);/),b&&b[1]&&(e.android=c(b[1])))),b=f.match(/Chrome\\/([^\\s]*)/),b&&b[1]?e.chrome=c(b[1]):(b=f.match(/AdobeAIR\\/([^\\s]*)/),b&&(e.air=b[0]))),e.webkit||(b=f.match(/Opera[\\s\\/]([^\\s]*)/),b&&b[1]?(e.opera=c(b[1]),b=f.match(/Version\\/([^\\s]*)/),b&&b[1]&&(e.opera=c(b[1])),b=f.match(/Opera Mini[^;]*/),b&&(e.mobile=b[0])):(b=f.match(/MSIE\\s([^;]*)/),b&&b[1]?e.ie=c(b[1]):(b=f.match(/Gecko\\/([^\\s]*)/),b&&(e.gecko=1,b=f.match(/rv:([^\\s\\)]*)/),b&&b[1]&&(e.gecko=c(b[1]))))))),e},JSX.env.ua=JSX.env.parseUA(),JSX.isFunction=function(a){return\"function\"==typeof a||OP.toString.apply(a)===FUNCTION_TOSTRING},JSX._IEEnumFix=JSX.env.ua.ie?function(a,b){var c,d,e;for(c=0;c<ADD.length;c+=1)d=ADD[c],e=b[d],L.isFunction(e)&&e!=OP[d]&&(a[d]=e)}:function(){},JSX.extend=function(a,b,c){if(!b||!a)throw new Error(\"extend failed, please check that all dependencies are included.\");var d,e=function(){};if(e.prototype=b.prototype,a.prototype=new e,a.prototype.constructor=a,a.superclass=b.prototype,b.prototype.constructor==OP.constructor&&(b.prototype.constructor=b),c){for(d in c)L.hasOwnProperty(c,d)&&(a.prototype[d]=c[d]);L._IEEnumFix(a.prototype,c)}},\"undefined\"!=typeof KJUR&&KJUR||(KJUR={}),\"undefined\"!=typeof KJUR.asn1&&KJUR.asn1||(KJUR.asn1={}),KJUR.asn1.ASN1Util=new function(){this.integerToByteHex=function(a){var b=a.toString(16);return b.length%2==1&&(b=\"0\"+b),b},this.bigIntToMinTwosComplementsHex=function(a){var b=a.toString(16);if(\"-\"!=b.substr(0,1))b.length%2==1?b=\"0\"+b:b.match(/^[0-7]/)||(b=\"00\"+b);\nelse{var c=b.substr(1),d=c.length;d%2==1?d+=1:b.match(/^[0-7]/)||(d+=2);for(var e=\"\",f=0;d>f;f++)e+=\"f\";var g=new BigInteger(e,16),h=g.xor(a).add(BigInteger.ONE);b=h.toString(16).replace(/^-/,\"\")}return b},this.getPEMStringFromHex=function(a,b){var c=CryptoJS.enc.Hex.parse(a),d=CryptoJS.enc.Base64.stringify(c),e=d.replace(/(.{64})/g,\"$1\\r\\n\");return e=e.replace(/\\r\\n$/,\"\"),\"-----BEGIN \"+b+\"-----\\r\\n\"+e+\"\\r\\n-----END \"+b+\"-----\\r\\n\"}},KJUR.asn1.ASN1Object=function(){var a=\"\";this.getLengthHexFromValue=function(){if(\"undefined\"==typeof this.hV||null==this.hV)throw\"this.hV is null or undefined.\";if(this.hV.length%2==1)throw\"value hex must be even length: n=\"+a.length+\",v=\"+this.hV;var b=this.hV.length/2,c=b.toString(16);if(c.length%2==1&&(c=\"0\"+c),128>b)return c;var d=c.length/2;if(d>15)throw\"ASN.1 length too long to represent by 8x: n = \"+b.toString(16);var e=128+d;return e.toString(16)+c},this.getEncodedHex=function(){return(null==this.hTLV||this.isModified)&&(this.hV=this.getFreshValueHex(),this.hL=this.getLengthHexFromValue(),this.hTLV=this.hT+this.hL+this.hV,this.isModified=!1),this.hTLV},this.getValueHex=function(){return this.getEncodedHex(),this.hV},this.getFreshValueHex=function(){return\"\"}},KJUR.asn1.DERAbstractString=function(a){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);this.getString=function(){return this.s},this.setString=function(a){this.hTLV=null,this.isModified=!0,this.s=a,this.hV=stohex(this.s)},this.setStringHex=function(a){this.hTLV=null,this.isModified=!0,this.s=null,this.hV=a},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.str?this.setString(a.str):\"undefined\"!=typeof a.hex&&this.setStringHex(a.hex))},JSX.extend(KJUR.asn1.DERAbstractString,KJUR.asn1.ASN1Object),KJUR.asn1.DERAbstractTime=function(){KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);this.localDateToUTC=function(a){utc=a.getTime()+6e4*a.getTimezoneOffset();var b=new Date(utc);return b},this.formatDate=function(a,b){var c=this.zeroPadding,d=this.localDateToUTC(a),e=String(d.getFullYear());\"utc\"==b&&(e=e.substr(2,2));var f=c(String(d.getMonth()+1),2),g=c(String(d.getDate()),2),h=c(String(d.getHours()),2),i=c(String(d.getMinutes()),2),j=c(String(d.getSeconds()),2);return e+f+g+h+i+j+\"Z\"},this.zeroPadding=function(a,b){return a.length>=b?a:new Array(b-a.length+1).join(\"0\")+a},this.getString=function(){return this.s},this.setString=function(a){this.hTLV=null,this.isModified=!0,this.s=a,this.hV=stohex(this.s)},this.setByDateValue=function(a,b,c,d,e,f){var g=new Date(Date.UTC(a,b-1,c,d,e,f,0));this.setByDate(g)},this.getFreshValueHex=function(){return this.hV}},JSX.extend(KJUR.asn1.DERAbstractTime,KJUR.asn1.ASN1Object),KJUR.asn1.DERAbstractStructured=function(a){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);this.setByASN1ObjectArray=function(a){this.hTLV=null,this.isModified=!0,this.asn1Array=a},this.appendASN1Object=function(a){this.hTLV=null,this.isModified=!0,this.asn1Array.push(a)},this.asn1Array=new Array,\"undefined\"!=typeof a&&\"undefined\"!=typeof a.array&&(this.asn1Array=a.array)},JSX.extend(KJUR.asn1.DERAbstractStructured,KJUR.asn1.ASN1Object),KJUR.asn1.DERBoolean=function(){KJUR.asn1.DERBoolean.superclass.constructor.call(this),this.hT=\"01\",this.hTLV=\"0101ff\"},JSX.extend(KJUR.asn1.DERBoolean,KJUR.asn1.ASN1Object),KJUR.asn1.DERInteger=function(a){KJUR.asn1.DERInteger.superclass.constructor.call(this),this.hT=\"02\",this.setByBigInteger=function(a){this.hTLV=null,this.isModified=!0,this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(a)},this.setByInteger=function(a){var b=new BigInteger(String(a),10);this.setByBigInteger(b)},this.setValueHex=function(a){this.hV=a},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.bigint?this.setByBigInteger(a.bigint):\"undefined\"!=typeof a[\"int\"]?this.setByInteger(a[\"int\"]):\"undefined\"!=typeof a.hex&&this.setValueHex(a.hex))},JSX.extend(KJUR.asn1.DERInteger,KJUR.asn1.ASN1Object),KJUR.asn1.DERBitString=function(a){KJUR.asn1.DERBitString.superclass.constructor.call(this),this.hT=\"03\",this.setHexValueIncludingUnusedBits=function(a){this.hTLV=null,this.isModified=!0,this.hV=a},this.setUnusedBitsAndHexValue=function(a,b){if(0>a||a>7)throw\"unused bits shall be from 0 to 7: u = \"+a;var c=\"0\"+a;this.hTLV=null,this.isModified=!0,this.hV=c+b},this.setByBinaryString=function(a){a=a.replace(/0+$/,\"\");var b=8-a.length%8;8==b&&(b=0);for(var c=0;b>=c;c++)a+=\"0\";for(var d=\"\",c=0;c<a.length-1;c+=8){var e=a.substr(c,8),f=parseInt(e,2).toString(16);1==f.length&&(f=\"0\"+f),d+=f}this.hTLV=null,this.isModified=!0,this.hV=\"0\"+b+d},this.setByBooleanArray=function(a){for(var b=\"\",c=0;c<a.length;c++)b+=1==a[c]?\"1\":\"0\";this.setByBinaryString(b)},this.newFalseArray=function(a){for(var b=new Array(a),c=0;a>c;c++)b[c]=!1;return b},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.hex?this.setHexValueIncludingUnusedBits(a.hex):\"undefined\"!=typeof a.bin?this.setByBinaryString(a.bin):\"undefined\"!=typeof a.array&&this.setByBooleanArray(a.array))},JSX.extend(KJUR.asn1.DERBitString,KJUR.asn1.ASN1Object),KJUR.asn1.DEROctetString=function(a){KJUR.asn1.DEROctetString.superclass.constructor.call(this,a),this.hT=\"04\"},JSX.extend(KJUR.asn1.DEROctetString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERNull=function(){KJUR.asn1.DERNull.superclass.constructor.call(this),this.hT=\"05\",this.hTLV=\"0500\"},JSX.extend(KJUR.asn1.DERNull,KJUR.asn1.ASN1Object),KJUR.asn1.DERObjectIdentifier=function(a){var b=function(a){var b=a.toString(16);return 1==b.length&&(b=\"0\"+b),b},c=function(a){var c=\"\",d=new BigInteger(a,10),e=d.toString(2),f=7-e.length%7;7==f&&(f=0);for(var g=\"\",h=0;f>h;h++)g+=\"0\";e=g+e;for(var h=0;h<e.length-1;h+=7){var i=e.substr(h,7);h!=e.length-7&&(i=\"1\"+i),c+=b(parseInt(i,2))}return c};KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this),this.hT=\"06\",this.setValueHex=function(a){this.hTLV=null,this.isModified=!0,this.s=null,this.hV=a},this.setValueOidString=function(a){if(!a.match(/^[0-9.]+$/))throw\"malformed oid string: \"+a;var d=\"\",e=a.split(\".\"),f=40*parseInt(e[0])+parseInt(e[1]);d+=b(f),e.splice(0,2);for(var g=0;g<e.length;g++)d+=c(e[g]);this.hTLV=null,this.isModified=!0,this.s=null,this.hV=d},this.setValueName=function(a){if(\"undefined\"==typeof KJUR.asn1.x509.OID.name2oidList[a])throw\"DERObjectIdentifier oidName undefined: \"+a;var b=KJUR.asn1.x509.OID.name2oidList[a];this.setValueOidString(b)},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.oid?this.setValueOidString(a.oid):\"undefined\"!=typeof a.hex?this.setValueHex(a.hex):\"undefined\"!=typeof a.name&&this.setValueName(a.name))},JSX.extend(KJUR.asn1.DERObjectIdentifier,KJUR.asn1.ASN1Object),KJUR.asn1.DERUTF8String=function(a){KJUR.asn1.DERUTF8String.superclass.constructor.call(this,a),this.hT=\"0c\"},JSX.extend(KJUR.asn1.DERUTF8String,KJUR.asn1.DERAbstractString),KJUR.asn1.DERNumericString=function(a){KJUR.asn1.DERNumericString.superclass.constructor.call(this,a),this.hT=\"12\"},JSX.extend(KJUR.asn1.DERNumericString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERPrintableString=function(a){KJUR.asn1.DERPrintableString.superclass.constructor.call(this,a),this.hT=\"13\"},JSX.extend(KJUR.asn1.DERPrintableString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERTeletexString=function(a){KJUR.asn1.DERTeletexString.superclass.constructor.call(this,a),this.hT=\"14\"},JSX.extend(KJUR.asn1.DERTeletexString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERIA5String=function(a){KJUR.asn1.DERIA5String.superclass.constructor.call(this,a),this.hT=\"16\"},JSX.extend(KJUR.asn1.DERIA5String,KJUR.asn1.DERAbstractString),KJUR.asn1.DERUTCTime=function(a){KJUR.asn1.DERUTCTime.superclass.constructor.call(this,a),this.hT=\"17\",this.setByDate=function(a){this.hTLV=null,this.isModified=!0,this.date=a,this.s=this.formatDate(this.date,\"utc\"),this.hV=stohex(this.s)},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.str?this.setString(a.str):\"undefined\"!=typeof a.hex?this.setStringHex(a.hex):\"undefined\"!=typeof a.date&&this.setByDate(a.date))},JSX.extend(KJUR.asn1.DERUTCTime,KJUR.asn1.DERAbstractTime),KJUR.asn1.DERGeneralizedTime=function(a){KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this,a),this.hT=\"18\",this.setByDate=function(a){this.hTLV=null,this.isModified=!0,this.date=a,this.s=this.formatDate(this.date,\"gen\"),this.hV=stohex(this.s)},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.str?this.setString(a.str):\"undefined\"!=typeof a.hex?this.setStringHex(a.hex):\"undefined\"!=typeof a.date&&this.setByDate(a.date))},JSX.extend(KJUR.asn1.DERGeneralizedTime,KJUR.asn1.DERAbstractTime),KJUR.asn1.DERSequence=function(a){KJUR.asn1.DERSequence.superclass.constructor.call(this,a),this.hT=\"30\",this.getFreshValueHex=function(){for(var a=\"\",b=0;b<this.asn1Array.length;b++){var c=this.asn1Array[b];a+=c.getEncodedHex()}return this.hV=a,this.hV}},JSX.extend(KJUR.asn1.DERSequence,KJUR.asn1.DERAbstractStructured),KJUR.asn1.DERSet=function(a){KJUR.asn1.DERSet.superclass.constructor.call(this,a),this.hT=\"31\",this.getFreshValueHex=function(){for(var a=new Array,b=0;b<this.asn1Array.length;b++){var c=this.asn1Array[b];a.push(c.getEncodedHex())}return a.sort(),this.hV=a.join(\"\"),this.hV}},JSX.extend(KJUR.asn1.DERSet,KJUR.asn1.DERAbstractStructured),KJUR.asn1.DERTaggedObject=function(a){KJUR.asn1.DERTaggedObject.superclass.constructor.call(this),this.hT=\"a0\",this.hV=\"\",this.isExplicit=!0,this.asn1Object=null,this.setASN1Object=function(a,b,c){this.hT=b,this.isExplicit=a,this.asn1Object=c,this.isExplicit?(this.hV=this.asn1Object.getEncodedHex(),this.hTLV=null,this.isModified=!0):(this.hV=null,this.hTLV=c.getEncodedHex(),this.hTLV=this.hTLV.replace(/^../,b),this.isModified=!1)},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.tag&&(this.hT=a.tag),\"undefined\"!=typeof a.explicit&&(this.isExplicit=a.explicit),\"undefined\"!=typeof a.obj&&(this.asn1Object=a.obj,this.setASN1Object(this.isExplicit,this.hT,this.asn1Object)))},JSX.extend(KJUR.asn1.DERTaggedObject,KJUR.asn1.ASN1Object),function(a){\"use strict\";var b,c={};c.decode=function(c){var d;if(b===a){var e=\"0123456789ABCDEF\",f=\" \\f\\n\\r\t \\u2028\\u2029\";for(b=[],d=0;16>d;++d)b[e.charAt(d)]=d;for(e=e.toLowerCase(),d=10;16>d;++d)b[e.charAt(d)]=d;for(d=0;d<f.length;++d)b[f.charAt(d)]=-1}var g=[],h=0,i=0;for(d=0;d<c.length;++d){var j=c.charAt(d);if(\"=\"==j)break;if(j=b[j],-1!=j){if(j===a)throw\"Illegal character at offset \"+d;h|=j,++i>=2?(g[g.length]=h,h=0,i=0):h<<=4}}if(i)throw\"Hex encoding incomplete: 4 bits missing\";return g},window.Hex=c}(),function(a){\"use strict\";var b,c={};c.decode=function(c){var d;if(b===a){var e=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\",f=\"= \\f\\n\\r\t \\u2028\\u2029\";for(b=[],d=0;64>d;++d)b[e.charAt(d)]=d;for(d=0;d<f.length;++d)b[f.charAt(d)]=-1}var g=[],h=0,i=0;for(d=0;d<c.length;++d){var j=c.charAt(d);if(\"=\"==j)break;if(j=b[j],-1!=j){if(j===a)throw\"Illegal character at offset \"+d;h|=j,++i>=4?(g[g.length]=h>>16,g[g.length]=h>>8&255,g[g.length]=255&h,h=0,i=0):h<<=6}}switch(i){case 1:throw\"Base64 encoding incomplete: at least 2 bits missing\";case 2:g[g.length]=h>>10;break;case 3:g[g.length]=h>>16,g[g.length]=h>>8&255}return g},c.re=/-----BEGIN [^-]+-----([A-Za-z0-9+\\/=\\s]+)-----END [^-]+-----|begin-base64[^\\n]+\\n([A-Za-z0-9+\\/=\\s]+)====/,c.unarmor=function(a){var b=c.re.exec(a);if(b)if(b[1])a=b[1];else{if(!b[2])throw\"RegExp out of sync\";a=b[2]}return c.decode(a)},window.Base64=c}(),function(a){\"use strict\";function b(a,c){a instanceof b?(this.enc=a.enc,this.pos=a.pos):(this.enc=a,this.pos=c)}function c(a,b,c,d,e){this.stream=a,this.header=b,this.length=c,this.tag=d,this.sub=e}var d=100,e=\"â€¦\",f={tag:function(a,b){var c=document.createElement(a);return c.className=b,c},text:function(a){return document.createTextNode(a)}};b.prototype.get=function(b){if(b===a&&(b=this.pos++),b>=this.enc.length)throw\"Requesting byte offset \"+b+\" on a stream of length \"+this.enc.length;return this.enc[b]},b.prototype.hexDigits=\"0123456789ABCDEF\",b.prototype.hexByte=function(a){return this.hexDigits.charAt(a>>4&15)+this.hexDigits.charAt(15&a)},b.prototype.hexDump=function(a,b,c){for(var d=\"\",e=a;b>e;++e)if(d+=this.hexByte(this.get(e)),c!==!0)switch(15&e){case 7:d+=\"  \";break;case 15:d+=\"\\n\";break;default:d+=\" \"}return d},b.prototype.parseStringISO=function(a,b){for(var c=\"\",d=a;b>d;++d)c+=String.fromCharCode(this.get(d));return c},b.prototype.parseStringUTF=function(a,b){for(var c=\"\",d=a;b>d;){var e=this.get(d++);c+=String.fromCharCode(128>e?e:e>191&&224>e?(31&e)<<6|63&this.get(d++):(15&e)<<12|(63&this.get(d++))<<6|63&this.get(d++))}return c},b.prototype.parseStringBMP=function(a,b){for(var c=\"\",d=a;b>d;d+=2){var e=this.get(d),f=this.get(d+1);c+=String.fromCharCode((e<<8)+f)}return c},b.prototype.reTime=/^((?:1[89]|2\\d)?\\d\\d)(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])([01]\\d|2[0-3])(?:([0-5]\\d)(?:([0-5]\\d)(?:[.,](\\d{1,3}))?)?)?(Z|[-+](?:[0]\\d|1[0-2])([0-5]\\d)?)?$/,b.prototype.parseTime=function(a,b){var c=this.parseStringISO(a,b),d=this.reTime.exec(c);return d?(c=d[1]+\"-\"+d[2]+\"-\"+d[3]+\" \"+d[4],d[5]&&(c+=\":\"+d[5],d[6]&&(c+=\":\"+d[6],d[7]&&(c+=\".\"+d[7]))),d[8]&&(c+=\" UTC\",\"Z\"!=d[8]&&(c+=d[8],d[9]&&(c+=\":\"+d[9]))),c):\"Unrecognized time: \"+c},b.prototype.parseInteger=function(a,b){var c=b-a;if(c>4){c<<=3;var d=this.get(a);if(0===d)c-=8;else for(;128>d;)d<<=1,--c;return\"(\"+c+\" bit)\"}for(var e=0,f=a;b>f;++f)e=e<<8|this.get(f);return e},b.prototype.parseBitString=function(a,b){var c=this.get(a),d=(b-a-1<<3)-c,e=\"(\"+d+\" bit)\";if(20>=d){var f=c;e+=\" \";for(var g=b-1;g>a;--g){for(var h=this.get(g),i=f;8>i;++i)e+=h>>i&1?\"1\":\"0\";f=0}}return e},b.prototype.parseOctetString=function(a,b){var c=b-a,f=\"(\"+c+\" byte) \";c>d&&(b=a+d);for(var g=a;b>g;++g)f+=this.hexByte(this.get(g));return c>d&&(f+=e),f},b.prototype.parseOID=function(a,b){for(var c=\"\",d=0,e=0,f=a;b>f;++f){var g=this.get(f);if(d=d<<7|127&g,e+=7,!(128&g)){if(\"\"===c){var h=80>d?40>d?0:1:2;c=h+\".\"+(d-40*h)}else c+=\".\"+(e>=31?\"bigint\":d);d=e=0}}return c},c.prototype.typeName=function(){if(this.tag===a)return\"unknown\";var b=this.tag>>6,c=(this.tag>>5&1,31&this.tag);switch(b){case 0:switch(c){case 0:return\"EOC\";case 1:return\"BOOLEAN\";case 2:return\"INTEGER\";case 3:return\"BIT_STRING\";case 4:return\"OCTET_STRING\";case 5:return\"NULL\";case 6:return\"OBJECT_IDENTIFIER\";case 7:return\"ObjectDescriptor\";case 8:return\"EXTERNAL\";case 9:return\"REAL\";case 10:return\"ENUMERATED\";case 11:return\"EMBEDDED_PDV\";case 12:return\"UTF8String\";case 16:return\"SEQUENCE\";case 17:return\"SET\";case 18:return\"NumericString\";case 19:return\"PrintableString\";case 20:return\"TeletexString\";case 21:return\"VideotexString\";case 22:return\"IA5String\";case 23:return\"UTCTime\";case 24:return\"GeneralizedTime\";case 25:return\"GraphicString\";case 26:return\"VisibleString\";case 27:return\"GeneralString\";case 28:return\"UniversalString\";case 30:return\"BMPString\";default:return\"Universal_\"+c.toString(16)}case 1:return\"Application_\"+c.toString(16);case 2:return\"[\"+c+\"]\";case 3:return\"Private_\"+c.toString(16)}},c.prototype.reSeemsASCII=/^[ -~]+$/,c.prototype.content=function(){if(this.tag===a)return null;var b=this.tag>>6,c=31&this.tag,f=this.posContent(),g=Math.abs(this.length);if(0!==b){if(null!==this.sub)return\"(\"+this.sub.length+\" elem)\";var h=this.stream.parseStringISO(f,f+Math.min(g,d));return this.reSeemsASCII.test(h)?h.substring(0,2*d)+(h.length>2*d?e:\"\"):this.stream.parseOctetString(f,f+g)}switch(c){case 1:return 0===this.stream.get(f)?\"false\":\"true\";case 2:return this.stream.parseInteger(f,f+g);case 3:return this.sub?\"(\"+this.sub.length+\" elem)\":this.stream.parseBitString(f,f+g);case 4:return this.sub?\"(\"+this.sub.length+\" elem)\":this.stream.parseOctetString(f,f+g);case 6:return this.stream.parseOID(f,f+g);case 16:case 17:return\"(\"+this.sub.length+\" elem)\";case 12:return this.stream.parseStringUTF(f,f+g);case 18:case 19:case 20:case 21:case 22:case 26:return this.stream.parseStringISO(f,f+g);case 30:return this.stream.parseStringBMP(f,f+g);case 23:case 24:return this.stream.parseTime(f,f+g)}return null},c.prototype.toString=function(){return this.typeName()+\"@\"+this.stream.pos+\"[header:\"+this.header+\",length:\"+this.length+\",sub:\"+(null===this.sub?\"null\":this.sub.length)+\"]\"},c.prototype.print=function(b){if(b===a&&(b=\"\"),document.writeln(b+this),null!==this.sub){b+=\"  \";for(var c=0,d=this.sub.length;d>c;++c)this.sub[c].print(b)}},c.prototype.toPrettyString=function(b){b===a&&(b=\"\");var c=b+this.typeName()+\" @\"+this.stream.pos;if(this.length>=0&&(c+=\"+\"),c+=this.length,32&this.tag?c+=\" (constructed)\":3!=this.tag&&4!=this.tag||null===this.sub||(c+=\" (encapsulates)\"),c+=\"\\n\",null!==this.sub){b+=\"  \";for(var d=0,e=this.sub.length;e>d;++d)c+=this.sub[d].toPrettyString(b)}return c},c.prototype.toDOM=function(){var a=f.tag(\"div\",\"node\");a.asn1=this;var b=f.tag(\"div\",\"head\"),c=this.typeName().replace(/_/g,\" \");b.innerHTML=c;var d=this.content();if(null!==d){d=String(d).replace(/</g,\"&lt;\");var e=f.tag(\"span\",\"preview\");e.appendChild(f.text(d)),b.appendChild(e)}a.appendChild(b),this.node=a,this.head=b;var g=f.tag(\"div\",\"value\");if(c=\"Offset: \"+this.stream.pos+\"<br/>\",c+=\"Length: \"+this.header+\"+\",c+=this.length>=0?this.length:-this.length+\" (undefined)\",32&this.tag?c+=\"<br/>(constructed)\":3!=this.tag&&4!=this.tag||null===this.sub||(c+=\"<br/>(encapsulates)\"),null!==d&&(c+=\"<br/>Value:<br/><b>\"+d+\"</b>\",\"object\"==typeof oids&&6==this.tag)){var h=oids[d];h&&(h.d&&(c+=\"<br/>\"+h.d),h.c&&(c+=\"<br/>\"+h.c),h.w&&(c+=\"<br/>(warning!)\"))}g.innerHTML=c,a.appendChild(g);var i=f.tag(\"div\",\"sub\");if(null!==this.sub)for(var j=0,k=this.sub.length;k>j;++j)i.appendChild(this.sub[j].toDOM());return a.appendChild(i),b.onclick=function(){a.className=\"node collapsed\"==a.className?\"node\":\"node collapsed\"},a},c.prototype.posStart=function(){return this.stream.pos},c.prototype.posContent=function(){return this.stream.pos+this.header},c.prototype.posEnd=function(){return this.stream.pos+this.header+Math.abs(this.length)},c.prototype.fakeHover=function(a){this.node.className+=\" hover\",a&&(this.head.className+=\" hover\")},c.prototype.fakeOut=function(a){var b=/ ?hover/;this.node.className=this.node.className.replace(b,\"\"),a&&(this.head.className=this.head.className.replace(b,\"\"))},c.prototype.toHexDOM_sub=function(a,b,c,d,e){if(!(d>=e)){var g=f.tag(\"span\",b);g.appendChild(f.text(c.hexDump(d,e))),a.appendChild(g)}},c.prototype.toHexDOM=function(b){var c=f.tag(\"span\",\"hex\");if(b===a&&(b=c),this.head.hexNode=c,this.head.onmouseover=function(){this.hexNode.className=\"hexCurrent\"},this.head.onmouseout=function(){this.hexNode.className=\"hex\"},c.asn1=this,c.onmouseover=function(){var a=!b.selected;a&&(b.selected=this.asn1,this.className=\"hexCurrent\"),this.asn1.fakeHover(a)},c.onmouseout=function(){var a=b.selected==this.asn1;this.asn1.fakeOut(a),a&&(b.selected=null,this.className=\"hex\")},this.toHexDOM_sub(c,\"tag\",this.stream,this.posStart(),this.posStart()+1),this.toHexDOM_sub(c,this.length>=0?\"dlen\":\"ulen\",this.stream,this.posStart()+1,this.posContent()),null===this.sub)c.appendChild(f.text(this.stream.hexDump(this.posContent(),this.posEnd())));else if(this.sub.length>0){var d=this.sub[0],e=this.sub[this.sub.length-1];this.toHexDOM_sub(c,\"intro\",this.stream,this.posContent(),d.posStart());for(var g=0,h=this.sub.length;h>g;++g)c.appendChild(this.sub[g].toHexDOM(b));this.toHexDOM_sub(c,\"outro\",this.stream,e.posEnd(),this.posEnd())}return c},c.prototype.toHexString=function(){return this.stream.hexDump(this.posStart(),this.posEnd(),!0)},c.decodeLength=function(a){var b=a.get(),c=127&b;if(c==b)return c;if(c>3)throw\"Length over 24 bits not supported at position \"+(a.pos-1);if(0===c)return-1;b=0;for(var d=0;c>d;++d)b=b<<8|a.get();return b},c.hasContent=function(a,d,e){if(32&a)return!0;if(3>a||a>4)return!1;var f=new b(e);3==a&&f.get();var g=f.get();if(g>>6&1)return!1;try{var h=c.decodeLength(f);return f.pos-e.pos+h==d}catch(i){return!1}},c.decode=function(a){a instanceof b||(a=new b(a,0));var d=new b(a),e=a.get(),f=c.decodeLength(a),g=a.pos-d.pos,h=null;if(c.hasContent(e,f,a)){var i=a.pos;if(3==e&&a.get(),h=[],f>=0){for(var j=i+f;a.pos<j;)h[h.length]=c.decode(a);if(a.pos!=j)throw\"Content size is not correct for container starting at offset \"+i}else try{for(;;){var k=c.decode(a);if(0===k.tag)break;h[h.length]=k}f=i-a.pos}catch(l){throw\"Exception while decoding undefined length content: \"+l}}else a.pos+=f;return new c(d,g,f,e,h)},c.test=function(){for(var a=[{value:[39],expected:39},{value:[129,201],expected:201},{value:[131,254,220,186],expected:16702650}],d=0,e=a.length;e>d;++d){var f=new b(a[d].value,0),g=c.decodeLength(f);g!=a[d].expected&&document.write(\"In test[\"+d+\"] expected \"+a[d].expected+\" got \"+g+\"\\n\")}},window.ASN1=c}(),ASN1.prototype.getHexStringValue=function(){var a=this.toHexString(),b=2*this.header,c=2*this.length;return a.substr(b,c)},RSAKey.prototype.parseKey=function(a){try{var b=0,c=0,d=/^\\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\\s*)+$/,e=d.test(a)?Hex.decode(a):Base64.unarmor(a),f=ASN1.decode(e);if(3===f.sub.length&&(f=f.sub[2].sub[0]),9===f.sub.length){b=f.sub[1].getHexStringValue(),this.n=parseBigInt(b,16),c=f.sub[2].getHexStringValue(),this.e=parseInt(c,16);var g=f.sub[3].getHexStringValue();this.d=parseBigInt(g,16);var h=f.sub[4].getHexStringValue();this.p=parseBigInt(h,16);var i=f.sub[5].getHexStringValue();this.q=parseBigInt(i,16);var j=f.sub[6].getHexStringValue();this.dmp1=parseBigInt(j,16);var k=f.sub[7].getHexStringValue();this.dmq1=parseBigInt(k,16);var l=f.sub[8].getHexStringValue();this.coeff=parseBigInt(l,16)}else{if(2!==f.sub.length)return!1;var m=f.sub[1],n=m.sub[0];b=n.sub[0].getHexStringValue(),this.n=parseBigInt(b,16),c=n.sub[1].getHexStringValue(),this.e=parseInt(c,16)}return!0}catch(o){return!1}},RSAKey.prototype.getPrivateBaseKey=function(){var a={array:[new KJUR.asn1.DERInteger({\"int\":0}),new KJUR.asn1.DERInteger({bigint:this.n}),new KJUR.asn1.DERInteger({\"int\":this.e}),new KJUR.asn1.DERInteger({bigint:this.d}),new KJUR.asn1.DERInteger({bigint:this.p}),new KJUR.asn1.DERInteger({bigint:this.q}),new KJUR.asn1.DERInteger({bigint:this.dmp1}),new KJUR.asn1.DERInteger({bigint:this.dmq1}),new KJUR.asn1.DERInteger({bigint:this.coeff})]},b=new KJUR.asn1.DERSequence(a);return b.getEncodedHex()},RSAKey.prototype.getPrivateBaseKeyB64=function(){return hex2b64(this.getPrivateBaseKey())},RSAKey.prototype.getPublicBaseKey=function(){var a={array:[new KJUR.asn1.DERObjectIdentifier({oid:\"1.2.840.113549.1.1.1\"}),new KJUR.asn1.DERNull]},b=new KJUR.asn1.DERSequence(a);a={array:[new KJUR.asn1.DERInteger({bigint:this.n}),new KJUR.asn1.DERInteger({\"int\":this.e})]};var c=new KJUR.asn1.DERSequence(a);a={hex:\"00\"+c.getEncodedHex()};var d=new KJUR.asn1.DERBitString(a);a={array:[b,d]};var e=new KJUR.asn1.DERSequence(a);return e.getEncodedHex()},RSAKey.prototype.getPublicBaseKeyB64=function(){return hex2b64(this.getPublicBaseKey())},RSAKey.prototype.wordwrap=function(a,b){if(b=b||64,!a)return a;var c=\"(.{1,\"+b+\"})( +|$\\n?)|(.{1,\"+b+\"})\";return a.match(RegExp(c,\"g\")).join(\"\\n\")},RSAKey.prototype.getPrivateKey=function(){var a=\"-----BEGIN RSA PRIVATE KEY-----\\n\";return a+=this.wordwrap(this.getPrivateBaseKeyB64())+\"\\n\",a+=\"-----END RSA PRIVATE KEY-----\"},RSAKey.prototype.getPublicKey=function(){var a=\"-----BEGIN PUBLIC KEY-----\\n\";return a+=this.wordwrap(this.getPublicBaseKeyB64())+\"\\n\",a+=\"-----END PUBLIC KEY-----\"},RSAKey.prototype.hasPublicKeyProperty=function(a){return a=a||{},a.hasOwnProperty(\"n\")&&a.hasOwnProperty(\"e\")},RSAKey.prototype.hasPrivateKeyProperty=function(a){return a=a||{},a.hasOwnProperty(\"n\")&&a.hasOwnProperty(\"e\")&&a.hasOwnProperty(\"d\")&&a.hasOwnProperty(\"p\")&&a.hasOwnProperty(\"q\")&&a.hasOwnProperty(\"dmp1\")&&a.hasOwnProperty(\"dmq1\")&&a.hasOwnProperty(\"coeff\")},RSAKey.prototype.parsePropertiesFrom=function(a){this.n=a.n,this.e=a.e,a.hasOwnProperty(\"d\")&&(this.d=a.d,this.p=a.p,this.q=a.q,this.dmp1=a.dmp1,this.dmq1=a.dmq1,this.coeff=a.coeff)};var JSEncryptRSAKey=function(a){RSAKey.call(this),a&&(\"string\"==typeof a?this.parseKey(a):(this.hasPrivateKeyProperty(a)||this.hasPublicKeyProperty(a))&&this.parsePropertiesFrom(a))};JSEncryptRSAKey.prototype=new RSAKey,JSEncryptRSAKey.prototype.constructor=JSEncryptRSAKey;var JSEncrypt=function(a){a=a||{},this.default_key_size=parseInt(a.default_key_size)||1024,this.default_public_exponent=a.default_public_exponent||\"010001\",this.log=a.log||!1,this.key=null};JSEncrypt.prototype.setKey=function(a){this.log&&this.key&&console.warn(\"A key was already set, overriding existing.\"),this.key=new JSEncryptRSAKey(a)},JSEncrypt.prototype.setPrivateKey=function(a){this.setKey(a)},JSEncrypt.prototype.setPublicKey=function(a){this.setKey(a)},JSEncrypt.prototype.decrypt=function(a){try{return this.getKey().decrypt(b64tohex(a))}catch(b){return!1}},JSEncrypt.prototype.encrypt=function(a){try{return hex2b64(this.getKey().encrypt(a))}catch(b){return!1}},JSEncrypt.prototype.getKey=function(a){if(!this.key){if(this.key=new JSEncryptRSAKey,a&&\"[object Function]\"==={}.toString.call(a))return void this.key.generateAsync(this.default_key_size,this.default_public_exponent,a);this.key.generate(this.default_key_size,this.default_public_exponent)}return this.key},JSEncrypt.prototype.getPrivateKey=function(){return this.getKey().getPrivateKey()},JSEncrypt.prototype.getPrivateKeyB64=function(){return this.getKey().getPrivateBaseKeyB64()},JSEncrypt.prototype.getPublicKey=function(){return this.getKey().getPublicKey()},JSEncrypt.prototype.getPublicKeyB64=function(){return this.getKey().getPublicBaseKeyB64()};exports.JSEncrypt = JSEncrypt;\n})(JSEncryptExports);\nvar JSEncrypt = JSEncryptExports.JSEncrypt;\n"

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3)(__webpack_require__(6))

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "/*\nCryptoJS v3.1.2\ncode.google.com/p/crypto-js\n(c) 2009-2013 by Jeff Mott. All rights reserved.\ncode.google.com/p/crypto-js/wiki/License\n*/\nvar CryptoJS=CryptoJS||function(u,p){var d={},l=d.lib={},s=function(){},t=l.Base={extend:function(a){s.prototype=this;var c=new s;a&&c.mixIn(a);c.hasOwnProperty(\"init\")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty(\"toString\")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},\nr=l.WordArray=t.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=p?c:4*a.length},toString:function(a){return(a||v).stringify(this)},concat:function(a){var c=this.words,e=a.words,j=this.sigBytes;a=a.sigBytes;this.clamp();if(j%4)for(var k=0;k<a;k++)c[j+k>>>2]|=(e[k>>>2]>>>24-8*(k%4)&255)<<24-8*((j+k)%4);else if(65535<e.length)for(k=0;k<a;k+=4)c[j+k>>>2]=e[k>>>2];else c.push.apply(c,e);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<\n32-8*(c%4);a.length=u.ceil(c/4)},clone:function(){var a=t.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],e=0;e<a;e+=4)c.push(4294967296*u.random()|0);return new r.init(c,a)}}),w=d.enc={},v=w.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++){var k=c[j>>>2]>>>24-8*(j%4)&255;e.push((k>>>4).toString(16));e.push((k&15).toString(16))}return e.join(\"\")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j+=2)e[j>>>3]|=parseInt(a.substr(j,\n2),16)<<24-4*(j%8);return new r.init(e,c/2)}},b=w.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++)e.push(String.fromCharCode(c[j>>>2]>>>24-8*(j%4)&255));return e.join(\"\")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j++)e[j>>>2]|=(a.charCodeAt(j)&255)<<24-8*(j%4);return new r.init(e,c)}},x=w.Utf8={stringify:function(a){try{return decodeURIComponent(escape(b.stringify(a)))}catch(c){throw Error(\"Malformed UTF-8 data\");}},parse:function(a){return b.parse(unescape(encodeURIComponent(a)))}},\nq=l.BufferedBlockAlgorithm=t.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){\"string\"==typeof a&&(a=x.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,e=c.words,j=c.sigBytes,k=this.blockSize,b=j/(4*k),b=a?u.ceil(b):u.max((b|0)-this._minBufferSize,0);a=b*k;j=u.min(4*a,j);if(a){for(var q=0;q<a;q+=k)this._doProcessBlock(e,q);q=e.splice(0,a);c.sigBytes-=j}return new r.init(q,j)},clone:function(){var a=t.clone.call(this);\na._data=this._data.clone();return a},_minBufferSize:0});l.Hasher=q.extend({cfg:t.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){q.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,e){return(new a.init(e)).finalize(b)}},_createHmacHelper:function(a){return function(b,e){return(new n.HMAC.init(a,\ne)).finalize(b)}}});var n=d.algo={};return d}(Math);\n(function(){var u=CryptoJS,p=u.lib.WordArray;u.enc.Base64={stringify:function(d){var l=d.words,p=d.sigBytes,t=this._map;d.clamp();d=[];for(var r=0;r<p;r+=3)for(var w=(l[r>>>2]>>>24-8*(r%4)&255)<<16|(l[r+1>>>2]>>>24-8*((r+1)%4)&255)<<8|l[r+2>>>2]>>>24-8*((r+2)%4)&255,v=0;4>v&&r+0.75*v<p;v++)d.push(t.charAt(w>>>6*(3-v)&63));if(l=t.charAt(64))for(;d.length%4;)d.push(l);return d.join(\"\")},parse:function(d){var l=d.length,s=this._map,t=s.charAt(64);t&&(t=d.indexOf(t),-1!=t&&(l=t));for(var t=[],r=0,w=0;w<\nl;w++)if(w%4){var v=s.indexOf(d.charAt(w-1))<<2*(w%4),b=s.indexOf(d.charAt(w))>>>6-2*(w%4);t[r>>>2]|=(v|b)<<24-8*(r%4);r++}return p.create(t,r)},_map:\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\"}})();\n(function(u){function p(b,n,a,c,e,j,k){b=b+(n&a|~n&c)+e+k;return(b<<j|b>>>32-j)+n}function d(b,n,a,c,e,j,k){b=b+(n&c|a&~c)+e+k;return(b<<j|b>>>32-j)+n}function l(b,n,a,c,e,j,k){b=b+(n^a^c)+e+k;return(b<<j|b>>>32-j)+n}function s(b,n,a,c,e,j,k){b=b+(a^(n|~c))+e+k;return(b<<j|b>>>32-j)+n}for(var t=CryptoJS,r=t.lib,w=r.WordArray,v=r.Hasher,r=t.algo,b=[],x=0;64>x;x++)b[x]=4294967296*u.abs(u.sin(x+1))|0;r=r.MD5=v.extend({_doReset:function(){this._hash=new w.init([1732584193,4023233417,2562383102,271733878])},\n_doProcessBlock:function(q,n){for(var a=0;16>a;a++){var c=n+a,e=q[c];q[c]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360}var a=this._hash.words,c=q[n+0],e=q[n+1],j=q[n+2],k=q[n+3],z=q[n+4],r=q[n+5],t=q[n+6],w=q[n+7],v=q[n+8],A=q[n+9],B=q[n+10],C=q[n+11],u=q[n+12],D=q[n+13],E=q[n+14],x=q[n+15],f=a[0],m=a[1],g=a[2],h=a[3],f=p(f,m,g,h,c,7,b[0]),h=p(h,f,m,g,e,12,b[1]),g=p(g,h,f,m,j,17,b[2]),m=p(m,g,h,f,k,22,b[3]),f=p(f,m,g,h,z,7,b[4]),h=p(h,f,m,g,r,12,b[5]),g=p(g,h,f,m,t,17,b[6]),m=p(m,g,h,f,w,22,b[7]),\nf=p(f,m,g,h,v,7,b[8]),h=p(h,f,m,g,A,12,b[9]),g=p(g,h,f,m,B,17,b[10]),m=p(m,g,h,f,C,22,b[11]),f=p(f,m,g,h,u,7,b[12]),h=p(h,f,m,g,D,12,b[13]),g=p(g,h,f,m,E,17,b[14]),m=p(m,g,h,f,x,22,b[15]),f=d(f,m,g,h,e,5,b[16]),h=d(h,f,m,g,t,9,b[17]),g=d(g,h,f,m,C,14,b[18]),m=d(m,g,h,f,c,20,b[19]),f=d(f,m,g,h,r,5,b[20]),h=d(h,f,m,g,B,9,b[21]),g=d(g,h,f,m,x,14,b[22]),m=d(m,g,h,f,z,20,b[23]),f=d(f,m,g,h,A,5,b[24]),h=d(h,f,m,g,E,9,b[25]),g=d(g,h,f,m,k,14,b[26]),m=d(m,g,h,f,v,20,b[27]),f=d(f,m,g,h,D,5,b[28]),h=d(h,f,\nm,g,j,9,b[29]),g=d(g,h,f,m,w,14,b[30]),m=d(m,g,h,f,u,20,b[31]),f=l(f,m,g,h,r,4,b[32]),h=l(h,f,m,g,v,11,b[33]),g=l(g,h,f,m,C,16,b[34]),m=l(m,g,h,f,E,23,b[35]),f=l(f,m,g,h,e,4,b[36]),h=l(h,f,m,g,z,11,b[37]),g=l(g,h,f,m,w,16,b[38]),m=l(m,g,h,f,B,23,b[39]),f=l(f,m,g,h,D,4,b[40]),h=l(h,f,m,g,c,11,b[41]),g=l(g,h,f,m,k,16,b[42]),m=l(m,g,h,f,t,23,b[43]),f=l(f,m,g,h,A,4,b[44]),h=l(h,f,m,g,u,11,b[45]),g=l(g,h,f,m,x,16,b[46]),m=l(m,g,h,f,j,23,b[47]),f=s(f,m,g,h,c,6,b[48]),h=s(h,f,m,g,w,10,b[49]),g=s(g,h,f,m,\nE,15,b[50]),m=s(m,g,h,f,r,21,b[51]),f=s(f,m,g,h,u,6,b[52]),h=s(h,f,m,g,k,10,b[53]),g=s(g,h,f,m,B,15,b[54]),m=s(m,g,h,f,e,21,b[55]),f=s(f,m,g,h,v,6,b[56]),h=s(h,f,m,g,x,10,b[57]),g=s(g,h,f,m,t,15,b[58]),m=s(m,g,h,f,D,21,b[59]),f=s(f,m,g,h,z,6,b[60]),h=s(h,f,m,g,C,10,b[61]),g=s(g,h,f,m,j,15,b[62]),m=s(m,g,h,f,A,21,b[63]);a[0]=a[0]+f|0;a[1]=a[1]+m|0;a[2]=a[2]+g|0;a[3]=a[3]+h|0},_doFinalize:function(){var b=this._data,n=b.words,a=8*this._nDataBytes,c=8*b.sigBytes;n[c>>>5]|=128<<24-c%32;var e=u.floor(a/\n4294967296);n[(c+64>>>9<<4)+15]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360;n[(c+64>>>9<<4)+14]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(n.length+1);this._process();b=this._hash;n=b.words;for(a=0;4>a;a++)c=n[a],n[a]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return b},clone:function(){var b=v.clone.call(this);b._hash=this._hash.clone();return b}});t.MD5=v._createHelper(r);t.HmacMD5=v._createHmacHelper(r)})(Math);\n(function(){var u=CryptoJS,p=u.lib,d=p.Base,l=p.WordArray,p=u.algo,s=p.EvpKDF=d.extend({cfg:d.extend({keySize:4,hasher:p.MD5,iterations:1}),init:function(d){this.cfg=this.cfg.extend(d)},compute:function(d,r){for(var p=this.cfg,s=p.hasher.create(),b=l.create(),u=b.words,q=p.keySize,p=p.iterations;u.length<q;){n&&s.update(n);var n=s.update(d).finalize(r);s.reset();for(var a=1;a<p;a++)n=s.finalize(n),s.reset();b.concat(n)}b.sigBytes=4*q;return b}});u.EvpKDF=function(d,l,p){return s.create(p).compute(d,\nl)}})();\nCryptoJS.lib.Cipher||function(u){var p=CryptoJS,d=p.lib,l=d.Base,s=d.WordArray,t=d.BufferedBlockAlgorithm,r=p.enc.Base64,w=p.algo.EvpKDF,v=d.Cipher=t.extend({cfg:l.extend(),createEncryptor:function(e,a){return this.create(this._ENC_XFORM_MODE,e,a)},createDecryptor:function(e,a){return this.create(this._DEC_XFORM_MODE,e,a)},init:function(e,a,b){this.cfg=this.cfg.extend(b);this._xformMode=e;this._key=a;this.reset()},reset:function(){t.reset.call(this);this._doReset()},process:function(e){this._append(e);return this._process()},\nfinalize:function(e){e&&this._append(e);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(b,k,d){return(\"string\"==typeof k?c:a).encrypt(e,b,k,d)},decrypt:function(b,k,d){return(\"string\"==typeof k?c:a).decrypt(e,b,k,d)}}}});d.StreamCipher=v.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var b=p.mode={},x=function(e,a,b){var c=this._iv;c?this._iv=u:c=this._prevBlock;for(var d=0;d<b;d++)e[a+d]^=\nc[d]},q=(d.BlockCipherMode=l.extend({createEncryptor:function(e,a){return this.Encryptor.create(e,a)},createDecryptor:function(e,a){return this.Decryptor.create(e,a)},init:function(e,a){this._cipher=e;this._iv=a}})).extend();q.Encryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize;x.call(this,e,a,c);b.encryptBlock(e,a);this._prevBlock=e.slice(a,a+c)}});q.Decryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize,d=e.slice(a,a+c);b.decryptBlock(e,a);x.call(this,\ne,a,c);this._prevBlock=d}});b=b.CBC=q;q=(p.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,l=[],n=0;n<c;n+=4)l.push(d);c=s.create(l,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};d.BlockCipher=v.extend({cfg:v.cfg.extend({mode:b,padding:q}),reset:function(){v.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;this._mode=c.call(a,\nthis,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var n=d.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),b=(p.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;return(a?s.create([1398893684,\n1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=s.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return n.create({ciphertext:a,salt:c})}},a=d.SerializableCipher=l.extend({cfg:l.extend({format:b}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var l=a.createEncryptor(c,d);b=l.finalize(b);l=l.cfg;return n.create({ciphertext:b,key:c,iv:l.iv,algorithm:a,mode:l.mode,padding:l.padding,blockSize:a.blockSize,formatter:d.format})},\ndecrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return\"string\"==typeof a?b.parse(a,this):a}}),p=(p.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=s.random(8));a=w.create({keySize:b+c}).compute(a,d);c=s.create(a.words.slice(b),4*c);a.sigBytes=4*b;return n.create({key:a,iv:c,salt:d})}},c=d.PasswordBasedCipher=a.extend({cfg:a.cfg.extend({kdf:p}),encrypt:function(b,c,d,l){l=this.cfg.extend(l);d=l.kdf.execute(d,\nb.keySize,b.ivSize);l.iv=d.iv;b=a.encrypt.call(this,b,c,d.key,l);b.mixIn(d);return b},decrypt:function(b,c,d,l){l=this.cfg.extend(l);c=this._parse(c,l.format);d=l.kdf.execute(d,b.keySize,b.ivSize,c.salt);l.iv=d.iv;return a.decrypt.call(this,b,c,d.key,l)}})}();\n(function(){for(var u=CryptoJS,p=u.lib.BlockCipher,d=u.algo,l=[],s=[],t=[],r=[],w=[],v=[],b=[],x=[],q=[],n=[],a=[],c=0;256>c;c++)a[c]=128>c?c<<1:c<<1^283;for(var e=0,j=0,c=0;256>c;c++){var k=j^j<<1^j<<2^j<<3^j<<4,k=k>>>8^k&255^99;l[e]=k;s[k]=e;var z=a[e],F=a[z],G=a[F],y=257*a[k]^16843008*k;t[e]=y<<24|y>>>8;r[e]=y<<16|y>>>16;w[e]=y<<8|y>>>24;v[e]=y;y=16843009*G^65537*F^257*z^16843008*e;b[k]=y<<24|y>>>8;x[k]=y<<16|y>>>16;q[k]=y<<8|y>>>24;n[k]=y;e?(e=z^a[a[a[G^z]]],j^=a[a[j]]):e=j=1}var H=[0,1,2,4,8,\n16,32,64,128,27,54],d=d.AES=p.extend({_doReset:function(){for(var a=this._key,c=a.words,d=a.sigBytes/4,a=4*((this._nRounds=d+6)+1),e=this._keySchedule=[],j=0;j<a;j++)if(j<d)e[j]=c[j];else{var k=e[j-1];j%d?6<d&&4==j%d&&(k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255]):(k=k<<8|k>>>24,k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255],k^=H[j/d|0]<<24);e[j]=e[j-d]^k}c=this._invKeySchedule=[];for(d=0;d<a;d++)j=a-d,k=d%4?e[j]:e[j-4],c[d]=4>d||4>=j?k:b[l[k>>>24]]^x[l[k>>>16&255]]^q[l[k>>>\n8&255]]^n[l[k&255]]},encryptBlock:function(a,b){this._doCryptBlock(a,b,this._keySchedule,t,r,w,v,l)},decryptBlock:function(a,c){var d=a[c+1];a[c+1]=a[c+3];a[c+3]=d;this._doCryptBlock(a,c,this._invKeySchedule,b,x,q,n,s);d=a[c+1];a[c+1]=a[c+3];a[c+3]=d},_doCryptBlock:function(a,b,c,d,e,j,l,f){for(var m=this._nRounds,g=a[b]^c[0],h=a[b+1]^c[1],k=a[b+2]^c[2],n=a[b+3]^c[3],p=4,r=1;r<m;r++)var q=d[g>>>24]^e[h>>>16&255]^j[k>>>8&255]^l[n&255]^c[p++],s=d[h>>>24]^e[k>>>16&255]^j[n>>>8&255]^l[g&255]^c[p++],t=\nd[k>>>24]^e[n>>>16&255]^j[g>>>8&255]^l[h&255]^c[p++],n=d[n>>>24]^e[g>>>16&255]^j[h>>>8&255]^l[k&255]^c[p++],g=q,h=s,k=t;q=(f[g>>>24]<<24|f[h>>>16&255]<<16|f[k>>>8&255]<<8|f[n&255])^c[p++];s=(f[h>>>24]<<24|f[k>>>16&255]<<16|f[n>>>8&255]<<8|f[g&255])^c[p++];t=(f[k>>>24]<<24|f[n>>>16&255]<<16|f[g>>>8&255]<<8|f[h&255])^c[p++];n=(f[n>>>24]<<24|f[g>>>16&255]<<16|f[h>>>8&255]<<8|f[k&255])^c[p++];a[b]=q;a[b+1]=s;a[b+2]=t;a[b+3]=n},keySize:8});u.AES=p._createHelper(d)})();"

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3)(__webpack_require__(8))

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function q(b){throw b;}var t=void 0,u=!0,aa=this;function A(b,a){var c=b.split(\".\"),d=aa;!(c[0]in d)&&d.execScript&&d.execScript(\"var \"+c[0]);for(var e;c.length&&(e=c.shift());)!c.length&&a!==t?d[e]=a:d=d[e]?d[e]:d[e]={}};var B=\"undefined\"!==typeof Uint8Array&&\"undefined\"!==typeof Uint16Array&&\"undefined\"!==typeof Uint32Array&&\"undefined\"!==typeof DataView;function F(b,a){this.index=\"number\"===typeof a?a:0;this.m=0;this.buffer=b instanceof(B?Uint8Array:Array)?b:new (B?Uint8Array:Array)(32768);2*this.buffer.length<=this.index&&q(Error(\"invalid index\"));this.buffer.length<=this.index&&this.f()}F.prototype.f=function(){var b=this.buffer,a,c=b.length,d=new (B?Uint8Array:Array)(c<<1);if(B)d.set(b);else for(a=0;a<c;++a)d[a]=b[a];return this.buffer=d};\nF.prototype.d=function(b,a,c){var d=this.buffer,e=this.index,f=this.m,g=d[e],k;c&&1<a&&(b=8<a?(H[b&255]<<24|H[b>>>8&255]<<16|H[b>>>16&255]<<8|H[b>>>24&255])>>32-a:H[b]>>8-a);if(8>a+f)g=g<<a|b,f+=a;else for(k=0;k<a;++k)g=g<<1|b>>a-k-1&1,8===++f&&(f=0,d[e++]=H[g],g=0,e===d.length&&(d=this.f()));d[e]=g;this.buffer=d;this.m=f;this.index=e};F.prototype.finish=function(){var b=this.buffer,a=this.index,c;0<this.m&&(b[a]<<=8-this.m,b[a]=H[b[a]],a++);B?c=b.subarray(0,a):(b.length=a,c=b);return c};\nvar ba=new (B?Uint8Array:Array)(256),ca;for(ca=0;256>ca;++ca){for(var K=ca,da=K,ea=7,K=K>>>1;K;K>>>=1)da<<=1,da|=K&1,--ea;ba[ca]=(da<<ea&255)>>>0}var H=ba;function ja(b,a,c){var d,e=\"number\"===typeof a?a:a=0,f=\"number\"===typeof c?c:b.length;d=-1;for(e=f&7;e--;++a)d=d>>>8^O[(d^b[a])&255];for(e=f>>3;e--;a+=8)d=d>>>8^O[(d^b[a])&255],d=d>>>8^O[(d^b[a+1])&255],d=d>>>8^O[(d^b[a+2])&255],d=d>>>8^O[(d^b[a+3])&255],d=d>>>8^O[(d^b[a+4])&255],d=d>>>8^O[(d^b[a+5])&255],d=d>>>8^O[(d^b[a+6])&255],d=d>>>8^O[(d^b[a+7])&255];return(d^4294967295)>>>0}\nvar ka=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,\n2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,\n2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,\n2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,\n3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,\n936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],O=B?new Uint32Array(ka):ka;function P(){}P.prototype.getName=function(){return this.name};P.prototype.getData=function(){return this.data};P.prototype.Y=function(){return this.Z};A(\"Zlib.GunzipMember\",P);A(\"Zlib.GunzipMember.prototype.getName\",P.prototype.getName);A(\"Zlib.GunzipMember.prototype.getData\",P.prototype.getData);A(\"Zlib.GunzipMember.prototype.getMtime\",P.prototype.Y);function la(b){this.buffer=new (B?Uint16Array:Array)(2*b);this.length=0}la.prototype.getParent=function(b){return 2*((b-2)/4|0)};la.prototype.push=function(b,a){var c,d,e=this.buffer,f;c=this.length;e[this.length++]=a;for(e[this.length++]=b;0<c;)if(d=this.getParent(c),e[c]>e[d])f=e[c],e[c]=e[d],e[d]=f,f=e[c+1],e[c+1]=e[d+1],e[d+1]=f,c=d;else break;return this.length};\nla.prototype.pop=function(){var b,a,c=this.buffer,d,e,f;a=c[0];b=c[1];this.length-=2;c[0]=c[this.length];c[1]=c[this.length+1];for(f=0;;){e=2*f+2;if(e>=this.length)break;e+2<this.length&&c[e+2]>c[e]&&(e+=2);if(c[e]>c[f])d=c[f],c[f]=c[e],c[e]=d,d=c[f+1],c[f+1]=c[e+1],c[e+1]=d;else break;f=e}return{index:b,value:a,length:this.length}};function ma(b){var a=b.length,c=0,d=Number.POSITIVE_INFINITY,e,f,g,k,h,l,s,p,m,n;for(p=0;p<a;++p)b[p]>c&&(c=b[p]),b[p]<d&&(d=b[p]);e=1<<c;f=new (B?Uint32Array:Array)(e);g=1;k=0;for(h=2;g<=c;){for(p=0;p<a;++p)if(b[p]===g){l=0;s=k;for(m=0;m<g;++m)l=l<<1|s&1,s>>=1;n=g<<16|p;for(m=l;m<e;m+=h)f[m]=n;++k}++g;k<<=1;h<<=1}return[f,c,d]};function na(b,a){this.k=qa;this.I=0;this.input=B&&b instanceof Array?new Uint8Array(b):b;this.b=0;a&&(a.lazy&&(this.I=a.lazy),\"number\"===typeof a.compressionType&&(this.k=a.compressionType),a.outputBuffer&&(this.a=B&&a.outputBuffer instanceof Array?new Uint8Array(a.outputBuffer):a.outputBuffer),\"number\"===typeof a.outputIndex&&(this.b=a.outputIndex));this.a||(this.a=new (B?Uint8Array:Array)(32768))}var qa=2,ra={NONE:0,v:1,o:qa,ba:3},sa=[],S;\nfor(S=0;288>S;S++)switch(u){case 143>=S:sa.push([S+48,8]);break;case 255>=S:sa.push([S-144+400,9]);break;case 279>=S:sa.push([S-256+0,7]);break;case 287>=S:sa.push([S-280+192,8]);break;default:q(\"invalid literal: \"+S)}\nna.prototype.g=function(){var b,a,c,d,e=this.input;switch(this.k){case 0:c=0;for(d=e.length;c<d;){a=B?e.subarray(c,c+65535):e.slice(c,c+65535);c+=a.length;var f=a,g=c===d,k=t,h=t,l=t,s=t,p=t,m=this.a,n=this.b;if(B){for(m=new Uint8Array(this.a.buffer);m.length<=n+f.length+5;)m=new Uint8Array(m.length<<1);m.set(this.a)}k=g?1:0;m[n++]=k|0;h=f.length;l=~h+65536&65535;m[n++]=h&255;m[n++]=h>>>8&255;m[n++]=l&255;m[n++]=l>>>8&255;if(B)m.set(f,n),n+=f.length,m=m.subarray(0,n);else{s=0;for(p=f.length;s<p;++s)m[n++]=\nf[s];m.length=n}this.b=n;this.a=m}break;case 1:var r=new F(B?new Uint8Array(this.a.buffer):this.a,this.b);r.d(1,1,u);r.d(1,2,u);var v=ta(this,e),x,Q,y;x=0;for(Q=v.length;x<Q;x++)if(y=v[x],F.prototype.d.apply(r,sa[y]),256<y)r.d(v[++x],v[++x],u),r.d(v[++x],5),r.d(v[++x],v[++x],u);else if(256===y)break;this.a=r.finish();this.b=this.a.length;break;case qa:var E=new F(B?new Uint8Array(this.a.buffer):this.a,this.b),Ka,R,X,Y,Z,pb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],fa,La,ga,Ma,oa,wa=Array(19),\nNa,$,pa,C,Oa;Ka=qa;E.d(1,1,u);E.d(Ka,2,u);R=ta(this,e);fa=ua(this.W,15);La=va(fa);ga=ua(this.V,7);Ma=va(ga);for(X=286;257<X&&0===fa[X-1];X--);for(Y=30;1<Y&&0===ga[Y-1];Y--);var Pa=X,Qa=Y,J=new (B?Uint32Array:Array)(Pa+Qa),w,L,z,ha,I=new (B?Uint32Array:Array)(316),G,D,M=new (B?Uint8Array:Array)(19);for(w=L=0;w<Pa;w++)J[L++]=fa[w];for(w=0;w<Qa;w++)J[L++]=ga[w];if(!B){w=0;for(ha=M.length;w<ha;++w)M[w]=0}w=G=0;for(ha=J.length;w<ha;w+=L){for(L=1;w+L<ha&&J[w+L]===J[w];++L);z=L;if(0===J[w])if(3>z)for(;0<\nz--;)I[G++]=0,M[0]++;else for(;0<z;)D=138>z?z:138,D>z-3&&D<z&&(D=z-3),10>=D?(I[G++]=17,I[G++]=D-3,M[17]++):(I[G++]=18,I[G++]=D-11,M[18]++),z-=D;else if(I[G++]=J[w],M[J[w]]++,z--,3>z)for(;0<z--;)I[G++]=J[w],M[J[w]]++;else for(;0<z;)D=6>z?z:6,D>z-3&&D<z&&(D=z-3),I[G++]=16,I[G++]=D-3,M[16]++,z-=D}b=B?I.subarray(0,G):I.slice(0,G);oa=ua(M,7);for(C=0;19>C;C++)wa[C]=oa[pb[C]];for(Z=19;4<Z&&0===wa[Z-1];Z--);Na=va(oa);E.d(X-257,5,u);E.d(Y-1,5,u);E.d(Z-4,4,u);for(C=0;C<Z;C++)E.d(wa[C],3,u);C=0;for(Oa=b.length;C<\nOa;C++)if($=b[C],E.d(Na[$],oa[$],u),16<=$){C++;switch($){case 16:pa=2;break;case 17:pa=3;break;case 18:pa=7;break;default:q(\"invalid code: \"+$)}E.d(b[C],pa,u)}var Ra=[La,fa],Sa=[Ma,ga],N,Ta,ia,za,Ua,Va,Wa,Xa;Ua=Ra[0];Va=Ra[1];Wa=Sa[0];Xa=Sa[1];N=0;for(Ta=R.length;N<Ta;++N)if(ia=R[N],E.d(Ua[ia],Va[ia],u),256<ia)E.d(R[++N],R[++N],u),za=R[++N],E.d(Wa[za],Xa[za],u),E.d(R[++N],R[++N],u);else if(256===ia)break;this.a=E.finish();this.b=this.a.length;break;default:q(\"invalid compression type\")}return this.a};\nfunction xa(b,a){this.length=b;this.Q=a}\nvar ya=function(){function b(a){switch(u){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,\na-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:q(\"invalid length: \"+a)}}var a=[],c,d;for(c=3;258>=c;c++)d=b(c),a[c]=d[2]<<24|d[1]<<\n16|d[0];return a}(),Aa=B?new Uint32Array(ya):ya;\nfunction ta(b,a){function c(a,c){var b=a.Q,d=[],e=0,f;f=Aa[a.length];d[e++]=f&65535;d[e++]=f>>16&255;d[e++]=f>>24;var g;switch(u){case 1===b:g=[0,b-1,0];break;case 2===b:g=[1,b-2,0];break;case 3===b:g=[2,b-3,0];break;case 4===b:g=[3,b-4,0];break;case 6>=b:g=[4,b-5,1];break;case 8>=b:g=[5,b-7,1];break;case 12>=b:g=[6,b-9,2];break;case 16>=b:g=[7,b-13,2];break;case 24>=b:g=[8,b-17,3];break;case 32>=b:g=[9,b-25,3];break;case 48>=b:g=[10,b-33,4];break;case 64>=b:g=[11,b-49,4];break;case 96>=b:g=[12,b-\n65,5];break;case 128>=b:g=[13,b-97,5];break;case 192>=b:g=[14,b-129,6];break;case 256>=b:g=[15,b-193,6];break;case 384>=b:g=[16,b-257,7];break;case 512>=b:g=[17,b-385,7];break;case 768>=b:g=[18,b-513,8];break;case 1024>=b:g=[19,b-769,8];break;case 1536>=b:g=[20,b-1025,9];break;case 2048>=b:g=[21,b-1537,9];break;case 3072>=b:g=[22,b-2049,10];break;case 4096>=b:g=[23,b-3073,10];break;case 6144>=b:g=[24,b-4097,11];break;case 8192>=b:g=[25,b-6145,11];break;case 12288>=b:g=[26,b-8193,12];break;case 16384>=\nb:g=[27,b-12289,12];break;case 24576>=b:g=[28,b-16385,13];break;case 32768>=b:g=[29,b-24577,13];break;default:q(\"invalid distance\")}f=g;d[e++]=f[0];d[e++]=f[1];d[e++]=f[2];var h,k;h=0;for(k=d.length;h<k;++h)m[n++]=d[h];v[d[0]]++;x[d[3]]++;r=a.length+c-1;p=null}var d,e,f,g,k,h={},l,s,p,m=B?new Uint16Array(2*a.length):[],n=0,r=0,v=new (B?Uint32Array:Array)(286),x=new (B?Uint32Array:Array)(30),Q=b.I,y;if(!B){for(f=0;285>=f;)v[f++]=0;for(f=0;29>=f;)x[f++]=0}v[256]=1;d=0;for(e=a.length;d<e;++d){f=k=0;\nfor(g=3;f<g&&d+f!==e;++f)k=k<<8|a[d+f];h[k]===t&&(h[k]=[]);l=h[k];if(!(0<r--)){for(;0<l.length&&32768<d-l[0];)l.shift();if(d+3>=e){p&&c(p,-1);f=0;for(g=e-d;f<g;++f)y=a[d+f],m[n++]=y,++v[y];break}0<l.length?(s=Ba(a,d,l),p?p.length<s.length?(y=a[d-1],m[n++]=y,++v[y],c(s,0)):c(p,-1):s.length<Q?p=s:c(s,0)):p?c(p,-1):(y=a[d],m[n++]=y,++v[y])}l.push(d)}m[n++]=256;v[256]++;b.W=v;b.V=x;return B?m.subarray(0,n):m}\nfunction Ba(b,a,c){var d,e,f=0,g,k,h,l,s=b.length;k=0;l=c.length;a:for(;k<l;k++){d=c[l-k-1];g=3;if(3<f){for(h=f;3<h;h--)if(b[d+h-1]!==b[a+h-1])continue a;g=f}for(;258>g&&a+g<s&&b[d+g]===b[a+g];)++g;g>f&&(e=d,f=g);if(258===g)break}return new xa(f,a-e)}\nfunction ua(b,a){var c=b.length,d=new la(572),e=new (B?Uint8Array:Array)(c),f,g,k,h,l;if(!B)for(h=0;h<c;h++)e[h]=0;for(h=0;h<c;++h)0<b[h]&&d.push(h,b[h]);f=Array(d.length/2);g=new (B?Uint32Array:Array)(d.length/2);if(1===f.length)return e[d.pop().index]=1,e;h=0;for(l=d.length/2;h<l;++h)f[h]=d.pop(),g[h]=f[h].value;k=Ca(g,g.length,a);h=0;for(l=f.length;h<l;++h)e[f[h].index]=k[h];return e}\nfunction Ca(b,a,c){function d(b){var c=h[b][l[b]];c===a?(d(b+1),d(b+1)):--g[c];++l[b]}var e=new (B?Uint16Array:Array)(c),f=new (B?Uint8Array:Array)(c),g=new (B?Uint8Array:Array)(a),k=Array(c),h=Array(c),l=Array(c),s=(1<<c)-a,p=1<<c-1,m,n,r,v,x;e[c-1]=a;for(n=0;n<c;++n)s<p?f[n]=0:(f[n]=1,s-=p),s<<=1,e[c-2-n]=(e[c-1-n]/2|0)+a;e[0]=f[0];k[0]=Array(e[0]);h[0]=Array(e[0]);for(n=1;n<c;++n)e[n]>2*e[n-1]+f[n]&&(e[n]=2*e[n-1]+f[n]),k[n]=Array(e[n]),h[n]=Array(e[n]);for(m=0;m<a;++m)g[m]=c;for(r=0;r<e[c-1];++r)k[c-\n1][r]=b[r],h[c-1][r]=r;for(m=0;m<c;++m)l[m]=0;1===f[c-1]&&(--g[0],++l[c-1]);for(n=c-2;0<=n;--n){v=m=0;x=l[n+1];for(r=0;r<e[n];r++)v=k[n+1][x]+k[n+1][x+1],v>b[m]?(k[n][r]=v,h[n][r]=a,x+=2):(k[n][r]=b[m],h[n][r]=m,++m);l[n]=0;1===f[n]&&d(n)}return g}\nfunction va(b){var a=new (B?Uint16Array:Array)(b.length),c=[],d=[],e=0,f,g,k,h;f=0;for(g=b.length;f<g;f++)c[b[f]]=(c[b[f]]|0)+1;f=1;for(g=16;f<=g;f++)d[f]=e,e+=c[f]|0,e<<=1;f=0;for(g=b.length;f<g;f++){e=d[b[f]];d[b[f]]+=1;k=a[f]=0;for(h=b[f];k<h;k++)a[f]=a[f]<<1|e&1,e>>>=1}return a};function Da(b,a){this.input=b;this.b=this.c=0;this.i={};a&&(a.flags&&(this.i=a.flags),\"string\"===typeof a.filename&&(this.filename=a.filename),\"string\"===typeof a.comment&&(this.A=a.comment),a.deflateOptions&&(this.l=a.deflateOptions));this.l||(this.l={})}\nDa.prototype.g=function(){var b,a,c,d,e,f,g,k,h=new (B?Uint8Array:Array)(32768),l=0,s=this.input,p=this.c,m=this.filename,n=this.A;h[l++]=31;h[l++]=139;h[l++]=8;b=0;this.i.fname&&(b|=Ea);this.i.fcomment&&(b|=Fa);this.i.fhcrc&&(b|=Ga);h[l++]=b;a=(Date.now?Date.now():+new Date)/1E3|0;h[l++]=a&255;h[l++]=a>>>8&255;h[l++]=a>>>16&255;h[l++]=a>>>24&255;h[l++]=0;h[l++]=Ha;if(this.i.fname!==t){g=0;for(k=m.length;g<k;++g)f=m.charCodeAt(g),255<f&&(h[l++]=f>>>8&255),h[l++]=f&255;h[l++]=0}if(this.i.comment){g=\n0;for(k=n.length;g<k;++g)f=n.charCodeAt(g),255<f&&(h[l++]=f>>>8&255),h[l++]=f&255;h[l++]=0}this.i.fhcrc&&(c=ja(h,0,l)&65535,h[l++]=c&255,h[l++]=c>>>8&255);this.l.outputBuffer=h;this.l.outputIndex=l;e=new na(s,this.l);h=e.g();l=e.b;B&&(l+8>h.buffer.byteLength?(this.a=new Uint8Array(l+8),this.a.set(new Uint8Array(h.buffer)),h=this.a):h=new Uint8Array(h.buffer));d=ja(s,t,t);h[l++]=d&255;h[l++]=d>>>8&255;h[l++]=d>>>16&255;h[l++]=d>>>24&255;k=s.length;h[l++]=k&255;h[l++]=k>>>8&255;h[l++]=k>>>16&255;h[l++]=\nk>>>24&255;this.c=p;B&&l<h.length&&(this.a=h=h.subarray(0,l));return h};var Ha=255,Ga=2,Ea=8,Fa=16;A(\"Zlib.Gzip\",Da);A(\"Zlib.Gzip.prototype.compress\",Da.prototype.g);function T(b,a){this.p=[];this.q=32768;this.e=this.j=this.c=this.u=0;this.input=B?new Uint8Array(b):b;this.w=!1;this.r=Ia;this.M=!1;if(a||!(a={}))a.index&&(this.c=a.index),a.bufferSize&&(this.q=a.bufferSize),a.bufferType&&(this.r=a.bufferType),a.resize&&(this.M=a.resize);switch(this.r){case Ja:this.b=32768;this.a=new (B?Uint8Array:Array)(32768+this.q+258);break;case Ia:this.b=0;this.a=new (B?Uint8Array:Array)(this.q);this.f=this.U;this.B=this.R;this.s=this.T;break;default:q(Error(\"invalid inflate mode\"))}}\nvar Ja=0,Ia=1,Ya={O:Ja,N:Ia};\nT.prototype.h=function(){for(;!this.w;){var b=U(this,3);b&1&&(this.w=u);b>>>=1;switch(b){case 0:var a=this.input,c=this.c,d=this.a,e=this.b,f=a.length,g=t,k=t,h=d.length,l=t;this.e=this.j=0;c+1>=f&&q(Error(\"invalid uncompressed block header: LEN\"));g=a[c++]|a[c++]<<8;c+1>=f&&q(Error(\"invalid uncompressed block header: NLEN\"));k=a[c++]|a[c++]<<8;g===~k&&q(Error(\"invalid uncompressed block header: length verify\"));c+g>a.length&&q(Error(\"input buffer is broken\"));switch(this.r){case Ja:for(;e+g>d.length;){l=\nh-e;g-=l;if(B)d.set(a.subarray(c,c+l),e),e+=l,c+=l;else for(;l--;)d[e++]=a[c++];this.b=e;d=this.f();e=this.b}break;case Ia:for(;e+g>d.length;)d=this.f({F:2});break;default:q(Error(\"invalid inflate mode\"))}if(B)d.set(a.subarray(c,c+g),e),e+=g,c+=g;else for(;g--;)d[e++]=a[c++];this.c=c;this.b=e;this.a=d;break;case 1:this.s(Za,$a);break;case 2:ab(this);break;default:q(Error(\"unknown BTYPE: \"+b))}}return this.B()};\nvar bb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],cb=B?new Uint16Array(bb):bb,db=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],eb=B?new Uint16Array(db):db,fb=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],gb=B?new Uint8Array(fb):fb,hb=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],ib=B?new Uint16Array(hb):hb,jb=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,\n10,11,11,12,12,13,13],kb=B?new Uint8Array(jb):jb,lb=new (B?Uint8Array:Array)(288),V,mb;V=0;for(mb=lb.length;V<mb;++V)lb[V]=143>=V?8:255>=V?9:279>=V?7:8;var Za=ma(lb),nb=new (B?Uint8Array:Array)(30),ob,qb;ob=0;for(qb=nb.length;ob<qb;++ob)nb[ob]=5;var $a=ma(nb);function U(b,a){for(var c=b.j,d=b.e,e=b.input,f=b.c,g=e.length,k;d<a;)f>=g&&q(Error(\"input buffer is broken\")),c|=e[f++]<<d,d+=8;k=c&(1<<a)-1;b.j=c>>>a;b.e=d-a;b.c=f;return k}\nfunction rb(b,a){for(var c=b.j,d=b.e,e=b.input,f=b.c,g=e.length,k=a[0],h=a[1],l,s;d<h&&!(f>=g);)c|=e[f++]<<d,d+=8;l=k[c&(1<<h)-1];s=l>>>16;b.j=c>>s;b.e=d-s;b.c=f;return l&65535}\nfunction ab(b){function a(a,b,c){var d,e=this.J,f,g;for(g=0;g<a;)switch(d=rb(this,b),d){case 16:for(f=3+U(this,2);f--;)c[g++]=e;break;case 17:for(f=3+U(this,3);f--;)c[g++]=0;e=0;break;case 18:for(f=11+U(this,7);f--;)c[g++]=0;e=0;break;default:e=c[g++]=d}this.J=e;return c}var c=U(b,5)+257,d=U(b,5)+1,e=U(b,4)+4,f=new (B?Uint8Array:Array)(cb.length),g,k,h,l;for(l=0;l<e;++l)f[cb[l]]=U(b,3);if(!B){l=e;for(e=f.length;l<e;++l)f[cb[l]]=0}g=ma(f);k=new (B?Uint8Array:Array)(c);h=new (B?Uint8Array:Array)(d);\nb.J=0;b.s(ma(a.call(b,c,g,k)),ma(a.call(b,d,g,h)))}T.prototype.s=function(b,a){var c=this.a,d=this.b;this.C=b;for(var e=c.length-258,f,g,k,h;256!==(f=rb(this,b));)if(256>f)d>=e&&(this.b=d,c=this.f(),d=this.b),c[d++]=f;else{g=f-257;h=eb[g];0<gb[g]&&(h+=U(this,gb[g]));f=rb(this,a);k=ib[f];0<kb[f]&&(k+=U(this,kb[f]));d>=e&&(this.b=d,c=this.f(),d=this.b);for(;h--;)c[d]=c[d++-k]}for(;8<=this.e;)this.e-=8,this.c--;this.b=d};\nT.prototype.T=function(b,a){var c=this.a,d=this.b;this.C=b;for(var e=c.length,f,g,k,h;256!==(f=rb(this,b));)if(256>f)d>=e&&(c=this.f(),e=c.length),c[d++]=f;else{g=f-257;h=eb[g];0<gb[g]&&(h+=U(this,gb[g]));f=rb(this,a);k=ib[f];0<kb[f]&&(k+=U(this,kb[f]));d+h>e&&(c=this.f(),e=c.length);for(;h--;)c[d]=c[d++-k]}for(;8<=this.e;)this.e-=8,this.c--;this.b=d};\nT.prototype.f=function(){var b=new (B?Uint8Array:Array)(this.b-32768),a=this.b-32768,c,d,e=this.a;if(B)b.set(e.subarray(32768,b.length));else{c=0;for(d=b.length;c<d;++c)b[c]=e[c+32768]}this.p.push(b);this.u+=b.length;if(B)e.set(e.subarray(a,a+32768));else for(c=0;32768>c;++c)e[c]=e[a+c];this.b=32768;return e};\nT.prototype.U=function(b){var a,c=this.input.length/this.c+1|0,d,e,f,g=this.input,k=this.a;b&&(\"number\"===typeof b.F&&(c=b.F),\"number\"===typeof b.P&&(c+=b.P));2>c?(d=(g.length-this.c)/this.C[2],f=258*(d/2)|0,e=f<k.length?k.length+f:k.length<<1):e=k.length*c;B?(a=new Uint8Array(e),a.set(k)):a=k;return this.a=a};\nT.prototype.B=function(){var b=0,a=this.a,c=this.p,d,e=new (B?Uint8Array:Array)(this.u+(this.b-32768)),f,g,k,h;if(0===c.length)return B?this.a.subarray(32768,this.b):this.a.slice(32768,this.b);f=0;for(g=c.length;f<g;++f){d=c[f];k=0;for(h=d.length;k<h;++k)e[b++]=d[k]}f=32768;for(g=this.b;f<g;++f)e[b++]=a[f];this.p=[];return this.buffer=e};\nT.prototype.R=function(){var b,a=this.b;B?this.M?(b=new Uint8Array(a),b.set(this.a.subarray(0,a))):b=this.a.subarray(0,a):(this.a.length>a&&(this.a.length=a),b=this.a);return this.buffer=b};function sb(b){this.input=b;this.c=0;this.t=[];this.D=!1}sb.prototype.X=function(){this.D||this.h();return this.t.slice()};\nsb.prototype.h=function(){for(var b=this.input.length;this.c<b;){var a=new P,c=t,d=t,e=t,f=t,g=t,k=t,h=t,l=t,s=t,p=this.input,m=this.c;a.G=p[m++];a.H=p[m++];(31!==a.G||139!==a.H)&&q(Error(\"invalid file signature:\"+a.G+\",\"+a.H));a.z=p[m++];switch(a.z){case 8:break;default:q(Error(\"unknown compression method: \"+a.z))}a.n=p[m++];l=p[m++]|p[m++]<<8|p[m++]<<16|p[m++]<<24;a.Z=new Date(1E3*l);a.fa=p[m++];a.ea=p[m++];0<(a.n&4)&&(a.aa=p[m++]|p[m++]<<8,m+=a.aa);if(0<(a.n&Ea)){h=[];for(k=0;0<(g=p[m++]);)h[k++]=\nString.fromCharCode(g);a.name=h.join(\"\")}if(0<(a.n&Fa)){h=[];for(k=0;0<(g=p[m++]);)h[k++]=String.fromCharCode(g);a.A=h.join(\"\")}0<(a.n&Ga)&&(a.S=ja(p,0,m)&65535,a.S!==(p[m++]|p[m++]<<8)&&q(Error(\"invalid header crc16\")));c=p[p.length-4]|p[p.length-3]<<8|p[p.length-2]<<16|p[p.length-1]<<24;p.length-m-4-4<512*c&&(f=c);d=new T(p,{index:m,bufferSize:f});a.data=e=d.h();m=d.c;a.ca=s=(p[m++]|p[m++]<<8|p[m++]<<16|p[m++]<<24)>>>0;ja(e,t,t)!==s&&q(Error(\"invalid CRC-32 checksum: 0x\"+ja(e,t,t).toString(16)+\n\" / 0x\"+s.toString(16)));a.da=c=(p[m++]|p[m++]<<8|p[m++]<<16|p[m++]<<24)>>>0;(e.length&4294967295)!==c&&q(Error(\"invalid input size: \"+(e.length&4294967295)+\" / \"+c));this.t.push(a);this.c=m}this.D=u;var n=this.t,r,v,x=0,Q=0,y;r=0;for(v=n.length;r<v;++r)Q+=n[r].data.length;if(B){y=new Uint8Array(Q);for(r=0;r<v;++r)y.set(n[r].data,x),x+=n[r].data.length}else{y=[];for(r=0;r<v;++r)y[r]=n[r].data;y=Array.prototype.concat.apply([],y)}return y};A(\"Zlib.Gunzip\",sb);A(\"Zlib.Gunzip.prototype.decompress\",sb.prototype.h);A(\"Zlib.Gunzip.prototype.getMembers\",sb.prototype.X);function tb(b){if(\"string\"===typeof b){var a=b.split(\"\"),c,d;c=0;for(d=a.length;c<d;c++)a[c]=(a[c].charCodeAt(0)&255)>>>0;b=a}for(var e=1,f=0,g=b.length,k,h=0;0<g;){k=1024<g?1024:g;g-=k;do e+=b[h++],f+=e;while(--k);e%=65521;f%=65521}return(f<<16|e)>>>0};function ub(b,a){var c,d;this.input=b;this.c=0;if(a||!(a={}))a.index&&(this.c=a.index),a.verify&&(this.$=a.verify);c=b[this.c++];d=b[this.c++];switch(c&15){case vb:this.method=vb;break;default:q(Error(\"unsupported compression method\"))}0!==((c<<8)+d)%31&&q(Error(\"invalid fcheck flag:\"+((c<<8)+d)%31));d&32&&q(Error(\"fdict flag is not supported\"));this.L=new T(b,{index:this.c,bufferSize:a.bufferSize,bufferType:a.bufferType,resize:a.resize})}\nub.prototype.h=function(){var b=this.input,a,c;a=this.L.h();this.c=this.L.c;this.$&&(c=(b[this.c++]<<24|b[this.c++]<<16|b[this.c++]<<8|b[this.c++])>>>0,c!==tb(a)&&q(Error(\"invalid adler-32 checksum\")));return a};var vb=8;function wb(b,a){this.input=b;this.a=new (B?Uint8Array:Array)(32768);this.k=W.o;var c={},d;if((a||!(a={}))&&\"number\"===typeof a.compressionType)this.k=a.compressionType;for(d in a)c[d]=a[d];c.outputBuffer=this.a;this.K=new na(this.input,c)}var W=ra;\nwb.prototype.g=function(){var b,a,c,d,e,f,g,k=0;g=this.a;b=vb;switch(b){case vb:a=Math.LOG2E*Math.log(32768)-8;break;default:q(Error(\"invalid compression method\"))}c=a<<4|b;g[k++]=c;switch(b){case vb:switch(this.k){case W.NONE:e=0;break;case W.v:e=1;break;case W.o:e=2;break;default:q(Error(\"unsupported compression type\"))}break;default:q(Error(\"invalid compression method\"))}d=e<<6|0;g[k++]=d|31-(256*c+d)%31;f=tb(this.input);this.K.b=k;g=this.K.g();k=g.length;B&&(g=new Uint8Array(g.buffer),g.length<=\nk+4&&(this.a=new Uint8Array(g.length+4),this.a.set(g),g=this.a),g=g.subarray(0,k+4));g[k++]=f>>24&255;g[k++]=f>>16&255;g[k++]=f>>8&255;g[k++]=f&255;return g};function xb(b,a){var c,d,e,f;if(Object.keys)c=Object.keys(a);else for(d in c=[],e=0,a)c[e++]=d;e=0;for(f=c.length;e<f;++e)d=c[e],A(b+\".\"+d,a[d])};A(\"Zlib.Inflate\",ub);A(\"Zlib.Inflate.prototype.decompress\",ub.prototype.h);xb(\"Zlib.Inflate.BufferType\",{ADAPTIVE:Ya.N,BLOCK:Ya.O});A(\"Zlib.Deflate\",wb);A(\"Zlib.Deflate.compress\",function(b,a){return(new wb(b,a)).g()});A(\"Zlib.Deflate.prototype.compress\",wb.prototype.g);xb(\"Zlib.Deflate.CompressionType\",{NONE:W.NONE,FIXED:W.v,DYNAMIC:W.o});}).call(this); //@ sourceMappingURL=zlib_and_gzip.min.js.map\n"

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	  * $script.js JS loader & dependency manager
	  * https://github.com/ded/script.js
	  * (c) Dustin Diaz 2014 | License MIT
	  */

	(function (name, definition) {
	  if (typeof module != 'undefined' && module.exports) module.exports = definition()
	  else if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  else this[name] = definition()
	})('$script', function () {
	  var doc = document
	    , head = doc.getElementsByTagName('head')[0]
	    , s = 'string'
	    , f = false
	    , push = 'push'
	    , readyState = 'readyState'
	    , onreadystatechange = 'onreadystatechange'
	    , list = {}
	    , ids = {}
	    , delay = {}
	    , scripts = {}
	    , scriptpath
	    , urlArgs

	  function every(ar, fn) {
	    for (var i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return f
	    return 1
	  }
	  function each(ar, fn) {
	    every(ar, function (el) {
	      return !fn(el)
	    })
	  }

	  function $script(paths, idOrDone, optDone) {
	    paths = paths[push] ? paths : [paths]
	    var idOrDoneIsDone = idOrDone && idOrDone.call
	      , done = idOrDoneIsDone ? idOrDone : optDone
	      , id = idOrDoneIsDone ? paths.join('') : idOrDone
	      , queue = paths.length
	    function loopFn(item) {
	      return item.call ? item() : list[item]
	    }
	    function callback() {
	      if (!--queue) {
	        list[id] = 1
	        done && done()
	        for (var dset in delay) {
	          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = [])
	        }
	      }
	    }
	    setTimeout(function () {
	      each(paths, function loading(path, force) {
	        if (path === null) return callback()
	        
	        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
	          path = (path.indexOf('.js') === -1) ? scriptpath + path + '.js' : scriptpath + path;
	        }
	        
	        if (scripts[path]) {
	          if (id) ids[id] = 1
	          return (scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
	        }

	        scripts[path] = 1
	        if (id) ids[id] = 1
	        create(path, callback)
	      })
	    }, 0)
	    return $script
	  }

	  function create(path, fn) {
	    var el = doc.createElement('script'), loaded
	    el.onload = el.onerror = el[onreadystatechange] = function () {
	      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
	      el.onload = el[onreadystatechange] = null
	      loaded = 1
	      scripts[path] = 2
	      fn()
	    }
	    el.async = 1
	    el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
	    head.insertBefore(el, head.lastChild)
	  }

	  $script.get = create

	  $script.order = function (scripts, id, done) {
	    (function callback(s) {
	      s = scripts.shift()
	      !scripts.length ? $script(s, id, done) : $script(s, callback)
	    }())
	  }

	  $script.path = function (p) {
	    scriptpath = p
	  }
	  $script.urlArgs = function (str) {
	    urlArgs = str;
	  }
	  $script.ready = function (deps, ready, req) {
	    deps = deps[push] ? deps : [deps]
	    var missing = [];
	    !each(deps, function (dep) {
	      list[dep] || missing[push](dep);
	    }) && every(deps, function (dep) {return list[dep]}) ?
	      ready() : !function (key) {
	      delay[key] = delay[key] || []
	      delay[key][push](ready)
	      req && req(missing)
	    }(deps.join('|'))
	    return $script
	  }

	  $script.done = function (idOrDone) {
	    $script([null], idOrDone)
	  }

	  return $script
	});


/***/ }
/******/ ]);