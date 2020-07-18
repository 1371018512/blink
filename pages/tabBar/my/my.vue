<template>
	<view>
		<view class="uni-form-item face-around">
			<view class="myface"><image :src="myFace" mode="widthFix"></image></view>
			<text class="myname">{{user.u_name}}</text>
		</view>
		<uni-list class="lists">
			<uni-list-item thumb="../../../static/article.png" title="文章" :rightText="user.artCount+''" @tap="goArt"/>
			<uni-list-item thumb="../../../static/fans.png" title="关注" :rightText="user.u_follows+''" @tap="goFollow"/>
			<uni-list-item thumb="../../../static/integral.png" title="积分" :rightText="user.u_integral+''"/>
			<uni-list-item thumb="../../../static/remainder.png" title="余额" :rightText="user.u_remainder+''"/>
			<uni-list-item thumb="../../../static/message.png" title="消息" :rightText="message+''" :active="!!newMessage" @click="goMes"/>
		</uni-list>
	</view>
</template>

<script>
	var _self,
		loginRes;
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	export default {
		data() {
			return {
				myFace:'',
				user:{},
				message:0,
				newMessage:0
			}
		},
		components:{
			uniList,
			uniListItem
		},
		methods: {
			goFollow:function(){
				uni.navigateTo({
					url:"/pages/tabBar/my/follow",
					animationType: 'pop-in',
					animationDuration: 200
				});
			},
			goArt:function(){
				uni.navigateTo({
					url:"/pages/tabBar/my/art",
					animationType: 'pop-in',
					animationDuration: 200
				});
			},
			goMes:function(){
				uni.navigateTo({
					url:"../../message/message",
					animationType: 'pop-in',
					animationDuration: 200
				});
			}
		},
		onLoad:function(option){
			_self = this
			loginRes=this.checkLogin('../tabBar/my/my',2);
			if(!loginRes)	return false;
			this.myFace = loginRes[3];
		},
		onShow:function(){
			uni.request({
			    url: this.apiServer + 'my&m=info',
			    method: 'POST',
			    header: {'content-type' : "application/x-www-form-urlencoded"},
			    data: {
			        uid    : loginRes[0],
			        random : loginRes[1]
			    },
			    success: res => {
			        console.log(JSON.stringify(res));
			        if(res.data.status == 'ok'){
			            _self.user = res.data.data;
			        }
			    }
			});
			uni.request({
			    url: this.apiServer + 'message&m=getMyMessage',
			    method: 'GET',
			    data: {
			        uid    : loginRes[0],
			        random : loginRes[1]
			    },
			    success: res => {
			        console.log(typeof res,res);
					console.log()
			        if(res.data.status == 'ok'){
						_self.message = res.data.data.messages;
						_self.newMessage = res.data.data.newMessages;
						console.log();
			        }
			    }
			});
		}
	}
</script>

<style>
	page{
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #efeff4;
		min-height: 100%;
		height: auto;
	}
	.myface{
		width:138rpx; 
		height:138rpx; 
		border-radius:15%;
		background-color: #7eb1ef;
		margin:10rpx 30rpx 30rpx 30rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		animation: ani;
		animation-duration: 0.2s;
		animation-delay: 0.6s;
		animation-fill-mode : backwards;
	}
	@keyframes ani{
		from{opacity: 0;}
		to{opacity: 1;}
	}
	.face-around{
		background: #007aff;
		display: flex;
		justify-content: flex-start;
	}
	.myface image{
		width:93%; 
		border-radius:5%;
	}
	.myname{
		color: white;
		font-size: 38rpx;
	}
	.lists{
		animation: ani;
		animation-fill-mode : backwards;
		animation-delay: 0.6s;
		animation-duration: 0.3s;
	}
	@keyframes ani{
		from{opacity: 0;}
		to{opacity: 1;}
	}
</style>
