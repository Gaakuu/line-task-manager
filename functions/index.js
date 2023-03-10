const functions = require('firebase-functions');
const admin = require('firebase-admin')
const https = require('https');

const serviceAcocount = require('./path/to/key.json')

admin.initializeApp({
    credential:admin.credential.cert(serviceAcocount),
    databaseURL:"https://line-task-manager-76828-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

const db = admin.firestore();
const UserRef = db.collection("users");

const channelAccessToken = 'Vt9nAsfncmLm7JyK5wBRqCKVx0uXLbEUbXWBq8rIzUdWNX8oqqwxPcFBgDGg7MXT3ysG+NesS3F9GLIuPrzqQeUSa5e0D8fk8XsfQWQaeaQpr0HGSkU83Vt/ic51pAANUGixQAnZDMGY0/sRaiPITgdB04t89/1O/w1cDnyilFU=';

exports.helloWorld = functions.region('asia-northeast1').https.onRequest((request, response) => {
    if (request.method == 'POST') {

        const url = 'https://api.line.me/v2/bot/message/reply';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${channelAccessToken}`
            },
        };

        request.body['events'].forEach(async function(event) {
            //送信してきたユーザーの情報
            const Ref = UserRef.doc(event["source"]["userId"]);
            const userDoc = await Ref.get();
            
            var message = [
                {
                    'type': 'text',
                    'text': userDoc.get("name")
                }
            ]

            if(event.message.text==">グループ一覧"){
                message = [
                    {
                      "type": "template",
                      "altText": "this is a carousel template",
                      "template": {
                        "type": "carousel",
                        "columns": [
                        ],
                      }
                    }
                ]

                const groupIDs = userDoc.get("groups");
                if (groupIDs==undefined){
                    message = [
                        {
                            'type': 'text',
                            'text': "グループが見つかりませんでした。"
                        }
                    ]
                }
				        let groups = [];
                const itemsDocs = await Promise.all(
                    groupIDs.map((g) => db.collection("groups").doc(g).get())
                );
                groups = itemsDocs.map((i) => i.data());

                groups.forEach(g=>{
                    message[0].template.columns.push(
                        {
                            "text":g.title,
                            "actions":[{
                              "type":"uri",
                              "uri":`https://line-task-manager-76828.web.app/${g.id}`, 
                              "label":"詳細"}]
                        }
                    )
                   }
                )
          }
          const data = JSON.stringify({
            replyToken: event['replyToken'],
            messages: message
        });
          const line = https.request(url, options);
          line.write(data);
          line.end();
        });
    }
});