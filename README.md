```flow
st=>start: Start
e=>end
readcookies=>condition: 是否存在上次访问cookies
webwxpushloginurl=>operation: webwxpushloginurl 请求 quick login 
jslogin=>operation: jslogin 一般方式获取uuid 需要扫二维码
r_webwxpushloginurl=>condition: 成功或失败?
login=>operation: mmwebwx-bin/login
webwxnewloginpage=>operation: webwxnewloginpage 请求URL后跳转并储存大量cookies 
webwxinit=>operation: webwxinit  
webwxstatusnotify=>operation: webwxstatusnotify 通知服务器
webwxgetcontact=>operation: webwxgetcontact 获取联系人
savecookies=>operation: cookies_save 将cookies写入到本地文件
syncheck=>condition: synccheck 同步检查 (同时检查账号状态，异常跳转到logout)
webwxsync=>operation: webwxsync 读取更新内容
logout=>operation: logout 退出账户


st->readcookies->cond
readcookies(yes)->webwxpushloginurl->r_webwxpushloginurl
readcookies(no)->jslogin
r_webwxpushloginurl(no)->jslogin
r_webwxpushloginurl(yes)->login
jslogin->login->webwxnewloginpage->webwxinit->webwxstatusnotify->webwxgetcontact->savecookies->syncheck
syncheck(yes)->webwxsync
syncheck(no)->logout
```
