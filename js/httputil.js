;/**
 * 将数据提交到后台，数据格式为字典：
 * {key:value, key:value,...}
 * config属性:$http, url, data, encryptFunction, callbackFunction, errorCallbackFunction, httpConfig, method
 */
var token = "";
function simplePostData(config) {
	var method = config.method;
	if(!method){
		method = "POST";
	}

	var data = config.data;
	//提交到服务器
	config.$http({
		method: method,
		url: config.url,
		data: data
		//withCredentials:true
	}).success(function(result,status,headers,request) {
		var errorCode = result.errorCode;
		if(errorCode == 0) {
			config.callbackFunction(result,status,headers,request);
		} else {
			handleError(result,config.errorCallbackFunction);
		}
	})
	.error(function(result,status,headers,request) {
		if(status == '401'){
			// 验证信息过期则重发请求
			if(headers('stale') == 'true'){
				saveNonce(status,headers);
				simplePostData(config);
			} else {
				// 验证错误则重新登录
				toastr.error('您的登录已超时，请重新登录！');
				location.href="login.html";
			}
		} else {
			toastr.error('服务器错误，请联系管理员！');
		}
	})
}

/**
 * 对返回的错误做处理
 * @param {Object} result
 * @param {errorCallbackFunction} 错误处理方法,返回boolean，表示错误是否已经处理
 */
function handleError(result,errorCallbackFunction){
	//若定义了其他错误处理方法则先运行此方法
	if(typeof(errorCallbackFunction)!='undefined'){
		var isHandled = errorCallbackFunction(result);
		if(isHandled) return;
	}
				
	var errorCode = result["errorCode"];
	var errorInfo = result["errorInfo"];
	
	switch (errorCode){
		//token不正确跳到登录页面
		case 10104: location.href = "login.html";break;
		//无权限显示无权限
		//case 20003: alert("对不起，您无该操作权限");break;
		//其他情况显示错误信息，无错误信息显示错误码
		default: 
			if(errorInfo !=null && errorInfo != "") {
				toastr.error("错误: " + errorInfo);
			} else {
				toastr.error("错误: " + errorCode);
			}
			break;
	}
}

/**
 * 生成随机id
 */
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

/**
 * 判断对象是否为空
 * @param {Object} obj
 */
function isEmpty(obj){
    for ( var name in obj ) {
        return false;
    }
    return true;
}

/**
 * 将空对象转为空字符串
 */
function emptyToBlank(obj){
	if(isEmpty(obj)) return "";
	return obj;
}

/**
 * 将null及"null"字符串转为空字符串
 */
function nullToBlank(obj){
	if(isEmpty(obj)) return "";
	if(obj=="null") return "";
	return obj;
}