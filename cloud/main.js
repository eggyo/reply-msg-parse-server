var appQueryLimit = 9999;
var wordcut = require("wordcut");
var _ = require('underscore');

wordcut.init();

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('testMsg', function(req, res) {
  var msgFromUser = req.params.msg;
  console.log("msg from user:" + msgFromUser);
  res.success({
    "msg": msgFromUser,
    "replyMsg": "FUCK"
  });
});

Parse.Cloud.define('getReplyMsg', function(request, response) {
  var MSG = Parse.Object.extend("Message");
  var query = new Parse.Query(MSG);
  var msgFromUser = request.params.msg;
  console.log("request:" + request.params["msg"]);
  console.log("msg from user:" + msgFromUser);
  if (msgFromUser == null) {
    response.error("request null values");
  } else {
    query.equalTo("msg", msgFromUser);
    query.limit(appQueryLimit);
    query.find({
      success: function(msgResponse) {
        var contents = [];
        if (msgResponse.length == 0) {
          response.success({
            "msg": msgFromUser,
            "replyMsg": ""
          });
        } else {
          contents = msgResponse[0].get("replyMsg");
          console.log("msgResponse:" + msgResponse);
          console.log("contents:" + contents);
          var replyCount = contents.length;
          console.log("replyCount:" + replyCount);
          if (replyCount == 0) {
            response.success({
              "msg": msgFromUser,
              "replyMsg": ""
            });
            console.log("resultReplyMsg:" + "0");
          } else {
            var randomIndex = Math.floor((Math.random() * replyCount) + 0);
            console.log("randomIndex:" + randomIndex);
            var resultReplyMsg = contents[randomIndex].toString();
            response.success({
              "msg": msgFromUser,
              "replyMsg": resultReplyMsg
            });
            console.log("resultReplyMsg:" + resultReplyMsg);
          }
        }
        //response.success(msgResponse);
      },
      error: function() {
        response.error("get replyMsg failed");
      }
    });
  }
});

Parse.Cloud.define('botTraining', function(request, response) {
  var MSG = Parse.Object.extend("Message");
  var msgFromUser = request.params.msg;
  var replyMsgFromUser = request.params.replyMsg;
  console.log("msg from user:" + msgFromUser + "\nreplyMsgFromUser:" + replyMsgFromUser);
  if (replyMsgFromUser == null || msgFromUser == null) {
    response.error("request null values");
  } else {
    var query = new Parse.Query(MSG);
    query.containedIn("msg", msgFromUser);
    query.limit(appQueryLimit);
    query.find({
      success: function(msgResponse) {
        var contents = [];
        if (msgResponse.length == 0) {
          // add new msg
          var msgOBJ = new MSG();
          msgOBJ.set("msg", msgFromUser);
          msgOBJ.set("replyMsg", replyMsgFromUser);
          var msgChar = msgFromUser.join('');
          var wc = wordcut.cut(msgChar)
          let arr = wc.split('|');
          msgOBJ.set("wordsArray", arr);
          msgOBJ.save(null, {
            success: function(success) {
              response.success({
                "msg": msgFromUser,
                "replyMsg": replyMsgFromUser
              });
            },
            error: function(error) {
              response.error("save failed : " + error.code);
            }
          });
        } else {
          // put another reply
          var msgOBJ = new MSG();
          msgOBJ = msgResponse[0];
          for (var i = 0; i < msgFromUser.length; i++) {
            var msgChar = msgFromUser[i].join('');
            var wc = wordcut.cut(msgChar)
            let arr = wc.split('|');
            msgOBJ.addUnique("wordsArray", arr);
            msgOBJ.addUnique("msg", msgFromUser[i]);
          }
          for (var i = 0; i < replyMsgFromUser.length; i++) {
            msgOBJ.addUnique("replyMsg", replyMsgFromUser[i]);
          }
          msgOBJ.save(null, {
            success: function(success) {
              response.success({
                "msg": msgFromUser,
                "replyMsg": replyMsgFromUser
              });
            },
            error: function(error) {
              response.error("save failed : " + error.code);
            }
          });
        }
        //response.success(msgResponse);
      },
      error: function() {
        response.error("get replyMsg failed");
      }
    });
  } // end else
});

Parse.Cloud.define('createUnknowMsg', function(request, response) {
  var MSG = Parse.Object.extend("UnknownMessage");
  var msgFromUser = request.params.msg;
  console.log("msg from user:" + msgFromUser);
  if (msgFromUser == null) {
    response.error("request null values");
  } else {
    var query = new Parse.Query(MSG);
    query.containedIn("msg", msgFromUser);
    query.limit(appQueryLimit);
    query.find({
      success: function(msgResponse) {
        var contents = [];
        if (msgResponse.length == 0) {
          // add new msg
          var msgOBJ = new MSG();
          msgOBJ.set("msg", msgFromUser);
          msgOBJ.save(null, {
            success: function(success) {
              response.success({
                "msg": msgFromUser
              });
            },
            error: function(error) {
              response.error("save failed : " + error.code);
            }
          });
        }
        //response.success(msgResponse);
      },
      error: function() {
        response.error("find failed");
      }
    });
  } // end else
});

Parse.Cloud.define('findBestReplyMsg', function(request, response) {
  var MSG = Parse.Object.extend("Message");
  var query = new Parse.Query(MSG);
  var msgFromUser = request.params.msg;
  console.log("request:" + request.params["msg"]);
  console.log("msg from user:" + msgFromUser);
  if (msgFromUser == null) {
    response.error("request null values");
  } else {
    var wc = wordcut.cut(msgFromUser)
    let arr = wc.split('|');
    var msgChar = arr.join('.*');

    query.matches("msg", '.*' + msgChar + '.*', 'i');
    query.limit(appQueryLimit);
    query.find({
      success: function(msgResponse) {
        var contents = [];
        if (msgResponse.length == 0) {
          response.success({
            "msg": msgFromUser,
            "replyMsg": ""
          });
        } else {
          console.log("all msgResponse:" + JSON.stringify(msgResponse));
          contents = msgResponse[0].get("replyMsg");
          console.log("contents:" + contents);
          var replyCount = contents.length;
          console.log("replyCount:" + replyCount);
          if (replyCount == 0) {
            response.success({
              "msg": msgFromUser,
              "replyMsg": ""
            });
            console.log("resultReplyMsg:" + "0");
          } else {
            var randomIndex = Math.floor((Math.random() * replyCount) + 0);
            console.log("randomIndex:" + randomIndex);
            var resultReplyMsg = contents[randomIndex].toString();
            response.success({
              "msg": msgFromUser,
              "replyMsg": resultReplyMsg
            });
            console.log("resultReplyMsg:" + resultReplyMsg);
          }
        }
        //response.success(msgResponse);
      },
      error: function() {
        response.error("get replyMsg failed");
      }
    });
  }
});

Parse.Cloud.define("createCharArray", function(request, response) {
  var MSG = Parse.Object.extend("Message");
  var query = new Parse.Query(MSG);
  query.limit(appQueryLimit);
  //query.equalTo('charSet',null);
  query.find({
    useMasterKey: true
  }).then(function(res) {
      var objs = [];
      for (var i = 0; i < res.length; i++) {
        var obj = res[i];
        var msgArray = res[i].get('msg');
        var msgChar = msgArray.join('');
        var wc = wordcut.cut(msgChar)
        let arr = wc.split('|');
        obj.set("wordsArray", arr);
        objs.push(obj);
        console.log("arr:" + JSON.stringify(arr));
      }
      Parse.Object.saveAll(objs, {
        success: function(result) {
          response.success("done");
        },
        error: function(err) {
          response.error("saveAll error:"+err.message);
        }
      });

    },
    function(error) {
      response.error("query unsuccessful, error:" + error.code + " " + error.message);
    });
});

Parse.Cloud.define("findBestReplyMsgFromCharSet", function(request, response) {
  var MSG = Parse.Object.extend("Message");
  var query = new Parse.Query(MSG);
  var msgFromUser = request.params.msg;
  var wc = wordcut.cut(msgFromUser)
  let arr = wc.split('|');
  console.log("wordcut:" + wordcut.cut(msgFromUser));

  console.log("request:" + request.params["msg"]);
  console.log("msg from user:" + msgFromUser);
  console.log("arr:" + JSON.stringify(arr));

  if (msgFromUser == null) {
    response.error("request null values");
  } else {
    query.containedIn("wordsArray", arr);
    query.limit(appQueryLimit);
    query.find({
      success: function(msgResponse) {
        var contents = [];
        if (msgResponse.length == 0) {
          response.success({
            "msg": msgFromUser,
            "replyMsg": ""
          });
        } else {
          var randomMsgResponseIndex = Math.floor((Math.random() * msgResponse.length) + 0);
          console.log("all msgResponse:" + JSON.stringify(msgResponse));
          contents = msgResponse[randomMsgResponseIndex].get("replyMsg");
          console.log("contents:" + contents);
          var replyCount = contents.length;
          console.log("replyCount:" + replyCount);
          if (replyCount == 0) {
            response.success({
              "msg": msgFromUser,
              "replyMsg": ""
            });
            console.log("resultReplyMsg:" + "0");
          } else {
            var randomIndex = Math.floor((Math.random() * replyCount) + 0);
            console.log("randomIndex:" + randomIndex);
            var resultReplyMsg = contents[randomIndex].toString();
            response.success({
              "msg": msgFromUser,
              "replyMsg": resultReplyMsg
            });
            console.log("resultReplyMsg:" + resultReplyMsg);
          }
        }
        //response.success(msgResponse);
      },
      error: function() {
        response.error("get replyMsg failed");
      }
    });
  }
});

Parse.Cloud.define("createMsgFromUnknow", function(request, response) {
  var MSG = Parse.Object.extend("Message");
  var UNMSG = Parse.Object.extend("UnknownMessage");
  var query = new Parse.Query(UNMSG);
  query.limit(appQueryLimit);
  query.notEqualTo('replyMsg',null);
  query.find({
    useMasterKey: true
  }).then(function(res) {
      var objs = [];
      var removeobjs = [];

      for (var i = 0; i < res.length; i++) {
        var obj = res[i];
        var msgArray = res[i].get('msg');
        var replyMsgArray = res[i].get('replyMsg');
        var msgChar = msgArray.join('');
        var wc = wordcut.cut(msgChar)
        let arr = wc.split('|');
        var msgObj = new MSG();
        msgObj.set("wordsArray", arr);
        msgObj.set("msg", msgArray);
        msgObj.set("replyMsg", replyMsgArray);

        objs.push(msgObj);
        removeobjs.push(obj);
      }
      Parse.Object.saveAll(objs, {
        success: function(result) {
          console.log("saveAll done");
          Parse.Object.destroyAll(removeobjs, {
            success: function(result) {
              response.success("save and destroyAll done");
              console.log("save and destroyAll done");
            },
            error: function(err) {
              response.error("destroyAll error:"+err.message);
            }
          });
        },
        error: function(err) {
          response.error("saveAll error:"+err.message);
        }
      });


    },
    function(error) {
      response.error("query unsuccessful, error:" + error.code + " " + error.message);
    });
});
