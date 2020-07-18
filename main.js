import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
//uni.clearStorageSync();
Vue.prototype.checkLogin  = function(backpage, backtype){
	console.log(backpage, backtype);
	console.log(typeof uni.getStorageSync('SUID'))
	var SUID  = uni.getStorageSync('SUID');
	var SRAND = uni.getStorageSync('SRAND');
	var SNAME = uni.getStorageSync('SNAME');
	var SFACE = uni.getStorageSync('SFACE');
	if(!SUID||!SRAND||!SFACE){
		console.log('跳转到登录界面')
		uni.redirectTo({
			url:"../login/login?backpage="+backpage+"&backtype="+backtype
		});
		/* uni.navigateTo({
			url:"../login/login"
		}); */
		return false; 
	}
	return [SUID, SRAND, SNAME, SFACE];
}

Vue.prototype.apiServer = 'http://192.168.43.217/blink_server/index.php?token=api2018&c=';
Vue.prototype.staticServer = 'http://192.168.43.217/blink_server/';
Vue.prototype.date =function(now) { 
	 var year=now.getFullYear(); 
	 var month=now.getMonth()+1; 
	 var date=now.getDate(); 
	 var hour=now.getHours(); 
	 var minute=now.getMinutes(); 
	 var second=now.getSeconds(); 
	 return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
}
Vue.prototype.months = {
	'Jan':1,
	'Feb':2,
	'Mar':3,
	'Apr':4,
	'May':5,
	'Jun':6,
	'Jul':7,
	'Aug':8,
	'Sep':9,
	'Oct':10,
	'Nov':11,
	'Dec':12,
}
Vue.prototype.formatDate =function(date) { 
	 date=date+"";
	 date = date.match(/.+:\d\d/)[0];
	 let dates = date.split(" ");
	 
	 return dates[3]+'.'+this.months[dates[1]]+'.'+dates[2]+' '+dates[4];
}

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
