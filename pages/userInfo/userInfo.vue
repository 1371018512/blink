<template>
	<view class="container">
		<view class="uni-form-item face-around">
			<view class="myface"><image :src="user.u_face" mode="widthFix" @click.stop=""></image></view>
			<view class="myname"><text>{{user.u_name}}</text></view>
			<view class="myname"><text>粉丝 | {{user.u_fans}}</text></view>
			<view class="btns">
				<uni-fav :checked="false" :star="false" class="favBtn" @click="writeLetter" :contentText="contentText[0]"/>
				<uni-fav :checked="myLike" bg-color-checked="#ff5d60" :star="false" class="favBtn" @click="follow" :contentText="contentText[1]"/>
			</view>
		</view>
		<uni-section title="他的最新文章" type="line"></uni-section>
		<uni-list>
			<view v-for="(item,i) in arts" :key="i">
				<uni-list-item  :title="item.art_title" :rightText="formatDate(new Date(item.art_createtime*1000))" @click="goDetail(i)"/>
			</view>
		</uni-list>
		<ygc-comment ref="ygcComment"
		    :placeholder="''" 
			@pubComment="pubComment"></ygc-comment>
	</view>
</template>

<script>
	var _self,
		loginRes;
	import uniSection from '@/components/uni-section/uni-section.vue'
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	export default {
		components: {
			uniSection,
			uniList,
			uniListItem
		},
		data() {
			return {
				user:{},
				contentText:[{
					contentDefault: "私信",
					contentFav: "已评论"
				},{
					contentDefault: "关注",
					contentFav: "已关注"
				}],
				myLike:false,
				page: 1,
				status: "more",
				arts: [],
				letterFlag: false,
				comContent:''
			}
		},
		methods: {
			toggleMask(type) {
				this.$refs.ygcComment.toggleMask(type);
			},
			pubComment(commentContent1) {
				this.$refs.ygcComment.toggleMask();
				this.comContent = commentContent1;
				this.$refs.ygcComment.content = '';
				this.submit();
			},
			submit: function(){
				uni.showModal({
				    title:"提示",
				    content:"确定发送?",
				    success:function(e){
						if(e.confirm == true){
							uni.request({
								url: _self.apiServer + 'message&m=addMessage',
								method: 'POST',
								header: {'content-type' : "application/x-www-form-urlencoded"},
								data:{
									uid     : loginRes[0],
									random  : loginRes[1],
									starid  : _self.user.u_id,
									uname   : uni.getStorageSync('SNAME'),
									content	: _self.comContent
								},
								success:function(res){
									console.log(res);
									_self.comContent = '';
								},
								fail: (e) => {
									console.log('私信发送失败！');
								}
							});
						}
					},
				});
			},
			writeLetter: function(){
				_self.toggleMask('show');
			},
			follow :function(){
				uni.request({
					url: _self.apiServer + 'like&m=addUserLike',
					method: 'POST',
					header: {'content-type' : "application/x-www-form-urlencoded"},
					data: {
						uid : loginRes[0],
						random : loginRes[1],
						starid : _self.user.u_id,
						uname : loginRes[2]
					},
					success:function(res){
						_self.myLike = res.data.data == -1?false:true;
						_self.user.u_fans = parseInt(_self.user.u_fans) + res.data.data;
						console.log(res)
					}
				});
			},
			goDetail:function(index){
				uni.navigateTo({
					url:'../detail/detail?artId='+_self.arts[index].art_id+'&artUid='+_self.arts[index].art_uid,
					animationType: 'pop-in',
					animationDuration: 200
				})
			},
			getUserInfo: function(uid){
				uni.request({
					url: _self.apiServer + 'member&m=info&uid='+uid,
					method: 'GET',
					success: result =>{
						console.log(result);
						_self.user = result.data.data
						_self.getArtList();
						_self.getFollow();
					}
				})
			},
			getFollow: function(){
				uni.request({
					url: _self.apiServer + 'like&m=getFollow',
					header: {'content-type' : "application/x-www-form-urlencoded"},
					data:{
						uid    : loginRes[0],
						random : loginRes[1]
					},
					method: 'POST',
					success: result =>{
						console.log(result);
						result = JSON.parse(result.data.data.ul_likes)
						if(result[_self.user.u_id]!=null){
							_self.myLike = result[_self.user.u_id];
						}
					}
				})
			},
			getArtList :function(){
				if(this.status != 'more'){return ;}
				this.status = 'loading';
				uni.request({
					url: this.apiServer + 'art&m=getList&page='+_self.page+'&type=1&uid='+_self.user.u_id+'&searching=false',
					method: 'GET',
					success: res => {
						if(res.data.status == 'ok'){
							_self.page++;
							if(res.data.data.length<10)
								_self.status = 'noMore';
							else
								_self.status = 'more';
							_self.arts = _self.arts.concat(res.data.data);
							console.log(_self.arts);
						}else if(res.data.status == 'empty'){
							_self.status = 'noMore';
						}else{
							_self.status = 'more';
							console.log(res)
						}
					}
				});
			},
		},
		onLoad(option) {	
			_self = this;
			loginRes=this.checkLogin('../../userInfo/userInfo',1);
			if(!loginRes)	return false;
			this.getUserInfo(option.uid);
		}
	}
</script>

<style>
	.uni-input-wrapper{
		margin-top:20rpx;
	}
	page{
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #efeff4;
		min-height: 100%;
		width: 750rpx;
		height: auto;
	}
	.face-around{
		background-color: #007aff;
		display: flex;
		color: #ffffff;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.myface{
		width:138rpx; 
		height:138rpx; 
		border-radius:50%;
		background-color: #7eb1ef;
		margin:10rpx 30rpx 10rpx 30rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.myface image{
		width: 90%;
		border-radius:50%;
	}
	.btns{
		padding: 20rpx 0;
		display: flex;
		width: 100%;
		flex-direction: row;
		justify-content: space-around;
	}
</style>
