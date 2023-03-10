<template>
	<v-container v-if="loaded">
		<div v-if="validCode">
			<v-row>
				<v-col class="text-large text-center">タスクグループへの招待</v-col>
			</v-row>
			<v-row>
				<v-col>グループ名：{{ $store.getters.groupInfo.title }}</v-col>
			</v-row>
			<v-row>
				<v-col>
					メンバー：
					<span v-for="m in $store.getters.groupInfo.member" :key="m">{{ $store.getters.nameList[m] }},</span>
				</v-col>
			</v-row>
			<v-row>
				<v-col><v-btn @click="recieveInvite">招待を受ける</v-btn></v-col>
			</v-row>
			<v-row>
				<v-col>{{ comment }}</v-col>
			</v-row>
		</div>
		<div v-else>
			<div class="text-center">
				無効なリンクです
			</div>
		</div>
	</v-container>
</template>

<script>
import { ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import { useRoute, } from 'vue-router'

export default {
	name: "InvitedView",
	setup() {
		const route = useRoute();
		const store = useStore();
		const groupID = route.params.gid;
		const code = route.params.code;
		const validCode = ref(false);
		const loaded = ref(false);
		const comment = ref("");

		store.dispatch("getGroupInfo", groupID).then(()=>{
			if(store.getters.groupInfo.inviteCode==code){
				console.log("hi")
				validCode.value = true;
				store.dispatch("getUserNames", store.getters.groupInfo.member).then(()=>{
					loaded.value = true;
				})
			}
			else{
				loaded.value = true;
			}
		})
		store.dispatch("setPageNum", 11);

		const recieveInvite = function(){
			if(store.getters.userInfo.groups.includes(groupID)||store.getters.groupInfo.member.includes(store.getters.userID)){
				comment.value = "既にグループに参加しています"
				return 
			}
			store.dispatch("joinGroup", groupID).then(()=>{
				comment.value = "グループに参加しました"
			})
		}
		return {
			loaded,
			comment,
			recieveInvite,
			validCode
		};
	},
};
</script>