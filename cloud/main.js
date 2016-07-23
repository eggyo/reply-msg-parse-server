var appQueryLimit = 9999;

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('testMsg', function(req, res) {
  var msgFromUser = req.params.msg;
  console.log("msg from user:"+msgFromUser);
  res.success({"msg":msgFromUser,"replyMsg":"FUCK"});
});

Parse.Cloud.define('getReplyMsg', function(request, response) {
                   var MSG = Parse.Object.extend("Message");
                   var query = new Parse.Query(MSG);
                   var msgFromUser = request.params.msg;
                   console.log("request:"+request.params["msg"]);
                   console.log("msg from user:"+msgFromUser);
                   if (msgFromUser == null) {
                     response.error("request null values");
                   }else {
                     query.equalTo("msg", msgFromUser);
                     query.limit(appQueryLimit);
                     query.find({
                               success: function(msgResponse) {
                               var contents = [];
                               if (msgResponse.length == 0) {
                                 response.success({"msg":msgFromUser,"replyMsg":""});
                               }else {
                                 contents = msgResponse[0].get("replyMsg");
                                 console.log("msgResponse:"+msgResponse);
                                 console.log("contents:"+contents);
                                 var replyCount = contents.length;
                                 console.log("replyCount:"+replyCount);
                                 if (replyCount == 0) {
                                   response.success({"msg":msgFromUser,"replyMsg":""});
                                   console.log("resultReplyMsg:"+"0");
                                 }else {
                                   var randomIndex = Math.floor((Math.random() * replyCount) + 0);
                                   console.log("randomIndex:"+randomIndex);
                                   var resultReplyMsg = contents[randomIndex].toString();
                                   response.success({"msg":msgFromUser,"replyMsg":resultReplyMsg});
                                   console.log("resultReplyMsg:"+resultReplyMsg);
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
                   var query = new Parse.Query(MSG);
                   var msgFromUser = request.params.msg;
                   var replyMsgFromUser = request.params.replyMsg;
                   console.log("msg from user:"+msgFromUser+"\nreplyMsgFromUser:"+replyMsgFromUser);
                   if (replyMsgFromUser == null || msgFromUser == null) {
                     response.error("request null values");
                   }else {
                     var objs = [];

                     for(var i=0;i < msgFromUser.length;i++){
                       console.log("msg index:"+i+" => "+msgFromUser[i]);
                       var _msg = msgFromUser[i];
                       query.equalTo("msg", _msg);
                       query.limit(appQueryLimit);
                       query.find({
                         success: function(msgResponse) {
                         var contents = [];
                         if (msgResponse.length == 0) {
                           // add new msg
                           var msgOBJ = new MSG();
                           msgOBJ.set("msg",_msg);
                           msgOBJ.set("replyMsg",replyMsgFromUser);
                           objs.push(msgOBJ);
                           
                         }else {
                           // put another reply
                           var msgOBJ = new MSG();
                           msgOBJ = msgResponse[0];
                           for(var i=0;i < replyMsgFromUser.length;i++){
                              msgOBJ.addUnique("replyMsg",replyMsgFromUser[i]);
                           }
                           objs.push(msgOBJ);

                         }
                         Parse.Object.saveAll(objs)
                         .then(function() {
                           response.success({"msg":_msg,"replyMsg":replyMsgFromUser});
                           console.log('all saved');
                         }, function(error) {
                           response.error("save failed : "+error.code);
                           console.error(error);
                         });
                         //response.success(msgResponse);
                         },
                         error: function() {
                         response.error("get replyMsg failed");
                         }
                       });
                     }// end for loop
                   }// end else
});
