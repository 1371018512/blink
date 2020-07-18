<template>
	<view>
	<uni-search-bar class="search" radius="100" placeholder="搜索" @confirm="search" @input="input"/>
	<view class="uni-padding-wrap uni-common-mt">
		<uni-segmented-control :current="SegInd" :values="segs" style-type="button" active-color="#007aff" @clickItem="segsClick" />
	</view>
	<view :class="loaded?'myart-list-active':'myart-list'">
		<view v-for="(item, index) in arts" :key="index">
			<view class="example-box">
				<uni-card 
				:is-shadow="true" 
				:title="item.art_title" 
				:mode="'style'" 
				:thumbnail="picture[index][0]?picture[index][0].content:''" 
				:extra="formatDate(new Date(item.art_createtime*1000))" 
				@tap="goDetail(index)"
				note="true" >
					<view class="myface">
						<image :src="item.u_face" mode="widthFix"></image>
						<view class="byFace">{{caties[item.art_cate]}}</view>
					</view>
					<view class="uni-form-item moods" >
						<view class="tag-view" v-for="(mymood,i) in mood[index]" >
							<uni-tag :circle="true" :text="mymood.content" :type="mymood.type" size="small" />
						</view>
					</view>
					<text class="content-box-text">{{item.art_content}}</text>
					<text class="content-box-author">
						-- {{item.u_name}}
					</text>
					<template slot="footer">
						<view class="footer-box">
							<view @click.stop="footerClick('喜欢',item.art_id,index)">
								<text v-show="item.like">❤</text>
								<text v-show="!item.like">♡</text>
								<text class="footer-box__item"> 喜欢{{item.art_likes}}</text>
							</view>
							<view @click.stop="footerClick('评论',item.art_id,index)"><text class="footer-box__item"> 评论{{item.art_comments}}</text></view>
							<view v-show="showDelete[index]==true" @click.stop="footerClick('删除',item.art_id,index)"><text class="footer-box__item"> 删除</text></view>
						</view>
					</template>
				</uni-card>
			</view>
		</view>
	</view>
	<ygc-comment ref="ygcComment"
	    :placeholder="''" 
		@pubComment="pubComment"></ygc-comment>
	<uni-fab
	ref="fab" 
	:pattern="pattern" 
	:content="content" 
	horizontal="right" 
	vertical="top" 
	direction="horizontal" 
	@trigger="trigger" 
	@fabClick="fabClick" />
	<uni-load-more color="#007AFF" :status="status"/>
	<!-- <view class="loadMore" @tap="getArtList">{{loadMore}}</view> -->
	</view>
</template>

<script>
	var _self,
		loginRes;
	import uniFab from '@/components/uni-fab/uni-fab.vue'
	import uniTag from '@/components/uni-tag/uni-tag.vue';
	import uniSection from '@/components/uni-section/uni-section.vue'
	import uniCard from '@/components/uni-card/uni-card.vue'
	import ygcComment from '@/components/ygc-comment/ygc-comment.vue';
	import uniSearchBar from '@/components/uni-search-bar/uni-search-bar.vue'
	import uniSegmentedControl from '@/components/uni-segmented-control/uni-segmented-control.vue'
	export default {
		components:{
			uniSection,
			uniCard,
			uniTag,
			uniFab,
			ygcComment,
			uniSearchBar,
			uniSegmentedControl
		},
		data() {
			return {
				segs: ['所有', '关注'],
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
				sortBy:1,
				SegInd:0,
				status: 'more',
				page :1,
				arts :[],
				picture :[],
				mood:[],
				comContent:'',
				comArtId:0,
				comArtIndex:0,
				comUid:0,
				showDelete:[],
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor: '#007AFF'
				},
				content: [{
						iconPath: '/static/fire.png',
						selectedIconPath: '/static/fire_blue.png',
						text: '按热度',
						active: false
					},{
						iconPath: '/static/clock.png',
						selectedIconPath: '/static/clock_blue.png',
						text: '按时间',
						active: true
					}
				],
				comArtTitel:'',
				loaded:false,
				searching:false,
				searchVal:'',
				realSearchVal:''
			}
		},
		methods: {
			input(res) {
				this.searchVal = res.value
			},
			segsClick(){
				_self.SegInd = _self.SegInd == 1 ? 0 : 1;
				_self.reset();
			},
			fabClick:function() {
			},
			search: function(){
				_self.realSearchVal = _self.searchVal;
				_self.searching = true;
				_self.loaded = false;
				//确保闪现时透明度为0
				_self.reset()
			},
			reset:function(){
				//首先变成透明，然后等待刷新
				_self.loaded = false;
				//确保闪现时透明度为0
				setTimeout(function(){
					_self.mood = [];
					_self.status ='more',
					_self.page = 1;
					_self.arts = [];
					_self.picture =[];
					_self.getArtList();
				},100)
			},
			trigger:function(e) {
				_self.content[_self.sortBy].active = false;
				_self.content[e.index].active = true;
				if(_self.sortBy!=e.index){
					_self.sortBy = e.index;
					_self.reset();
				}
			},
			toggleMask(type,artId,index) {
				this.comArtId = artId;
				this.comArtIndex = index;
				this.comUid = _self.arts[index].art_uid;
				this.$refs.ygcComment.toggleMask(type);
			},
			pubComment(commentContent1) {
				this.$refs.ygcComment.toggleMask();
				this.comContent = commentContent1;
				this.$refs.ygcComment.content = '';
				this.submit();
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
									uname   : uni.getStorageSync('SNAME'),
									artTitle: _self.comArtTitel,
									artId	: _self.comArtId,
									content	: _self.comContent,
									starid  : _self.comUid,
								},
								success:function(res){
									console.log(res);
									_self.$set(_self.arts[_self.comArtIndex], 'art_comments', parseInt(_self.arts[_self.comArtIndex].art_comments) + 1);
									_self.comContent = '';
								},
								fail: (e) => {
									console.log(this.apiServer + 'art&m=addComment');
								}
							});
						}
					},
				});
				
			},
			goDetail:function(index){
				uni.navigateTo({
					url:'../../detail/detail?artId='+_self.arts[index].art_id+'&artUid='+_self.arts[index].art_uid,
					animationType: 'pop-in',
					animationDuration: 200
				})
			},
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
						console.log(result)
						result = result.data.data.al_likes
						
						result = JSON.parse(result)
						_self.arts.forEach((item,i)=>{
							if(result[item.art_id]!=null){
								//item.like=true;
								//强行监听
								this.$set(item, 'like', result[item.art_id])
							}
						})
						//这段时间内页面可能会闪烁，所以要适当长一些
						setTimeout(function(){
							_self.loaded = true;
							console.log(_self.arts);
						},500)
						console.log('xx')
					}
				})
			},
			footerClick:function(types,artId,index) {
				switch(types){
					case '删除':
						uni.showModal({
						    title:"提示",
						    content:"确定要删除吗?",
						    success:function(e){
								if(e.confirm == true){
									uni.request({
										url: _self.apiServer + 'my&m=removeArt',
						                method: 'POST',
						                header: {'content-type' : "application/x-www-form-urlencoded"},
										data: {
						                    uid : loginRes[0],
						                    random : loginRes[1],
						                    artId : artId
						                },
										success:function(res){
											if(res.data.status == 'ok'){
						                        uni.showToast({title: "已删除", icon:"none"});
												_self.reset();
						                    }else{
												console.log(res)
						                        uni.showToast({title: "删除失败"+res, icon:"none"});
						                    }
										} 
									});
								}
							},
						});
						break;
					case '喜欢':
						uni.request({
							url: _self.apiServer + 'like&m=addArtLike',
							method: 'POST',
							header: {'content-type' : "application/x-www-form-urlencoded"},
							data: {
								uid : loginRes[0],
								random : loginRes[1],
								artId : artId
							},
							success:function(res){
								_self.getLike();
								_self.$set(_self.arts[index], 'art_likes', parseInt(_self.arts[index].art_likes) + res.data.data);
								console.log(res);
							}
						});
						break;
					case '评论':
						_self.toggleMask('show',artId,index);
						_self.comArtTitel = _self.arts[index].art_title;
						break;
				}
			},
			getArtList :function(){
				console.log('getArtList')
				if(this.status != 'more'){return ;}
				this.status = 'loading';
				uni.request({
					url: this.apiServer
					+ 'art&m=getList&page=' + _self.page
					+ '&type=' + _self.sortBy
					+ '&searching=' + _self.searching 
					+ '&search=' + _self.realSearchVal 
					+ '&onlyfollow=' + _self.SegInd
					+ '&exUid=' + loginRes[0],
					method: 'GET',
					success: res => {
						if(res.data.status == 'ok'){
							_self.page++;
							res.data.data.forEach(function(item,i){
								let pictures = JSON.parse(item.art_picture);
								pictures?_self.picture.push([pictures[0]]):_self.picture.push([]);
								let moods = JSON.parse(item.art_mood);
								moods?_self.mood.push(moods):_self.mood.push([]);
								if(uni.getStorageSync('SUID') == item.art_uid)
									item.deleteFlag = true;
								//item.deleteFlag = uni.getStorageSync('SUID') == item.art_uid;
								_self.showDelete[i] = uni.getStorageSync('SUID') == item.art_uid;
							})
							console.log(_self.showDelete);
							if(res.data.data.length<10)
								_self.status = 'noMore';
							else
								_self.status = 'more';
							_self.arts = _self.arts.concat(res.data.data);
							
							_self.getLike();
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
		onLoad:function(option){
			_self = this;
			loginRes=this.checkLogin('../tabBar/browse/browse',2);
			if(!loginRes)	return false;
			this.reset();
		},
		onShow:function(){
			if(uni.getStorageSync('needFresh')){
				this.reset();
				_self.searching = false;
				uni.removeStorageSync('needFresh');
			}
		},
		onPullDownRefresh: function() {
			//下拉刷新的时候请求一次数据
			this.reset();
			_self.searching = false;
			console.log('下拉');
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},600)
		},
		onReachBottom: function() {
			//触底的时候请求数据，即为上拉加载更多
			//为了更加清楚的看到效果，添加了定时器
			console.log('上拉')
			_self.getArtList();
		}
	}
</script>

<style lang="scss">
	.search{
	}
	.mask{  
		position: fixed;  
		top: 0;  
		left: 0;  
		width: 100%;  
		height: 100%;  
		background-color: #efeff4;  
		z-index: 9999;  
	}  
	.myart-list{
		padding: 15px;
		opacity:0;
		transition: all 0.1s linear;
	}
	.myart-list-active{
		padding: 15px;
		opacity:1;
		transition: all 0.3s ease-in;
	}
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #efeff4;
		min-height: 100%;
		height: auto;
	}
	.footer-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		justify-content: space-between;
		flex-direction: row;
	
	}
	.footer-box__item {
		align-items: center;
		padding: 10rpx 0;
		font-size: 30rpx;
		color: #666;
	}
	.content-box-text {
		display: flex;
	}
	.content-box-author {
		display: flex;
		justify-content: flex-end;
	}
	.myface{
		width:120rpx; 
		height:120rpx; 
		margin:-330rpx 20rpx 210rpx 10rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}
	.myface image{
		width:93%; 
		border: white solid 3rpx;
		border-radius:50%;
	}
	.byFace{
		font-size: 40rpx;
		position: absolute;
		margin: 40rpx 0 0 40rpx;
		z-index: 2;
	}
	.moods{
		flex-wrap: wrap;
	}
	.tag-view {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		margin: 5rpx 15rpx 10rpx 0rpx;
		justify-content: center;
	}
</style>
