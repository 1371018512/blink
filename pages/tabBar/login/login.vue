<template>
	<view>
		 
	</view>
</template>

<script>
	var sign = require('../../../common/sign.js');
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			test:function(){
				console.log("登录成功");
			}
		},
		onBackPress:function(){
			// #ifdef APP-PLUS  
			plus.runtime.quit();  
			// #endif
		},
		onLoad:function(option){
			
			uni.showLoading({title:"尝试登录中...", icon:"none"});
			
			sign.sign(this.apiServer);
			
			var _self = this;
			//console.log(option);
			// app
			// #ifdef APP-PLUS
			uni.login({
				provider: 'weixin',
				//openid等信息
				success: (res) => {
					//console.log(JSON.stringify(res));
					uni.getUserInfo({
						//用户个人信息
						success:function(info){
							console.log(JSON.stringify(info));
							//获取签名
							var sign = uni.getStorageSync('sign');
							console.log(sign);
							uni.request({
								url: _self.apiServer+'member&m=login',								method: 'POST',
								header: {'content-type' : "application/x-www-form-urlencoded"},
								data: {
									openid:info.userInfo.openId,
									name:info.userInfo.nickName,
									face:info.userInfo.avatarUrl,
									sign:sign								},
								success:function(res){
									res=res.data;
									console.log(res.data)
									if(res.status == 'ok'){
										uni.showToast({title:'登录成功！'});
										uni.setStorageSync('SUID', res.data.u_id + '');
										uni.setStorageSync('SRAND', res.data.u_random + '');
										uni.setStorageSync('SNAME', res.data.u_name + '');
										uni.setStorageSync('SFACE', res.data.u_face + ''); 
										if(option.backtype == 1){
											uni.redirectTo({url:option.backpage});
										}else{
											uni.switchTab({url:option.backpage});
										}
									}else{
										console.log(res.data);
									}
									//console.log(JSON.stringify(res));
								},
								fail:function(e){
									console.log(e);
								},
							})
						},
						fail:function(){
							uni.showToast({title:"微信登录授权失败", icon:"none"});
						}
					})
				},
				fail: () => {
					uni.showToast({title:"微信登录授权失败",  icon:"none"});
				}
			})
			// #endif
		}	
	}
</script>

<style>

</style>
