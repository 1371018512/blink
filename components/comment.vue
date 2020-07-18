<template lang="pug">
  view.out-view(v-show='show' @tap.stop='onClickModule')
    view.comment-view( @tap.stop='' :style="{bottom:bottomHeight+'px'}")
      view.top
        text.title {{title}}
        image.close(:src='closeIco' @tap.stop='onClickModule')
      view.center
        textarea(
        @input='onInput'
        :show-confirm-bar='false'
        :focus='inputFocus'
        @focus='onFocus'
        @blur='onBlur'
        :maxlength='maxlength' 
        :adjust-position='false'
        :disable-default-padding='true'
        :placeholder='commentDesc' 
        :placeholder-class='placeholderStyle')
      view.bottom
        view.menu
          view.item(v-if="menu&&menu.length>0" v-for="(item,index) in menu" :key="index")
            image(:src='item.ico')
            text {{item.title}}
        button(@tap.stop='onConfirm(commentValue)') {{desc}}
</template>
<script>
    export default {
        props: {
            //按钮描述
            desc: {
                type: String,
                default: '发表'
            },
            //标题
            title: {
                type: String,
                default: '发表评论'
            },
            //限制最大字符
            maxlength: {
                type: Number,
                default: -1
            },
            //关闭图标
            closeIco: {
                type: String,
                default: '/static/assets/ico/bbs/icon_arrow.png'
            },
            //输入框提示语
            commentDesc: {
                type: String,
                default: '想说点什么……'
            },
            status: {
                type: Boolean,
                default: false
            },
            //扩展菜单
            menu: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                commentValue: null,
                show: this.status,
                maxHeight: 0,
                bottomHeight: 0,
                inputFocus: false
            }
        },
        watch: {
            status(nVal, oVal) {
                //IOS聚焦问题
                let that = this;
                setTimeout(() => {
                    that.inputFocus = nVal;
                }, 100)
                this.show = nVal
            },
            //更新状态
            show(nVal, oVal) {
                this.$emit('onUpdate', nVal)
            },
        },
        methods: {
            //获取输入框把内容
            onInput(e) {
                this.commentValue = e.detail.value;
            },
            //输入框聚焦
            onFocus(e) {
                this.bottomHeight = e.detail.height;
            },
            //输入框失聚焦
            onBlur(e) {
                this.bottomHeight = 0;
            },
            //确认
            onConfirm(value) {
                this.onClickModule();
                this.$emit('onConfirm', value);
            },
            //组件点击事件，用来关闭组件
            onClickModule() {
                this.show = !this.show;
                this.bottomHeight = 0;
            },
        },
    }
</script>
<style lang="scss" scoped>
    .out-view {
        width: auto;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 99;
        background: rgba(0, 0, 0, .4);
        transition: all .2s linear;
        .comment-view {
            height: 400rpx;
            max-height: 400rpx;
            background: white;
            flex-direction: column;
            display: flex;
            position: fixed;
            background: white;
            padding: 32rpx;
            left: 0;
            right: 0;
            bottom: 0;
            .top {
                flex-direction: row;
                align-items: center;
                display: flex;
                .title {
                    margin-right: 30rpx;
                    flex: 1;
                    font-size: 28rpx;
                    font-family: PingFang-SC-Bold, PingFang-SC;
                    font-weight: bold;
                    color: rgba(51, 51, 51, 1);
                }
                .close {
                    width: 24rpx;
                    height: 24rpx;
                }
            }
            .center {
                margin: 40rpx 0;
                flex-direction: column;
                textarea {
                    height: 180rpx;
                    max-height: 180rpx;
                    padding: 20rpx;
                    width: auto;
                    background: rgba(251, 250, 250, 1);
                    border-radius: 6px;
                    font-size: 28rpx;
                    font-family: PingFangSC-Regular, PingFang SC;
                    font-weight: 400;
                    color: rgba(51, 51, 51, 1);
                }
                .placeholderStyle {
                    font-size: 28rpx;
                    font-family: PingFangSC-Regular, PingFang SC;
                    font-weight: 400;
                    color: rgba(216, 216, 216, 1);
                }
            }
            .bottom {
                flex-direction: row;
                align-items: center;
                display: flex;
                button {
                    align-self: flex-end;
                    font-size: 24rpx;
                    font-family: PingFangSC-Regular, PingFang SC;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 1);
                    width: 140rpx;
                    height: 68rpx;
                    background: linear-gradient(133deg, rgba(255, 170, 0, 1) 0%, rgba(241, 0, 21, 1) 100%);
                    border-radius: 17px;
                }
                button::after {
                    border: 0;
                }
                .menu {
                    flex: 1;
                    flex-direction: row;
                    align-items: center;
                    display: flex;
                    .item {
                        margin-right: 10rpx;
                        flex-direction: column;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        image {
                            width: 40rpx;
                            height: 40rpx;
                        }
                        text {
                            margin: 10rpx 0 0;
                            font-size: 22rpx;
                            color: rgba(51, 51, 51, 1);
                        }
                    }
                }
            }
        }
    }
</style>
