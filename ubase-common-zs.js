(function () {
    var gCurrentRoute = null
    var gRouter = null
    var gConfig = null
    var gRoutes = []
    var gResource = null
    var gUserInfo = {
        "userAvatar": "http://ossdomain/aaa/bbb/ccc_token/",
        "userName": "姓名",
        "userAccount": "职工号或者学号或者临时人员号",
        "userGenderCode": "性别代码",
        "userGender": "性别",
        "userDepartmentCode": "部门代码",
        "userDepartment": "所属部门",
        "userMajorCode": "专业代码",
        "userMajor": "专业",
        "userGrade": "年级",
        "userClassCode": "班级代码",
        "userClass": "班级",
        "userMail": "用户邮箱",
        "userCellPhone": "用户手机号"
    }

    window.Utils = {}


    var loadingCss = '.app-ajax-loading .bh-loader-icon-line-border{border: 0px solid #ddd;box-shadow:none;}.app-ajax-loading{position:fixed;z-index:30000;}.app--loading{position:fixed;opacity:0;top:150px;left:-75px;margin-left:50%;z-index:-1;text-align:center}.app-loading-show{z-index:999999;animation:fade-in;animation-duration:0.5s;-webkit-animation:fade-in 0.5s;opacity:1;}@keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}@-webkit-keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}.spinner>div{width:30px;height:30px;background-color:#4DAAF5;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both}.spinner .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bouncedelay{0%,100%,80%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}'

    var style = document.createElement('style')
    style.innerText = loadingCss
    document.getElementsByTagName('head')[0].appendChild(style)

    document.getElementsByTagName('body')[0].insertAdjacentHTML("beforeEnd",'<div class="app-ajax-loading" style="position:fixed;z-index:30000;background-color:rgba(0,0,0,0);"></div><div class="app--loading"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>')

    function showLoading(){
        document.getElementsByClassName('app--loading')[0].className = 'app--loading app-loading-show'
    }

    function hideLoading(){
        document.getElementsByClassName('app--loading')[0].className = 'app--loading'
    }
    /* =================/APP loading动画===================== */

    window.Ubase.beforeInit = function (transition) {

        gConfig = transition.config
        gRouter = transition.router

        if(location.host.indexOf('localhost') === -1 && location.host.indexOf('172.') === -1){
            gConfig['RESOURCE_SERVER'] = 'http://feres.cpdaily.com'
        }

        gResource = getResource()

        loadCss()

        loadJs(function () {
            transition.next()
        })
    }

    function getResource() {
        var resource = {
            'RESOURCE_VERSION': '100003',
            'PUBLIC_CSS': [
                '/bower_components/iview/styles/iview.css'
            ],

            'PUBLIC_BASE_JS': [
                '/bower_components/fetch/fetch.min.js',
                '/bower_components/lodash/4.17.4/lodash.min.js',
                '/bower_components/iview/iview.js'
            ],

            'PUBLIC_NORMAL_JS': [

            ]
        }
        return resource
    }

    function loadCss() {
        var publicCss = getPublicCss()
        _.each(publicCss, function (item) {
            var link = document.createElement('link')
            link.type = 'text/css'
            link.rel = 'stylesheet'
            link.href = item
            document.getElementsByTagName('head')[0].appendChild(link)
        })
    }

    function loadJs(callback) {
        var publicNormalJs = getPublicNormalJs()
        var publicBaseJs = getPublicBaseJs()

        if (publicBaseJs) {
            $script(publicBaseJs, function () {
                if (publicNormalJs && publicNormalJs.length > 0) {
                    $script(publicNormalJs, function () {
                        callback()
                    })
                } else {
                    callback()
                }

            })
        } else if (publicNormalJs && publicNormalJs.length > 0) {
            $script(publicNormalJs, function () {
                callback()
            })
        } else {
            callback()
        }
    }

    function getUserParams() {
        var params = {};
        var search = location.search && location.search.substr(1);

        if (search) {
            var paramsArr = search.split('&');
            _.each(paramsArr, function (item) {
                var kv = item.split('=');
                if (kv.length == 2) {
                    params[kv[0]] = kv[1];
                }
            })
        }

        return params;
    }

    function getCdn() {
        return gConfig['RESOURCE_SERVER'] || 'http://res.wisedu.com'
    }

    function getPublicCss() {
        var config = gConfig
        var cdn = getCdn()
        var publicCss = gResource['PUBLIC_CSS']
        var bhVersion = config['BH_VERSION']
        var version = bhVersion ? ('-' + bhVersion) : ''
        var theme = config['THEME'] || 'blue'
        var regEx = /fe_components|bower_components/
        var cssUrl = []

        for (var i = 0; i < publicCss.length; i++) {
            var url = addTimestamp(publicCss[i])
            if (regEx.test(publicCss[i])) {
                cssUrl.push(cdn + url.replace(/\{\{theme\}\}/, theme).replace(/\{\{version\}\}/, version))
            } else {
                cssUrl.push(url)
            }
        }

        return cssUrl
    }

    function getPublicNormalJs() {
        var cdn = getCdn()
        var publicNormalJs = gResource['PUBLIC_NORMAL_JS']
        var bhVersion = gConfig['BH_VERSION']
        var version = bhVersion ? ('-' + bhVersion) : ''
        var deps = []

        var regEx = /fe_components|bower_components/
        for (var i = 0; i < publicNormalJs.length; i++) {
            var url = addTimestamp(publicNormalJs[i])
            if (regEx.test(publicNormalJs[i])) {
                deps.push(cdn + url.replace(/\{\{version\}\}/, version))
            } else {
                deps.push(url)
            }
        }

        return deps
    }

    function getPublicBaseJs() {
        var cdn = getCdn()
        var publicBaseJs = gResource['PUBLIC_BASE_JS']

        var bhVersion = gConfig['BH_VERSION']
        var version = bhVersion ? ('-' + bhVersion) : ''

        var deps = []
        var regEx = /fe_components|bower_components/

        for (var i = 0; i < publicBaseJs.length; i++) {
            var url = addTimestamp(publicBaseJs[i])
            if (regEx.test(publicBaseJs[i])) {
                deps.push(cdn + url.replace(/\{\{version\}\}/, version))
            } else {
                deps.push(url)
            }
        }

        return deps
    }

    function addTimestamp(url) {
        var resourceVersion = gResource['RESOURCE_VERSION'] || (+new Date())

        return url + '?rv=' + resourceVersion
    }

    Utils.post = function (url, data, ignoreCode) {
        if(!(data && data._showLoading === false)){
            showLoading()
        }
        return fetch(url, {
            credentials: 'include',
            method: "POST",
            body: data?JSON.stringify(data):{},
            headers: {
                "Accept":"application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
        }).then(function(response) {
            if(!(data && data._showLoading === false)){
                hideLoading()
            }
            return response.json()
        }).then(function(res) {
            if(res['unauthorizedAjax-d3472c24-cc96-47ba-9498-27aaf2692cd3'] == '500'){
                window.parent.location.href = '/enroll-authen/login/index.html'
            }
            if (res.code  === '0' || res.code === 0 || ignoreCode) {
                return res
            } else {
                throw res
            }
        })
    }

    _.s = JSON.stringify

    Date.prototype.Format = function(fmt)
    { //author: meizz
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    }

})()
