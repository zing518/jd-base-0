
/*
 * @Author: Jerrykuku https://github.com/jerrykuku
 * @Date: 2021-1-8
 * @Version: v0.0.2
 * @thanks: FanchangWang https://github.com/FanchangWang
 */

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var got = require('got');
var path = require('path');
var fs = require('fs');

var rootPath = path.resolve(__dirname, '..')
// config.sh 文件所在目录
var confFile = path.join(rootPath,'config/config.sh');
// config.sh.sample 文件所在目录
var sampleFile = path.join(rootPath,'sample/config.sh.sample');
// crontab.list 文件所在目录
var crontabFile = path.join(rootPath,'config/crontab.list');
// config.sh 文件备份目录
var confBakDir = path.join(rootPath,'config/bak/');;
// auth.json 文件目录
var authConfigFile = path.join(rootPath,'config/auth.json');

var authError = "错误的用户名密码，请重试";
var loginFaild = "请先登录!";

var configString = "config sample crontab";

var s_token, cookies, guid, lsid, lstoken, okl_token, token, userCookie = ""

function praseSetCookies(response) {
    s_token = response.body.s_token
    guid = response.headers['set-cookie'][0]
    guid = guid.substring(guid.indexOf("=") + 1, guid.indexOf(";"))
    lsid = response.headers['set-cookie'][2]
    lsid = lsid.substring(lsid.indexOf("=") + 1, lsid.indexOf(";"))
    lstoken = response.headers['set-cookie'][3]
    lstoken = lstoken.substring(lstoken.indexOf("=") + 1, lstoken.indexOf(";"))
    cookies = "guid=" + guid + "; lang=chs; lsid=" + lsid + "; lstoken=" + lstoken + "; "
}

function getCookie(response) {
    var TrackerID = response.headers['set-cookie'][0]
    TrackerID = TrackerID.substring(TrackerID.indexOf("=") + 1, TrackerID.indexOf(";"))
    var pt_key = response.headers['set-cookie'][1]
    pt_key = pt_key.substring(pt_key.indexOf("=") + 1, pt_key.indexOf(";"))
    var pt_pin = response.headers['set-cookie'][2]
    pt_pin = pt_pin.substring(pt_pin.indexOf("=") + 1, pt_pin.indexOf(";"))
    var pt_token = response.headers['set-cookie'][3]
    pt_token = pt_token.substring(pt_token.indexOf("=") + 1, pt_token.indexOf(";"))
    var pwdt_id = response.headers['set-cookie'][4]
    pwdt_id = pwdt_id.substring(pwdt_id.indexOf("=") + 1, pwdt_id.indexOf(";"))
    var s_key = response.headers['set-cookie'][5]
    s_key = s_key.substring(s_key.indexOf("=") + 1, s_key.indexOf(";"))
    var s_pin = response.headers['set-cookie'][6]
    s_pin = s_pin.substring(s_pin.indexOf("=") + 1, s_pin.indexOf(";"))
    cookies = "TrackerID=" + TrackerID + "; pt_key=" + pt_key + "; pt_pin=" + pt_pin + "; pt_token=" + pt_token + "; pwdt_id=" + pwdt_id + "; s_key=" + s_key + "; s_pin=" + s_pin + "; wq_skey="
    var userCookie = "pt_key=" + pt_key + ";pt_pin=" + pt_pin + ";";
    console.log("\n############  登录成功，获取到 Cookie  #############\n\n");
    console.log('Cookie1="' + userCookie + '"\n');
    console.log("\n####################################################\n\n");
    return userCookie;
}

async function step1() {
    try {
        s_token, cookies, guid, lsid, lstoken, okl_token, token = ""
        let timeStamp = (new Date()).getTime()
        let url = 'https://plogin.m.jd.com/cgi-bin/mm/new_login_entrance?lang=chs&appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport'
        const response = await got(url, {
            responseType: 'json',
            headers: {
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-cn',
                'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                'Host': 'plogin.m.jd.com'
            }
        });

        praseSetCookies(response)
    } catch (error) {
        cookies = "";
        console.log(error.response.body);
    }
};

async function step2() {
    try {
        if (cookies == "") {
            return 0
        }
        let timeStamp = (new Date()).getTime()
        let url = 'https://plogin.m.jd.com/cgi-bin/m/tmauthreflogurl?s_token=' + s_token + '&v=' + timeStamp + '&remember=true'
        const response = await got.post(url, {
            responseType: 'json',
            json: {
                'lang': 'chs',
                'appid': 300,
                'returnurl': 'https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action',
                'source': 'wq_passport'
            },
            headers: {
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
                'Cookie': cookies,
                'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                'Host': 'plogin.m.jd.com',
            }
        });
        token = response.body.token
        okl_token = response.headers['set-cookie'][0]
        okl_token = okl_token.substring(okl_token.indexOf("=") + 1, okl_token.indexOf(";"))
        var qrUrl = 'https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=' + token;
        return qrUrl;
    } catch (error) {
        console.log(error.response.body);
        return 0
    }
}

var i = 0;

async function checkLogin() {
    try {
        if (cookies == "") {
            return 0
        }
        let timeStamp = (new Date()).getTime()
        let url = 'https://plogin.m.jd.com/cgi-bin/m/tmauthchecktoken?&token=' + token + '&ou_state=0&okl_token=' + okl_token;
        const response = await got.post(url, {
            responseType: 'json',
            form: {
                lang: 'chs',
                appid: 300,
                returnurl: 'https://wqlogin2.jd.com/passport/LoginRedirect?state=1100399130787&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action',
                source: 'wq_passport'
            },
            headers: {
                'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'Cookie': cookies,
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
            }
        });

        return response;
    } catch (error) {
        console.log(error.response.body);
        let res = {}
        res.body = { check_ip: 0, errcode: 222, message: '出错' }
        res.headers = {}
        return res;
    }
}



/**
 * 检查 config.sh 以及 config.sh.sample 文件是否存在
 */
function checkConfigFile() {
    if (!fs.existsSync(confFile)) {
        console.error('脚本启动失败，config.sh 文件不存在！');
        process.exit(1);
    }
    if (!fs.existsSync(sampleFile)) {
        console.error('脚本启动失败，config.sh.sample 文件不存在！');
        process.exit(1);
    }
}

/**
 * 检查 config/bak/ 备份目录是否存在，不存在则创建
 */
function mkdirConfigBakDir() {
    if (!fs.existsSync(confBakDir)) {
        fs.mkdirSync(confBakDir);
    }
}

/**
 * 备份 config.sh 文件
 */
function bakConfFile(file) {
    mkdirConfigBakDir();
    let date = new Date();
    let bakConfFile = confBakDir + file + '_' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getMilliseconds();
    let oldConfContent = getFileContentByName(confFile);
    fs.writeFileSync(bakConfFile, oldConfContent);
}

/**
 * 将 post 提交内容写入 config.sh 文件（同时备份旧的 config.sh 文件到 bak 目录）
 * @param content
 */
function saveNewConf(file, content) {
    bakConfFile(file);
    switch (file) {
        case "config.sh":
            fs.writeFileSync(confFile, content);
            break;
        case "crontab.list":
            fs.writeFileSync(crontabFile, content);
            break;
        default:
            break;
    }
}

/**
 * 获取文件内容
 * @param fileName 文件路径
 * @returns {string}
 */
function getFileContentByName(fileName) {
    if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, 'utf8');
    }
    return '';
}


var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 登录页面
 */
app.get('/', function (request, response) {
    if (request.session.loggedin) {
        response.redirect('/home');
    } else {
        response.sendFile(path.join(__dirname + '/public/auth.html'));
    }
});

/**
 * 用户名密码
 */
app.get('/changepwd', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/pwd.html'));
    } else {
        response.redirect('/');
    }
});

/**
 * 获取二维码链接
 */

app.get('/qrcode', function (request, response) {
    if (request.session.loggedin) {
        (async () => {
            try {
                await step1();
                const qrurl = await step2();
                if (qrurl != 0) {
                    response.send({ err: 0, qrcode: qrurl });
                } else {
                    response.send({ err: 1, msg: "错误" });
                }
            } catch (err) {
                response.send({ err: 1, msg: err });
            }
        })();
    } else {
        response.send({ err: 1, msg: loginFaild });
    }
})

/**
 * 获取返回的cookie信息
 */

app.get('/cookie', function (request, response) {
    if (request.session.loggedin && cookies != "") {
        (async () => {
            try {
                const cookie = await checkLogin();
                if (cookie.body.errcode == 0) {
                    let ucookie = getCookie(cookie);
                    response.send({ err: 0, cookie: ucookie });
                } else {
                    response.send({ err: cookie.body.errcode, msg: cookie.body.message });
                }
            } catch (err) {
                response.send({ err: 1, msg: err });
            }
        })();
    } else {
        response.send({ err: 1, msg: loginFaild });
    }
})

/**
 * 获取各种配置文件api
 */

app.get('/api/config/:key', function (request, response) {
    if (request.session.loggedin) {
        if (configString.indexOf(request.params.key) > -1) {
            switch (request.params.key) {
                case 'config':
                    content = getFileContentByName(confFile);
                    break;
                case 'sample':
                    content = getFileContentByName(sampleFile);
                    break;
                case 'crontab':
                    content = getFileContentByName(crontabFile);
                    break;
                default:
                    break;
            }
            response.setHeader("Content-Type", "text/plain");
            response.send(content);
        } else {
            response.send("no config");
        }
    } else {
        response.send(loginFaild);
    }
})

/**
 * 首页 配置页面
 */
app.get('/home', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/home.html'));
    } else {
        response.redirect('/');
    }

});

/**
 * 对比 配置页面
 */
app.get('/diff', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/diff.html'));
    } else {
        response.redirect('/');
    }

});

/**
 * crontab 配置页面
 */
app.get('/crontab', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/crontab.html'));
    } else {
        response.redirect('/');
    }

});


/**
 * auth
 */
app.post('/auth', function (request, response) {
    let username = request.body.username;
    let password = request.body.password;
    fs.readFile(authConfigFile, 'utf8', function (err, data) {
        if (err) console.log(err);
        var con = JSON.parse(data);
        if (username && password) {
            if (username == con.user && password == con.password) {
                request.session.loggedin = true;
                request.session.username = username;
                response.send({ err: 0 });
            } else {
                response.send({ err: 1, msg: authError });
            }
        } else {
            response.send({ err: 1, msg: "请输入用户名密码!" });

        }
    });

});

/**
 * change pwd
 */
app.post('/changepass', function (request, response) {
    if (request.session.loggedin) {
        let username = request.body.username;
        let password = request.body.password;
        let config = {
            user: username,
            password: password
        }
        fs.writeFile(authConfigFile, JSON.stringify(config), function (err) {
            if (err) {
                response.send({ err: 1, msg: "写入错误请重试!" });
            } else {
                response.send({ err: 0, msg: "更新成功!" });
            }
        })

    } else {
        response.send(loginFaild);

    }
});

/**
 * change pwd
 */
app.get('/logout', function (request, response) {
    request.session.destroy()
    response.redirect('/');

});

/**
 * save config
 */

app.post('/api/save', function (request, response) {
    if (request.session.loggedin) {
        let postContent = request.body.content;
        let postfile = request.body.name;
        saveNewConf(postfile, postContent);
        response.send({ err: 0, title:"保存成功! ", msg: "将自动刷新页面查看修改后的 " + postfile + " 文件" });
    } else {
        response.send({ err: 1, title:"保存失败! ",msg: loginFaild });
    }

});

checkConfigFile()

app.listen(5678, () => {
    console.log('应用正在监听 5678 端口!');
});