<template>
	<view>
		<uni-section title="我的关注列表" type="line"></uni-section>
		<uni-list class="lists">
			<view v-for="(item,i) in author" :key="i">
				<uni-list-item :title="item.u_name" :thumb="item.u_face" @click="goUserInfo(item.u_id)"/>
			</view>
		</uni-list>
	</view>
</template>

<script>
	var _self,
		loginRes;
	import uniSection from '@/components/uni-section/uni-section.vue'
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	export default {
		data() {
			return {
				author: []
			}
		},
		components: {
			uniSection,
			uniList,
			uniListItem
		},
		methods: {
			goUserInfo: function(uid){
				uni.navigateTo({
					url:'../../userInfo/userInfo?uid='+uid,
					animationType: 'pop-in',
					animationDuration: 200
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
						result = JSON.parse(result.data.data.ul_likes)
						console.log(result);
						let arr = [];
						/* result.forEach(function(item,i){
							if(item){
								arr.push(i);
							}
						}) */
						for(let key in result){
							if(result[key]){
								arr.push(key);
							}
						}
						arr.forEach(function(item,i){
							uni.request({
								url: _self.apiServer + 'member&m=info&uid='+item,
								method: 'GET',
								success: result =>{
									_self.author.push(JSON.parse(JSON.stringify(result.data.data)));
								}
							})
						})
					}
				})
			},
		},
		onLoad: function(){
			_self = this;
			loginRes=this.checkLogin('../my/follow',1);
			if(!loginRes)	return false;
			this.getFollow();
		}
	}
</script>

<style>

</style>
