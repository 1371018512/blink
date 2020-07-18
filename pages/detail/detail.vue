<template>
	<view>
		<view class="uni-form-item face-around">
			<view class="myface">
				<image :src="author.u_face" mode="widthFix" @click.stop="goUserInfo"></image>
				<view class="byFace">{{caties[art.art_cate]}}</view>
			</view>
			<text class="myname">{{author.u_name}}</text>
			<view class="btns">
				<uni-fav :checked="false" :star="false" class="favBtn" @click="toggleMask('show')" :contentText="contentText[0]"/>
				<uni-fav :checked="myLike" bg-color-checked="#ff5d60" :star="false" class="favBtn" @click="like" :contentText="contentText[1]"/>
			</view>
		</view>
		<view class="uni-padding-wrap container">
			<view class="title"><strong>{{art.art_title}}</strong></view>
			<view class="uni-form-item moods">
				<view class="tag-view" v-for="(item,i) in mood" >
					<uni-tag @tap="" :mark="true" :text="item.content" :type="item.type" size="small" />
				</view>
			</view>
			<view class="content">
				{{art.art_content}}
			</view>
			<view class="picContainer" @click.stop="previewImg($event)">
				<block v-for="(item, index) in picture" :key="index">
					<view  v-if="item.type == 'image'"><image class="uni-uploader__img" :src="item.content" :data-index="index" mode="aspectFill" @tap="" /></view>
				</block>
			</view>
		</view>
		<view class="container uni-padding-wrap">
			<view class="header">
				<strong>评论</strong>
				<!--这里要改一下，comments不刷新-->
				<text style="color: #b9b9b9;">{{art.art_comments}}</text>
			</view>
			<view class="uni-form-item comContainer" v-for="(item,i) in comment" :key="i">
				<view class="myface-mini"><image :src="item.u_face" mode="widthFix"></image></view>
				<view class="comContent">
					<view class="commentHeader">
						<text class="myname-mini">{{item.u_name}}</text>
					</view>
					<view class="uni-comment-content">
						<text>{{item.c_content}}</text>
					</view>
					<view class="commentTime">
						<text>--{{formatDate(new Date(item.c_time*1000))}}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- <view class="uni-form-item uni-column addCom">
		    <view class="uni-input-wrapper">

				<input class="uni-input" placeholder="输入评论" v-model="comContent" @input="" />
				<text style="width: 70rpx;" @click="submit">评论</text>
		    </view>
		</view> -->
		<ygc-comment ref="ygcComment"
		    :placeholder="'发布评论'" 
			@pubComment="pubComment"></ygc-comment>
		<uni-load-more color="#007AFF" :status="status"/>
	</view>
</template>

<script>
	var _self,
		loginRes;
	import uniTag from '@/components/uni-tag/uni-tag.vue';
	import ygcComment from '@/components/ygc-comment/ygc-comment.vue';
	import uniFav from '@/components/uni-fav/uni-fav.vue'
	export default {
		data() {
			return {
				caties:[
					'😆',
					'😄',
					'😃',
					'😆',
					'😀',
					'🙂',
					'😐',
					'😑',
					'😧',
					'😢',
					'😭',
				],
				myLike:false,
				author:{},
				art:{},
				mood:[],
				showFollow:true,
				picture:[],
				comment:[],
				comContent:'',
				page:1,
				contentText:[{
					contentDefault: "评论",
					contentFav: "已评论"
				},{
					contentDefault: "点赞",
					contentFav: "已点赞"
				}],
				status: 'more',
			}
		},
		components:{
			uniTag,
			ygcComment,
			uniFav,
		},
		methods: {
			getLike: function(){
				uni.request({
					url: _self.apiServer + 'like&m=getArtLike',
					header: {'content-type' : "application/x-www-form-urlencoded"},
					data:{
						uid    : loginRes[0],
						random : loginRes[1]
					},
					method: 'POST',
					success: result =>{
						result = JSON.parse(result.data.data.al_likes)
						console.log(_self.art);
						if(result[_self.art.art_id]!=null){
							_self.myLike = result[_self.art.art_id]
						}
					}
				})
			}, 
			goUserInfo: function(){
				uni.navigateTo({
					url:'../userInfo/userInfo?uid='+_self.author.u_id,
					animationType: 'pop-in',
					animationDuration: 200
				})
			},
			previewImg(e){
				//console.log(_self.picture[e.target.dataset.index])
				let pics = [];
				_self.picture.forEach(function(item,i){
					pics.push(item.content);
				})
				uni.previewImage({  
					urls: pics,  
					indicator: "number",  
					current: pics[e.target.dataset.index],  
					longPressActions: {  
						itemList: ['分享', '保存图片'],  
						success: function(res) {  
							console.log('选中了第' + (res.tapIndex + 1) + '个按钮');  
						},  
						fail: function(res) {  
							console.log(res.errMsg);  
						}  
					}  
				});  
			},
			toggleMask(type) {
				this.$refs.ygcComment.toggleMask(type);
			},
			pubComment(commentContent1) {
				this.$refs.ygcComment.toggleMask();
				this.comContent = commentContent1;
				this.$refs.ygcComment.content = '';
				this.submit();
			},
			getComments: function(){
				if(this.status != 'more'){return ;}
				this.status = 'loading';
				uni.request({
					url: _self.apiServer + 'art&m=getCommentList&artid='+_self.art.art_id+'&page='+_self.page,
					method: 'GET',
					success: result =>{
						if(result.data.status != 'empty')
							_self.comment = _self.comment.concat(result.data.data);
						console.log(result);
						if(result.data.data<5)
							_self.status = 'noMore';
						else
							_self.status = 'more';
						_self.page++;
					}
				})
			},
			like: function(){
				uni.request({
					url: _self.apiServer + 'like&m=addArtLike',
					method: 'POST',
					header: {'content-type' : "application/x-www-form-urlencoded"},
					data: {
						uid : loginRes[0],
						random : loginRes[1],
						artId : _self.art.art_id
					},
					success:function(res){
						_self.myLike = res.data.data == -1?false:true;
						uni.setStorageSync('needFresh','true');
					}
				});
			},
			submit: function(){
				console.log(_self.comContent);
				uni.showModal({
				    title:"提示",
				    content:"确定要评论吗?",
				    success:function(e){
						if(e.confirm == true){
							uni.request({
								url: _self.apiServer + 'art&m=addComment',
								method: 'POST',
								header: {'content-type' : "application/x-www-form-urlencoded"},
								data:{
									uid     : loginRes[0],
									random  : loginRes[1],
									uname   : loginRes[2],
									artTitle : _self.art.art_title,
									starid  : _self.author.u_id, 
									artId	: _self.art.art_id,
									content	: _self.comContent
								},
								success:function(res){
									console.log(res);
									_self.page = 1;
									_self.comment = [];
									_self.getComments();
									_self.art.art_comments = 1 + parseInt(_self.art.art_comments);
									uni.setStorageSync('needFresh','true');
								},
								fail: (e) => {
									console.log(this.apiServer + 'art&m=addComment');
								}
							});
						}
					},
				});
			},
			getArt: function(){
				uni.request({
					url: _self.apiServer + 'member&m=info&uid='+_self.author.u_id,
					method: 'GET',
					success: result =>{
						_self.author = JSON.parse(JSON.stringify(result.data.data))
						if(loginRes[0]==_self.author.id)
							_self.showFollow = false;
						console.log(_self.author);
					}
				})
				uni.request({
					url: _self.apiServer + 'art&m=info&artid='+_self.art.art_id,
					method: 'GET',
					success: result =>{
						console.log(result);
						_self.art = result.data.data;
						_self.mood = JSON.parse(_self.art.art_mood);
						_self.picture = JSON.parse(_self.art.art_picture);
						_self.getLike();
						_self.getComments();
					}
				})
				
			},
		},
		onLoad:function(option){
			_self = this;
			_self.author.u_id = option.artUid;
			_self.art.art_id = option.artId;
			loginRes=this.checkLogin('../../detail/detail',1);
			if(!loginRes)	return false;
			this.getArt();
		},
		onShow:function(){
		},
		onPullDownRefresh: function() {
			//下拉刷新的时候请求一次数据
			console.log('下拉');
			uni.stopPullDownRefresh();
		},
		onReachBottom: function() {
			//触底的时候请求数据，即为上拉加载更多
			//为了更加清楚的看到效果，添加了定时器
			console.log('上拉')
			_self.getComments();
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
	.btns{
		margin-right: 25rpx;
		position: absolute;
		margin-left: 590rpx;
	}
	.favBtn{
		margin: 0 20rpx 20rpx 0;
	}
	.container{
		margin: 10rpx 0;
		padding-bottom: 20rpx;
		background-color: white;
	}
	.comContainer{
		margin-top: 10rpx;
		border-bottom: #efeff4 solid 1rpx ;
		animation-name: ani;
		animation-fill-mode : backwards;
		animation-delay: 0.5s;
		animation-duration: 0.3s;
	}
	@keyframes ani{
		from{opacity: 0;}
		to{opacity: 1;}
	}
	.content{
		font-size: 35rpx;
		margin: 20rpx 0;
	}
	.myface{
		width:138rpx; 
		height:138rpx; 
		border-radius:50%;
		background-color: #7eb1ef;
		margin:10rpx 30rpx 30rpx 30rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.myface-mini{
		width:88rpx; 
		height:88rpx; 
		border-radius:50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.face-around{
		background-color: #007aff;
		display: flex;
		justify-content: flex-start;
	}
	.myface image{
		width: 90%;
		border-radius:50%;
	}
	.myface-mini image{
		border-radius:50%;
	}
	.myname{
		color: white;
		font-size: 38rpx;
	}
	.title{
		font-size: 60rpx;
	}
	.uni-form-item{
		padding: 20rpx 0;
	}
	.tag-view {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		margin: 10rpx 15rpx 10rpx 0rpx;
		justify-content: center;
	}
	.moods{
		flex-wrap: wrap;
	}
	.picContainer{
		display: flex;
		flex-wrap: wrap;
	}
	.uni-uploader__img{
		width: 219rpx;
		margin: 6rpx;
	}
	.header{
		display: flex;
		font-size: 35rpx;
	}
	.commentHeader{
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.comContent{
		width: 100%;
		padding: 5rpx;
	}
	.uni-comment-content{
		word-break:break-all;
	}
	.commentTime{
		text-align: right;
	}
	.uni-input-wrapper{
		display: flex;
		align-items: center;
		flex-direction: row;
	}
	.uni-input {
	    font-size: 40rpx;
		margin: 10rpx 20rpx;
	    padding: 10rpx;
	    background-color: #ebebeb;
		border-radius: 25rpx;
	}
	.addCom{
		background-color: white;
	}
	.byFace{
		font-size: 45rpx;
		position: absolute;
		margin: 50rpx 0 0 50rpx;
		z-index: 2;
	}
</style>
