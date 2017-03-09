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


    /* =================/APP loading动画===================== */

    window.Ubase.beforeInit = function (transition) {

        gConfig = transition.config
        gRouter = transition.router

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

    _.s = JSON.stringify
})()
