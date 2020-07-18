<template>
	<view>
		<view class="header">
			<view class="header_item" @click="checkAll()" hover-class="header_item_hover">
				<image src="../../static/bell.png" mode="widthFix"></image>
				确认所有消息
				<image src="../../static/right.png" mode="widthFix"></image>
			</view>
			<view class="header_item" @click="deleteAll" hover-class="header_item_hover">
				<image src="../../static/trash.png" mode="widthFix" ></image>
				清空消息
				<image src="../../static/right.png" mode="widthFix"></image>
			</view>
		</view>
		<!-- <uni-list>
			<view v-for="(item,i) in message">
				<uni-list-item 
				:show-arrow="false" 
				:title="item.mes_title" 
				:note="item.mes_content" 
				:show-badge="item.mes_status==0" 
				badge-text="new" 
				badgeType="primary"
				@click="item.mes_status==0?checkMessage(item.mes_id,i):''"
				@long="deleteMessage(item.mes_id,i)"/>
			</view>
		</uni-list> -->
		<uni-list>
			<scroll-view v-for="(item,i) in message">
				<!-- <uni-list-item
				:show-arrow="false" 
				:title="item.mes_title" 
				:note="item.mes_content" 
				:show-badge="item.mes_status==0" 
				badge-text="new" 
				badgeType="primary"
				@click="item.mes_status==0?checkMessage(item.mes_id,i):''"
				@long="deleteMessage(item.mes_id,i)"/> -->
				<!-- <view class="scroll-view-item_H">
					{{item.mes_title}}
					{{item.mes_content}}
				</view> -->
				<uni-list-item
				class=""
				:show-arrow="false" 
				:title="item.mes_title" 
				:note="item.mes_content" 
				:show-badge="item.mes_status==0" 
				badge-text="new" 
				badgeType="primary"
				@click="item.mes_status==0?checkMessage(item.mes_id,i):''"
				@long="deleteMessage(item.mes_id,i)"/>
				
			</scroll-view>
		</uni-list>
		<uni-load-more color="#007AFF" :status="status"/>
	</view>
</template>

<script>
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	import uniSwipeAction from '@/components/uni-swipe-action/uni-swipe-action.vue'
	import uniSwipeActionItem from '@/components/uni-swipe-action-item/uni-swipe-action-item.vue'
	var _self,
		loginRes;
	export default {
		data() {
			return {
				options1: [{
					text: '删除文章'
				}],
				message:[],
				page:1,
				status: 'more',
			}
		},
		components: {
			uniSwipeAction,
			uniSwipeActionItem
		},
		methods: {
			getMessage: function(){
				uni.request({
					url: _self.apiServer + 'message&m=getMessage&uid='+uni.getStorageSync('SUID')+'&page='+_self.page,
					method: 'GET',
					success: result =>{
						if(result.data.status != 'empty')
							_self.message = _self.message.concat(result.data.data);
						console.log(result);
						if(result.data.data.length<15)
							_self.status = 'noMore';
						else
							_self.status = 'more';
						_self.page++;
					}
				})
			},
			checkMessage: function(mes_id,i){
				uni.request({
					url: _self.apiServer + 'message&m=checkMessage',
					method: 'POST',
					header: {'content-type' : "application/x-www-form-urlencoded"},
					data: {
						uid : loginRes[0],
						random : loginRes[1],
						messageId : mes_id
					},
					success:function(res){
						_self.$set(_self.message[i], 'mes_status', 1);
					}
				})
			},
			checkAll: function(){
				uni.request({
					url: _self.apiServer + 'message&m=checkAll',
					method: 'POST',
					header: {'content-type' : "application/x-www-form-urlencoded"},
					data: {
						uid : loginRes[0],
						random : loginRes[1],
					},
					success:function(res){
						_self.message.forEach((item,i)=>{
							_self.$set(item, 'mes_status', 1);
						})
					}
				})
			},
			deleteMessage: function(mes_id,i){
				console.log('long');
				uni.showModal({
				    title:"提示",
				    content:"确定要删除吗?",
				    success:function(e){
						if(e.confirm == true){
							uni.request({
								url: _self.apiServer + 'message&m=deleteMessage',
								method: 'POST',
								header: {'content-type' : "application/x-www-form-urlencoded"},
								data: {
									uid : loginRes[0],
									random : loginRes[1],
									messageId : mes_id
								},
								success:function(res){
									console.log('xx')
									//_self.$set(_self.message[i], 'mes_status', 1);
									_self.message.splice(i,1);
								}
							})
						}
					},
				});
			},
			deleteAll: function(){
				console.log('deleteAll')
				uni.showModal({
				    title:"提示",
				    content:"确定要清空所有消息吗?",
				    success:function(e){
						if(e.confirm == true){
							uni.request({
								url: _self.apiServer + 'message&m=deleteAll',
								method: 'POST',
								header: {'content-type' : "application/x-www-form-urlencoded"},
								data: {
									uid : loginRes[0],
									random : loginRes[1],
								},
								success:function(res){
									console.log('xx')
									//_self.$set(_self.message[i], 'mes_status', 1);
									_self.message = [];
								}
							})
						}
					},
				});
			}
		},
		onLoad:function(option){
			_self = this;
			loginRes=this.checkLogin('../../message/message',1);
			if(!loginRes)	return false;
		},
		onShow:function(){
			this.getMessage();
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
			this.getMessage();
		},
	}
</script>

<style lang="scss">
	.header{
		flex-direction: row;
		flex-wrap: nowrap;
		display: flex;
		justify-content: space-around;
	}
	.header_item{
		background-color: white;
		padding: 0rpx 10rpx;
		width: 325rpx;
		border-radius: 5rpx ;
		margin: 15rpx 0;
		height: 70rpx;
		display: flex;
		align-items: center;
		color: #a3a3a3;
		justify-content: space-around;
		box-shadow: 5rpx 5rpx 2rpx #dcdcdc;
	}
	.header_item_hover{
		background-color: #e5e5e5;
	}
	.header_item image:nth-child(1){
		width: 40rpx;
	}
	.header_item image:nth-child(2){
		width: 40rpx;
	}
	.scroll-view_H {
		white-space: nowrap;
		width: 100%;
	}
	.scroll-view-item_H {
		display: inline-block;
		width: 100%;
	}
	.scroll-view-right_H {
		display: inline-block;
		width: 20%;
		height: 200rpx;
		padding-top: 0rpx;
		vertical-align: middle;
		text-align: center;
		font-size: 33rpx;
		color: white;
	}
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #efeff4;
		min-height: 100%;
		height: auto;
	}
	view {
		font-size: 14px;
		line-height: inherit;
	}
	.checkAll_hover{
		background-color: #eeeeee;
	}
</style>
