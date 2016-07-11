
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('getReplyMsg', function(request, response) {

                   var MSG = Parse.Object.extend("Message");
                   var query = new Parse.Query(MSG);
                   var msgFromUser = request.params.msg;
                   console.log("msg from user:"+msgFromUser);

                   query.equalTo("msg", msgFromUser);
                   query.find({
                             success: function(msgResponse) {
                             var contents = [];
                             contents = msgResponse.get("replyMsg").toString();
                             console.log("msgResponse:"+msgResponse"\nconntent:"+contents);

                             var replyCount = contents.length;
                             if (replyCount == 0) {
                               response.success({"msg":msgFromUser,"replyMsg":""});
                             }else {
                               var resultReplyMsg = contents[(Math.random() * replyCount) + 0].toString()
                               response.success({"msg":msgFromUser,"replyMsg":resultReplyMsg});
                             }
                             },
                             error: function() {
                             response.error("get replyMsg failed");
                             }
      });
});
