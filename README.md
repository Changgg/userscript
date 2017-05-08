# web wechat api demo 

网页版微信API接口demo  

第一次使用请安装第三方包。
```
pip3 install -r requirements.txt
```

- [x] **api和demmo分开，这样方便并入开发者自己的项目**
- [ ] 提供微信机器人
- [ ] 新增联系人事件（个人或公众号）
- [ ] 删除联系人事件（个人或公众号）
- [ ] 联系人状态更新事件（个人或公众号）

<!-- TOC -->

- [web wechat api demo](#web-wechat-api-demo)
    - [<a name="Demo">Demo</a>](#a-namedemodemoa)
    - [<a name="Recent-Update">Recent Update</a>](#a-namerecent-updaterecent-updatea)
    - [UML](#uml)
    - [API restFul接口描述](#api-restful接口描述)
        - [登录](#登录)
            - [获取uuid jslogin](#获取uuid-jslogin)
            - [webwxpushloginurl](#webwxpushloginurl)
        - [微信初始化](#微信初始化)
        - [获取联系人信息](#获取联系人信息)
        - [同步刷新](#同步刷新)
        - [消息接口](#消息接口)
            - [发送表情](#发送表情)
        - [图片接口](#图片接口)
        - [多媒体接口](#多媒体接口)
        - [账号类型](#账号类型)
        - [消息类型](#消息类型)
            - [51 **微信初始化消息**](#51-微信初始化消息)
            - [**文本消息**](#文本消息)
            - [**图片消息**](#图片消息)
            - [**小视频消息**](#小视频消息)
            - [**地理位置消息**](#地理位置消息)
            - [**名片消息**](#名片消息)
            - [**语音消息**](#语音消息)
            - [**动画表情**](#动画表情)
            - [**普通链接或应用分享消息**](#普通链接或应用分享消息)
            - [**音乐链接消息**](#音乐链接消息)
            - [**群消息**](#群消息)
            - [**红包消息**](#红包消息)
            - [**系统消息**](#系统消息)
    - [Discussion Group](#discussion-group)

<!-- /TOC -->




## Recent Update

- quick_login  
    登录上次登录过的账户可以 快速登录。


## UML 流程示意图

```flow
st=>start: Start
e=>end
readcookies=>condition: 是否存在上次访问cookies
webwxpushloginurl=>operation: webwxpushloginurl 请求 quick login 
jslogin=>operation: jslogin 一般方式获取uuid 需要扫二维码
r_webwxpushloginurl=>condition: 成功或失败?
login=>operation: mmwebwx-bin/login 登录状态查询 408 等待扫描 201 已扫描待确认 200 登录成功开始跳转
webwxnewloginpage=>operation: webwxnewloginpage 请求URL后跳转并储存大量cookies 
webwxinit=>operation: webwxinit  
webwxstatusnotify=>operation: webwxstatusnotify 通知服务器
webwxgetcontact=>operation: webwxgetcontact 获取联系人
savecookies=>operation: cookies_save 将cookies写入到本地文件
syncheck=>condition: synccheck 同步检查 (同时检查账号状态，异常跳转到logout)
webwxsync=>operation: webwxsync 读取更新内容
logout=>operation: logout 退出账户


st->readcookies->cond
readcookies(yes, right)->webwxpushloginurl->r_webwxpushloginurl
readcookies(no)->jslogin
r_webwxpushloginurl(no)->jslogin
r_webwxpushloginurl(yes)->login
jslogin->login->webwxnewloginpage->webwxinit->webwxstatusnotify->webwxgetcontact->savecookies->syncheck
syncheck(yes)->webwxsync
syncheck(no)->logout
```

## API restFul接口描述

### 登录

#### 获取uuid jslogin 
| API | 获取 UUID |
| --- | --------- |
| url | https://login.weixin.qq.com/jslogin |
| method | POST |
| data | URL Encode |
| params | **appid**: `应用ID` <br> **fun**: new `应用类型` <br> **lang**: zh\_CN `语言` <br> **_**: `时间戳` |

返回数据(String):
```
window.QRLogin.code = 200; window.QRLogin.uuid = "xxx"
```
> 注：这里的appid就是在微信开放平台注册的应用的AppID。网页版微信有两个AppID，早期的是`wx782c26e4c19acffb`，在微信客户端上显示为应用名称为`Web微信`；现在用的是`wxeb7ec651dd0aefa9`，显示名称为`微信网页版`。

<br>

#### webwxpushloginurl quick_login
| API | 绑定登陆（webwxpushloginurl） |
| --- | --------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxpushloginurl |
| method | GET |
| params | **uin**: xxx |

返回数据(String):
```
{'msg': 'all ok', 'uuid': 'xxx', 'ret': '0'}

通过这种方式可以省掉扫二维码这步操作，更加方便
```
<br>
#### 二维码URL格式
| API | 生成二维码 |
| --- | --------- |
| url | https://login.weixin.qq.com/l/ `uuid` |
| method | GET |
<br>
#### mmwebwx-bin/login 登录状态检查
| API | 二维码扫描登录 |
| --- | --------- |
| url | https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login |
| method | GET |
| params | **tip**: 1 `未扫描` 0 `已扫描` <br> **uuid**: xxx <br> **_**: `时间戳` |

返回数据(String):
```
window.code=xxx;

xxx:
	408 登陆超时
	201 扫描成功
	200 确认登录

当返回200时，还会有
window.redirect_uri="https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?ticket=xxx&uuid=xxx&lang=xxx&scan=xxx";
```
<br>
#### webwxnewloginpage
| API | webwxnewloginpage |
| --- | --------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage |
| method | GET |
| params | **ticket**: xxx <br> **uuid**: xxx <br> **lang**: zh_CN `语言` <br> **scan**: xxx <br> **fun**: new |

返回数据(XML):
```
<error>
	<ret>0</ret>
	<message>OK</message>
	<skey>xxx</skey>
	<wxsid>xxx</wxsid>
	<wxuin>xxx</wxuin>
	<pass_ticket>xxx</pass_ticket>
	<isgrayscale>1</isgrayscale>
</error>
```
<br>

### 微信初始化
1.
| API | webwxinit |
| --- | --------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit?pass_ticket=xxx&skey=xxx&r=xxx |
| method | POST |
| data | JSON |
| header | ContentType: application/json; charset=UTF-8 |
| params | { <br> &nbsp;&nbsp;&nbsp;&nbsp; BaseRequest: { <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	Uin: xxx, <br>	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Sid: xxx, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	Skey: xxx, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DeviceID: xxx, <br> &nbsp;&nbsp;&nbsp;&nbsp; } <br> } |

返回数据(JSON):
```
{
	"BaseResponse": {
		"Ret": 0,
		"ErrMsg": ""
	},
	"Count": 11,
	"ContactList": [...],
	"SyncKey": {
		"Count": 4,
		"List": [
			{
				"Key": 1,
				"Val": 635705559
			},
			...
		]
	},
	"User": {
		"Uin": xxx,
		"UserName": xxx,
		"NickName": xxx,
		"HeadImgUrl": xxx,
		"RemarkName": "",
		"PYInitial": "",
		"PYQuanPin": "",
		"RemarkPYInitial": "",
		"RemarkPYQuanPin": "",
		"HideInputBarFlag": 0,
		"StarFriend": 0,
		"Sex": 1,
		"Signature": "Apt-get install B",
		"AppAccountFlag": 0,
		"VerifyFlag": 0,
		"ContactFlag": 0,
		"WebWxPluginSwitch": 0,
		"HeadImgFlag": 1,
		"SnsFlag": 17
	},
	"ChatSet": xxx,
	"SKey": xxx,
	"ClientVersion": 369297683,
	"SystemTime": 1453124908,
	"GrayScale": 1,
	"InviteStartCount": 40,
	"MPSubscribeMsgCount": 2,
	"MPSubscribeMsgList": [...],
	"ClickReportInterval": 600000
}
```
<br>
2.

| API | webwxstatusnotify |
| --- | --------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxstatusnotify?lang=zh_CN&pass_ticket=xxx |
| method | POST |
| data | JSON |
| header | ContentType: application/json; charset=UTF-8 |
| params | { <br> &nbsp;&nbsp;&nbsp;&nbsp; BaseRequest: { Uin: xxx, Sid: xxx, Skey: xxx, DeviceID: xxx }, <br> &nbsp;&nbsp;&nbsp;&nbsp; Code: 3, <br> &nbsp;&nbsp;&nbsp;&nbsp; FromUserName: `自己ID`, <br> &nbsp;&nbsp;&nbsp;&nbsp; ToUserName: `自己ID`, <br> &nbsp;&nbsp;&nbsp;&nbsp; ClientMsgId: `时间戳` <br> } |

返回数据(JSON):
```
{
	"BaseResponse": {
		"Ret": 0,
		"ErrMsg": ""
	},
	...
}
```
<br>

### 获取联系人信息

| API | webwxgetcontact |
| --- | --------------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?pass_ticket=xxx&skey=xxx&r=xxx |
| method | POST |
| data | JSON |
| header | ContentType: application/json; charset=UTF-8 |

返回数据(JSON):
```
{
	"BaseResponse": {
		"Ret": 0,
		"ErrMsg": ""
	},
	"MemberCount": 334,
	"MemberList": [
		{
			"Uin": 0,
			"UserName": xxx,
			"NickName": "Urinx",
			"HeadImgUrl": xxx,
			"ContactFlag": 3,
			"MemberCount": 0,
			"MemberList": [],
			"RemarkName": "",
			"HideInputBarFlag": 0,
			"Sex": 0,
			"Signature": "你好，我们是地球三体组织。在这里，你将感受到不一样的思维模式，以及颠覆常规的世界观。而我们的目标，就是以三体人的智慧，引领人类未来科学技术500年。",
			"VerifyFlag": 8,
			"OwnerUin": 0,
			"PYInitial": "URINX",
			"PYQuanPin": "Urinx",
			"RemarkPYInitial": "",
			"RemarkPYQuanPin": "",
			"StarFriend": 0,
			"AppAccountFlag": 0,
			"Statues": 0,
			"AttrStatus": 0,
			"Province": "",
			"City": "",
			"Alias": "Urinxs",
			"SnsFlag": 0,
			"UniFriend": 0,
			"DisplayName": "",
			"ChatRoomId": 0,
			"KeyWord": "gh_",
			"EncryChatRoomId": ""
		},
		...
	],
	"Seq": 0
}
```
<br>

| API | webwxbatchgetcontact |
| --- | --------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxbatchgetcontact?type=ex&r=xxx&pass_ticket=xxx |
| method | POST |
| data | JSON |
| header | ContentType: application/json; charset=UTF-8 |
| params | { <br> &nbsp;&nbsp;&nbsp;&nbsp; BaseRequest: { Uin: xxx, Sid: xxx, Skey: xxx, DeviceID: xxx }, <br> &nbsp;&nbsp;&nbsp;&nbsp; Count: `查询contact的总数量`, <br> &nbsp;&nbsp;&nbsp;&nbsp; List: [ <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { UserName: `群ID`, EncryChatRoomId: "" }, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ... <br> &nbsp;&nbsp;&nbsp;&nbsp; ], <br> } |

返回数据(JSON)同上
<br><br>

### 同步刷新

| API | synccheck |
| --- | --------- |
| protocol | https |
| host | webpush.weixin.qq.com <br> webpush.wx2.qq.com <br> webpush.wx8.qq.com <br> webpush.wx.qq.com <br> webpush.web2.wechat.com <br> webpush.web.wechat.com |
| path | /cgi-bin/mmwebwx-bin/synccheck |
| method | GET |
| data | URL Encode |
| params | **r**: `时间戳` <br> **sid**: xxx <br> **uin**: xxx <br> **skey**: xxx <br> **deviceid**: xxx <br> **synckey**: xxx <br> **_**: `时间戳` |

返回数据(String):
```
window.synccheck={retcode:"xxx",selector:"xxx"}

retcode:
	0 正常
	1100 失败/登出微信
selector:
	0 正常
	1 重新登录？
	2 新的消息
	4 新联系人加入？
```
<br>

| API | webwxsync |
| --- | --------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsync?sid=xxx&skey=xxx&pass_ticket=xxx |
| method | POST |
| data | JSON |
| header | ContentType: application/json; charset=UTF-8 |
| params | { <br> &nbsp;&nbsp;&nbsp;&nbsp; BaseRequest: { Uin: xxx, Sid: xxx, Skey: xxx, DeviceID: xxx }, <br> &nbsp;&nbsp;&nbsp;&nbsp; SyncKey: xxx, <br> &nbsp;&nbsp;&nbsp;&nbsp; rr: `时间戳取反` <br> } |

返回数据(JSON):
```
{
	'BaseResponse': {'ErrMsg': '', 'Ret': 0},
	'SyncKey': {
		'Count': 7,
		'List': [
			{'Val': 636214192, 'Key': 1},
			...
		]
	},
	'ContinueFlag': 0,
	'AddMsgCount': 1,
	'AddMsgList': [
		{
			'FromUserName': '',
			'PlayLength': 0,
			'RecommendInfo': {...},
			'Content': "", 
			'StatusNotifyUserName': '',
			'StatusNotifyCode': 5,
			'Status': 3,
			'VoiceLength': 0,
			'ToUserName': '',
			'ForwardFlag': 0,
			'AppMsgType': 0,
			'AppInfo': {'Type': 0, 'AppID': ''},
			'Url': '',
			'ImgStatus': 1,
			'MsgType': 51,
			'ImgHeight': 0,
			'MediaId': '', 
			'FileName': '',
			'FileSize': '',
			...
		},
		...
	],
	'ModChatRoomMemberCount': 0,
	'ModContactList': [],
	'DelContactList': [],
	'ModChatRoomMemberList': [],
	'DelContactCount': 0,
	...
}
```
<br>

### 消息接口

| API | webwxsendmsg |
| --- | ------------ |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg?pass_ticket=xxx |
| method | POST |
| data | JSON |
| header | ContentType: application/json; charset=UTF-8 |
| params | { <br> &nbsp;&nbsp;&nbsp;&nbsp; BaseRequest: { Uin: xxx, Sid: xxx, Skey: xxx, DeviceID: xxx }, <br> &nbsp;&nbsp;&nbsp;&nbsp; Msg: { <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Type: 1 `文字消息`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Content: `要发送的消息`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FromUserName: `自己ID`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ToUserName: `好友ID`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LocalID: `与clientMsgId相同`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ClientMsgId: `时间戳左移4位随后补上4位随机数` <br> &nbsp;&nbsp;&nbsp;&nbsp; } <br> } |

返回数据(JSON):
```
{
	"BaseResponse": {
		"Ret": 0,
		"ErrMsg": ""
	},
	...
}
```

| API | webwxrevokemsg |
| --- | ------------ |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxrevokemsg |
| method | POST |
| data | JSON |
| header | ContentType: application/json; charset=UTF-8 |
| params | { <br> &nbsp;&nbsp;&nbsp;&nbsp; BaseRequest: { Uin: xxx, Sid: xxx, Skey: xxx, DeviceID: xxx }, <br> &nbsp;&nbsp;&nbsp;&nbsp; SvrMsgId: msg_id, <br> &nbsp;&nbsp;&nbsp;&nbsp; ToUserName: user_id, <br> &nbsp;&nbsp;&nbsp;&nbsp; ClientMsgId: local_msg_id <br>  } |

返回数据(JSON):
```
{
	"BaseResponse": {
		"Ret": 0,
		"ErrMsg": ""
	}
}
```

#### 发送表情

| API | webwxsendmsgemotion |
| --- | ------------ |
| url | https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxsendemoticon?fun=sys&f=json&pass_ticket=xxx |
| method | POST |
| data | JSON |
| header | ContentType: application/json; charset=UTF-8 |
| params | { <br> &nbsp;&nbsp;&nbsp;&nbsp; BaseRequest: { Uin: xxx, Sid: xxx, Skey: xxx, DeviceID: xxx }, <br> &nbsp;&nbsp;&nbsp;&nbsp; Msg: { <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Type: 47 `emoji消息`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; EmojiFlag: 2, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; MediaId: `表情上传后的媒体ID`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FromUserName: `自己ID`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ToUserName: `好友ID`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LocalID: `与clientMsgId相同`, <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ClientMsgId: `时间戳左移4位随后补上4位随机数` <br> &nbsp;&nbsp;&nbsp;&nbsp; } <br> } |

<br>

### 图片接口

| API | webwxgeticon |
| --- | ------------ |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgeticon |
| method | GET |
| params | **seq**: `数字，可为空` <br> **username**: `ID` <br> **skey**: xxx |
<br>

| API | webwxgetheadimg |
| --- | --------------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetheadimg |
| method | GET |
| params | **seq**: `数字，可为空` <br> **username**: `群ID` <br> **skey**: xxx |
<br>

| API | webwxgetmsgimg |
| --- | --------------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetmsgimg |
| method | GET |
| params | **MsgID**: `消息ID` <br> **type**: slave `略缩图` or `为空时加载原图` <br> **skey**: xxx |
<br>

### 多媒体接口

| API | webwxgetvideo |
| --- | --------------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetvideo |
| method | GET |
| params | **msgid**: `消息ID` <br> **skey**: xxx |
<br>

| API | webwxgetvoice |
| --- | --------------- |
| url | https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetvoice |
| method | GET |
| params | **msgid**: `消息ID` <br> **skey**: xxx |
<br>

### 账号类型

| 类型 | 说明 |
| :--: | --- |
| 个人账号 | 以`@`开头，例如：`@xxx` |
| 群聊 | 以`@@`开头，例如：`@@xxx` |
| 公众号/服务号 | 以`@`开头，但其`VerifyFlag` & 8 != 0 <br><br> `VerifyFlag`: <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 一般公众号/服务号：8 <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 微信自家的服务号：24 <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 微信官方账号`微信团队`：56 |
| 特殊账号 | 像文件传输助手之类的账号，有特殊的ID，目前已知的有：<br> `filehelper`, `newsapp`, `fmessage`, `weibo`, `qqmail`, `fmessage`, `tmessage`, `qmessage`, `qqsync`, `floatbottle`, `lbsapp`, `shakeapp`, `medianote`, `qqfriend`, `readerapp`, `blogapp`, `facebookapp`, `masssendapp`, `meishiapp`, `feedsapp`, `voip`, `blogappweixin`, `weixin`, `brandsessionholder`, `weixinreminder`, `officialaccounts`, `notification_messages`, `wxitil`, `userexperience_alarm`, `notification_messages` |
<br>

### 消息类型

消息一般格式：
```
{
	"FromUserName": "",
	"ToUserName": "",
	"Content": "",
	"StatusNotifyUserName": "",
	"ImgWidth": 0,
	"PlayLength": 0,
	"RecommendInfo": {...},
	"StatusNotifyCode": 4,
	"NewMsgId": "",
	"Status": 3,
	"VoiceLength": 0,
	"ForwardFlag": 0,
	"AppMsgType": 0,
	"Ticket": "",
	"AppInfo": {...},
	"Url": "",
	"ImgStatus": 1,
	"MsgType": 1,
	"ImgHeight": 0,
	"MediaId": "",
	"MsgId": "",
	"FileName": "",
	"HasProductId": 0,
	"FileSize": "",
	"CreateTime": 1454602196,
	"SubMsgType": 0
}
```
<br>

| MsgType | 说明 | 备注 |
| ------- | --- |---|
| 1  | 文本消息 ||
| 3  | 图片消息 ||
| 34 | 语音消息 ||
| 37 | 好友确认消息 ||
| 40 | POSSIBLEFRIEND_MSG ||
| 42 | 共享名片 ||
| 43 | 视频消息 ||
| 47 | 动画表情 ||
| 48 | 位置消息 ||
| 49 | 分享链接 ||
| 50 | VOIPMSG ||
| 51 | 微信初始化消息 | 新增公众号会有新消息，新消息的id也是51
| 52 | VOIPNOTIFY ||
| 53 | VOIPINVITE ||
| 62 | 小视频 ||
| 9999 | SYSNOTICE ||
| 10000 | 系统消息 ||
| 10002 | 撤回消息 ||
<br>

#### 51 **微信初始化消息**
```html
MsgType: 51
FromUserName: 自己ID
ToUserName: 自己ID
StatusNotifyUserName: 最近联系的联系人ID
Content:
	<msg>
	    <op id='4'>
	        <username>
	        	// 最近联系的联系人
	            filehelper,xxx@chatroom,wxid_xxx,xxx,...
	        </username>
	        <unreadchatlist>
	            <chat>
	                <username>
	                	// 朋友圈
	                    MomentsUnreadMsgStatus
	                </username>
	                <lastreadtime>
	                    1454502365
	                </lastreadtime>
	            </chat>
	        </unreadchatlist>
	        <unreadfunctionlist>
	        	// 未读的功能账号消息，群发助手，漂流瓶等
	        </unreadfunctionlist>
	    </op>
	</msg>
```

#### **文本消息**
```
MsgType: 1
FromUserName: 发送方ID
ToUserName: 接收方ID
Content: 消息内容
```

#### **图片消息**
```html
MsgType: 3
FromUserName: 发送方ID
ToUserName: 接收方ID
MsgId: 用于获取图片
Content:
	<msg>
		<img length="6503" hdlength="0" />
		<commenturl></commenturl>
	</msg>
```

#### **小视频消息**
```html
MsgType: 62
FromUserName: 发送方ID
ToUserName: 接收方ID
MsgId: 用于获取小视频
Content:
	<msg>
		<img length="6503" hdlength="0" />
		<commenturl></commenturl>
	</msg>
```

#### **地理位置消息**
```
MsgType: 1
FromUserName: 发送方ID
ToUserName: 接收方ID
Content: http://weixin.qq.com/cgi-bin/redirectforward?args=xxx
// 属于文本消息，只不过内容是一个跳转到地图的链接
```

#### **名片消息**
```js
MsgType: 42
FromUserName: 发送方ID
ToUserName: 接收方ID
Content:
	<?xml version="1.0"?>
	<msg bigheadimgurl="" smallheadimgurl="" username="" nickname=""  shortpy="" alias="" imagestatus="3" scene="17" province="" city="" sign="" sex="1" certflag="0" certinfo="" brandIconUrl="" brandHomeUrl="" brandSubscriptConfigUrl="" brandFlags="0" regionCode="" />

```
1. Content中读取出的信息
```python
# 公众号
{
  'bigheadimgurl': '（大）头像url',
  'smallheadimgurl': '（小）头像url',
  'username': 'gh_091f625bbea4',
  'nickname': '显示给用户的名称，如（对啊英语四六级）',
  'shortpy': 'nickname属性的拼音首字母大写，如（DAYYSLJ）',
  'alias': 'weixinID，如（duiayingyu）',
  'imagestatus': '3',
  'scene': '17',v
  'province': '北京',
  'city': '朝阳',
  'sign': '',
  'sex': '0',
  'certflag': '24',
  'certinfo': '北京对啊网教育科技有限公司',
  'brandiconurl': 'http://mmbiz.qpic.cn/mmbiz/tnG5AgviaAVF2v5EyPicokCVcY4TwUW0RvJibHSZaYkllicanXnEPTuFDeMDp9GT0gHAUvL5tyuicXNaxTC1m4gAibaw/0?wx_fmt=png',
  'brandhomeurl': '',
  'brandsubscriptconfigurl': '',
  'brandflags': '0',
  'regioncode': 'CN_Beijing_Chaoyang'
}
# 个人
{
  'bigheadimgurl': 'http://wx.qlogo.cn/mmhead/ver_1/aBicQiaDEnl8UYUpHyMsCcyXIeNvVES31PTiayMjHoT6hrJhKeqpgeJnUGa6v3enwa67SN719Y8sn7icIqTmVrnLwW67S7WAmKYLcWMTo3NZMCE/0',
  'smallheadimgurl': 'http://wx.qlogo.cn/mmhead/ver_1/aBicQiaDEnl8UYUpHyMsCcyXIeNvVES31PTiayMjHoT6hrJhKeqpgeJnUGa6v3enwa67SN719Y8sn7icIqTmVrnLwW67S7WAmKYLcWMTo3NZMCE/132',
  'username': 'wxid_cibvngai09j422',
  'nickname': '好为',
  'shortpy': 'HW',
  'alias': 'HeawerCher',
  'imagestatus': '3',
  'scene': '17',
  'province': '',
  'city': '',
  'sign': '',
  'sex': '1',
  'certflag': '0',
  'certinfo': '',
  'brandiconurl': '',
  'brandhomeurl': '',
  'brandsubscriptconfigurl': '',
  'brandflags': '0',
  'regioncode': ''
}
```
2. 返回值（json） 中 'RecommendInfo' 值  
```python
# 公众号
{
  'UserName': '@4964e6a0e57f2bd0a1f24125a6320441',
  'NickName': '对啊英语四六级',
  'QQNum': 0,
  'Province': 'Beijing',
  'City': 'Chaoyang',
  'Content': '',
  'Signature': '',
  'Alias': '', # 大部分时候没有值，有值的时候是微信号
  'Scene': 17,
  'VerifyFlag': 24,
  'AttrStatus': 0,
  'Sex': 0,
  'Ticket': '',
  'OpCode': 0
}
# 个人
{
  'UserName': '@7f3381e8c8ff5aa38397d5583ac577e2ba6b508f54ebd18664c0897f1b846699',
  'NickName': '好为',
  'QQNum': 0,
  'Province': '',
  'City': '',
  'Content': '',
  'Signature': '',
  'Alias': '',
  'Scene': 17,
  'VerifyFlag': 0,
  'AttrStatus': 33656999,
  'Sex': 1, # 0 未知 1 男 2 女
  'Ticket': '',
  'OpCode': 0
}
```

#### **语音消息**
```html
MsgType: 34
FromUserName: 发送方ID
ToUserName: 接收方ID
MsgId: 用于获取语音
Content:
	<msg>
		<voicemsg endflag="1" cancelflag="0" forwardflag="0" voiceformat="4" voicelength="1580" length="2026" bufid="216825389722501519" clientmsgid="49efec63a9774a65a932a4e5fcd4e923filehelper174_1454602489" fromusername="" />
	</msg>
```

#### **动画表情**
```html
MsgType: 47
FromUserName: 发送方ID
ToUserName: 接收方ID
Content:
	<msg>
		<emoji fromusername = "" tousername = "" type="2" idbuffer="media:0_0" md5="e68363487d8f0519c4e1047de403b2e7" len = "86235" productid="com.tencent.xin.emoticon.bilibili" androidmd5="e68363487d8f0519c4e1047de403b2e7" androidlen="86235" s60v3md5 = "e68363487d8f0519c4e1047de403b2e7" s60v3len="86235" s60v5md5 = "e68363487d8f0519c4e1047de403b2e7" s60v5len="86235" cdnurl = "http://emoji.qpic.cn/wx_emoji/eFygWtxcoMF8M0oCCsksMA0gplXAFQNpiaqsmOicbXl1OC4Tyx18SGsQ/" designerid = "" thumburl = "http://mmbiz.qpic.cn/mmemoticon/dx4Y70y9XctRJf6tKsy7FwWosxd4DAtItSfhKS0Czr56A70p8U5O8g/0" encrypturl = "http://emoji.qpic.cn/wx_emoji/UyYVK8GMlq5VnJ56a4GkKHAiaC266Y0me0KtW6JN2FAZcXiaFKccRevA/" aeskey= "a911cc2ec96ddb781b5ca85d24143642" ></emoji> 
		<gameext type="0" content="0" ></gameext>
	</msg>
```

#### **普通链接或应用分享消息**
```html
MsgType: 49
AppMsgType: 5
FromUserName: 发送方ID
ToUserName: 接收方ID
Url: 链接地址
FileName: 链接标题
Content:
	<msg>
		<appmsg appid=""  sdkver="0">
			<title></title>
			<des></des>
			<type>5</type>
			<content></content>
			<url></url>
			<thumburl></thumburl>
			...
		</appmsg>
		<appinfo>
			<version></version>
			<appname></appname>
		</appinfo>
	</msg>
```

#### **音乐链接消息**
```html
MsgType: 49
AppMsgType: 3
FromUserName: 发送方ID
ToUserName: 接收方ID
Url: 链接地址
FileName: 音乐名

AppInfo: // 分享链接的应用
	{
		Type: 0, 
		AppID: wx485a97c844086dc9
	}

Content:
	<msg>
		<appmsg appid="wx485a97c844086dc9"  sdkver="0">
			<title></title>
			<des></des>
			<action></action>
			<type>3</type>
			<showtype>0</showtype>
			<mediatagname></mediatagname>
			<messageext></messageext>
			<messageaction></messageaction>
			<content></content>
			<contentattr>0</contentattr>
			<url></url>
			<lowurl></lowurl>
			<dataurl>
				http://ws.stream.qqmusic.qq.com/C100003i9hMt1bgui0.m4a?vkey=6867EF99F3684&amp;guid=ffffffffc104ea2964a111cf3ff3edaf&amp;fromtag=46
			</dataurl>
			<lowdataurl>
				http://ws.stream.qqmusic.qq.com/C100003i9hMt1bgui0.m4a?vkey=6867EF99F3684&amp;guid=ffffffffc104ea2964a111cf3ff3edaf&amp;fromtag=46
			</lowdataurl>
			<appattach>
				<totallen>0</totallen>
				<attachid></attachid>
				<emoticonmd5></emoticonmd5>
				<fileext></fileext>
			</appattach>
			<extinfo></extinfo>
			<sourceusername></sourceusername>
			<sourcedisplayname></sourcedisplayname>
			<commenturl></commenturl>
			<thumburl>
				http://imgcache.qq.com/music/photo/album/63/180_albumpic_143163_0.jpg
			</thumburl>
			<md5></md5>
		</appmsg>
		<fromusername></fromusername>
		<scene>0</scene>
		<appinfo>
			<version>29</version>
			<appname>摇一摇搜歌</appname>
		</appinfo>
		<commenturl></commenturl>
	</msg>
```

#### **群消息**
```
MsgType: 1
FromUserName: @@xxx
ToUserName: @xxx
Content:
	@xxx:<br/>xxx
```

#### **红包消息**
```
MsgType: 49
AppMsgType: 2001
FromUserName: 发送方ID
ToUserName: 接收方ID
Content: 未知
```
注：根据网页版的代码可以看到未来可能支持查看红包消息，但目前走的是系统消息，见下。

#### **系统消息**
```
MsgType: 10000
FromUserName: 发送方ID
ToUserName: 自己ID
Content:
	"你已添加了 xxx ，现在可以开始聊天了。"
	"如果陌生人主动添加你为朋友，请谨慎核实对方身份。"
	"收到红包，请在手机上查看"
```


## Discussion Group
如果你希望和 WeixinBot 的其他开发者交流，或者有什么问题和建议，欢迎大家加入微信群【Youth fed the dog】一起讨论。扫描下面的二维码添加机器人为好友，并回复【Aidog】获取入群链接。

<div align=center>
<img src="imgs/groupQrcode.jpg" width="220" height="220" alt="join us"/>
</div>

注：这个不是群的二维码，是机器人拉你入群，记得回复机器人【Aidog】哦~ （secret code: Aidog）

