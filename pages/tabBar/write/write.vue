<template>
	<view>
		<view class="uni-padding-wrap uni-common-mt">
			<form @submit="formSubmit" >
				<view class="uni-form-item uni-column">
					<input v-model="title" class="uni-input-lg" name="title" placeholder="请输入标题" />
				</view>
				<view class="uni-form-item moods">
					<view class="tag-view" v-for="(item,i) in mood" >
						<uni-tag @tap="removeTag(i)" :circle="true" :text="item.content" :type="item.type" size="small" />
					</view>
					<view class="tag-view" @tap="addMood">
						<uni-tag :circle="true" :text="addMoodIcon"  size="small" />
					</view>
					<view class="addMood" v-if="addMoodFlag">
						<input v-model="moodContent" class="uni-input" name="mood" placeholder="请输入标签" />
						<text class="uni-icon" :class="'uni-icon-checkmarkempty'" @click="createMood"></text>
					</view>
				</view>
				<view class="uni-form-item images">
					<block v-for="(item, index) in picture" :key="index">
						<view style="padding:12rpx;" v-if="item.type == 'image'"><image class="uni-uploader__img" :src="item.content" :data-index="index" mode="aspectFill" @tap="removeImg(index)" /></view>
					</block>
					<view class="uni-uploader__img addImg" v-if="addImgFlag" @tap="addImg">+</view>					
				</view>
				<view class="uni-form-item uni-column">
					<view>
						<textarea class="addText" name="artText" maxlength="-1" v-model="inputContent" placeholder="这一刻的想法..." />
					</view>
				</view>
				<!-- <view class="art-cate">
					<view>文章分类</view>
					<view class="">
						<picker mode="selector" :value="index" :range="caties" @change="cateChange">
							<view class="tag-view">
								
								<uni-tag :circle="true" :text="caties[currentCateIndex]" type="primary" size="small" />
							</view>
						</picker>
					</view>
				</view> -->
				<view class="uni-list">
					<view class="uni-list-cell">
						<view class="uni-list-cell-left">
							选择今日心情
						</view>
						<view class="uni-list-cell-right">
							<picker @change="cateChange" :range="caties" >
								<view class="uni-input">{{caties[currentCateIndex]}}</view>
							</picker>
						</view>
					</view>
				</view>
				<view class="uni-btn-v">
					<button form-type="submit">发表</button>
				</view>
			</form>
		</view>
	</view>
</template>

<script scoped>
	var _self,
		loginRes;
	import uniTag from '@/components/uni-tag/uni-tag.vue';
	var signModel = require('../../../common/sign.js');
	export default {
		components: {
			uniTag,
		},
		data() {
			return {
				title:'',
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
				addMoodIcon:'点击此处添加标签+',
				moodContent:'',
				mood:[],
				picture:[],
				inputContent:'',
				uploadIndex:0,
				addImgFlag: true,
				addMoodFlag: false,
				types:[
					'primary',
					'warning',
					'success',
					'error'
				],
				typeIndex:0,
				currentCateIndex : 0
			}
		},
		methods: {
			cateChange: function(){
				this.currentCateIndex = e.detail.value
			},
			createMood: function(){
				let type = _self.types[(_self.typeIndex++)%_self.types.length];
				_self.mood.push({content:_self.moodContent,type:type});
				_self.moodContent = '';
				_self.addMood();
			},
			formSubmit: function(res){
				if(!_self.title)
					uni.showToast({title:"请输入标题", icon:"none"});
				else if(!_self.inputContent)
					uni.showToast({title:"请输入内容", icon:"none"});
				else if(!_self.picture)
					uni.showToast({title:"请添加图片", icon:"none"});
				else{
					_self.uploadImg();
				}
				console.log(res);
			},
			cateChange : function(e){
				var sedIndex          = e.detail.value;
				this.currentCateIndex = sedIndex;
				// 获取选择的分类名称
				var cateName = this.caties[sedIndex];
				console.log(cateName);
			},
			uploadImg : function(){
				// 如果没有图片 或者已经上传完成 则执行提交
				if(this.picture.length < 1 || this.uploadIndex >=  this.picture.length){
					//已经上传九张图之后禁止上传
					if(_self.uploadIndex >= 8){
						_self.addImgFlag = false;
					}
					uni.hideLoading();
					uni.showLoading({title:"正在提交"});
					var sign = uni.getStorageSync('sign');
					uni.request({
						url: this.apiServer + 'art&m=add',
						method: 'POST',
						header: {'content-type' : "application/x-www-form-urlencoded"},
						data:{
							title   : _self.title,
							mood    : JSON.stringify(_self.mood),
							picture : JSON.stringify(_self.picture),
							content : _self.inputContent,
							uid     : loginRes[0],
							random  : loginRes[1],
							cate    : _self.currentCateIndex,
							sign    : sign
						},
						success:function(res){
							if(res.data.status == 'ok'){
								console.log(res)
								//console.log(res.data);
								uni.hideLoading();
								uni.showToast({title:"提交成功", icon:"none"});
								// 清空数据
								_self.title = '';
								_self.mood = [];
								_self.picture = [];
								_self.inputContent = '';
								_self.currentCateIndex = 0;
								
								signModel.sign(_self.apiServer);
								//通知其他页面需要刷新
								uni.setStorageSync('needFresh','true');
								//跳转到广场页面
								setTimeout(function(){
									uni.switchTab({
										url:'../browse/browse'
									})
								}, 500);
							}else{
								//uni.showToast({title:res.data.data, icon:"none"});
								console.log(res);
							}
						},
						fail: (e) => {
							console.log(e);
						}
					});
				}else{
					// 上传图片
					uni.showLoading({title:"上传图片"});
					//uniapp自带上传文件接口
					var uploader = uni.uploadFile({
						url      : _self.apiServer + 'uploadimg',
						filePath : _self.picture[_self.uploadIndex].content,
						name     : 'file',
						success: (uploadFileRes) => { 
							console.log(uploadFileRes);
							let Res = JSON.parse(uploadFileRes.data);
							console.log(Res);
							if(Res.status != 'ok'){
								uni.showToast({title:"上传图片失败,请重试!", icon:"none"});
								return false;
							}
							// 将已经上传的文件地址赋值给文章数据
							//var index = _self.needUploadImg[_self.uploadIndex].indexID;
							_self.picture[_self.uploadIndex].content = _self.staticServer + Res.data;
							_self.uploadIndex ++;
							// 递归上传
							_self.uploadImg();
						},
						fail: (e) => {
							console.log(e);
							uni.showToast({title:"上传图片失败,请重试!", icon:"none"});
						}
					})
				}
			},
			addMood: function(){
				_self.addMoodFlag = !_self.addMoodFlag;
				if(_self.addMoodIcon != "×"){
					_self.addMoodIcon = '×';
				}else{
					_self.addMoodIcon = '+';
				}
			},
			addImg: function(){
				uni.chooseImage({
					count: 9,
					sizeType: ['compressed'],
					success: function(res) {
						res.tempFilePaths.forEach(function(item,i){
							if(_self.picture.length >= 9){
								uni.showToast({title:"添加图片过多", icon:"none"});
								_self.addImgFlag = false;
								return;
							}
							_self.picture.push({"type":"image", "content": res.tempFilePaths[i]});
							if(_self.picture.length >= 9){
								_self.addImgFlag = false;
							}
						})		
						console.log(_self.picture);
					}
				})
			},
			removeTag:function(index){
				_self.mood.splice(index,1);
			},
			removeImg: function(index){
				uni.showModal({
					content:"确定要删除此图片吗",
					title:'提示',
					success(e) {
						if (e.confirm) {
							_self.picture.splice(index,1);
						}
					}
				})
			}
		},
		onLoad:function(option){
			_self = this;
			loginRes = this.checkLogin('../write/write', 2);
			
			if(!loginRes) {return false;}
			else console.log(loginRes);
			// 签名，用于提交，因为提交图片比较占用服务器资源，所以需要签名
			// 不可避免的是，随着时间签名数据库会变大，需要定时清理
			signModel.sign(_self.apiServer);
			
			//var sign = uni.getStorageSync('sign');
			
		}
	}
</script>

<style>
	.uni-form-item .title {
		padding: 20rpx 0;
	}
	.tag-view {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		margin: 10rpx 15rpx;
		justify-content: center;
	}
	.example-body {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: flex-start;
		flex-wrap: wrap;
		padding: 20rpx;
	}
	.addImg{
		margin: 12rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #e9e9e9;
		font-size: 80rpx;
		color: #969696;
	}
	.images{
		flex-wrap: wrap;
	}
	.moods{
		flex-wrap: wrap;
	}
	.addMood{
		display: flex;
		width: 100%;
		justify-content:space-between;
		align-items: center;
	}
	.addText{
		margin: auto;
		height: 650rpx;
		width: 650rpx;
		border: 1rpx solid #cbcbcb;
		padding: 10rpx;
	}
	.uni-list{
		margin: 20rpx 0;
	}
	.uni-list-cell-right{
		display: flex;
		justify-content: center;
	}
</style>
