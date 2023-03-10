<template>
	<v-container v-if="loaded">
		<v-row>
			<v-col class="text-xlarge text-center">{{ $store.getters.groupInfo.title }}</v-col>
		</v-row>
		<v-row>
			<v-col v-for="m in $store.getters.groupInfo.member" :key="m">{{ $store.getters.nameList[m] }}&nbsp;</v-col>
		</v-row>
		<v-row class="mt-4">
			<v-expansion-panels variant="accordion" class="elevation-0">
			<v-expansion-panel>
				<v-expansion-panel-title>
					ログ
				</v-expansion-panel-title>
				<v-expansion-panel-text>
					<v-row v-for="l in $store.getters.groupInfo.log" :key="l">
					<v-col>
						<span class="text-small">{{ formatDate(l.time.toDate()) }} {{ $store.getters.nameList[l.user] }}</span>
						<br><span class="text-small">{{ documentingLog(l) }}</span>
					</v-col>
					<v-divider class="my-3"></v-divider>
					</v-row>
				</v-expansion-panel-text>
			</v-expansion-panel>
		</v-expansion-panels>
		</v-row>
	</v-container>
</template>

<script>
import { ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import { useRoute, useRouter, } from 'vue-router'
import moment from "moment";
moment.locale("ja")

export default {
	name: "DetailView",
	setup() {
		const route = useRoute();
		const router = useRouter();
		const store = useStore();
		const path = route.params.gid;
		const loaded = ref(false);

		store.dispatch("setPageNum", 6)

		const load = async()=>{
			if(store.getters.dataLoadedStatus.groupInfo==false){
				await store.dispatch("getGroupInfo", path)
				if(store.getters.groupInfo.member.includes(store.getters.userID)){
					if(store.getters.dataLoadedStatus.names==false){
						await store.dispatch("getUserNames", store.getters.groupInfo.member)
					}
				}
				else{
					router.push('/oops')
				}
			}
			await store.dispatch("setAppbarTitle", store.getters.groupInfo.title)
			loaded.value = true;
		}

		load();

		const formatDate = (value) => {
			return moment(value).format("lll")
		}

		const documentingLog = (data) => {
			switch (data.action){
				case "addTask":{
					return `タスク：${data.detail}を追加しました。`
				}
				case "deleteTask":{
					return `タスク：${data.detail.title}を削除しました。`
				}	
				case "joinGroup":{
					return "グループに参加しました。"
				}
				case "registerInviteCode":{
					return "招待リンクを発行しました。"
				}
				case "resignGroup":{
					return `${data.detail}がグループを抜けました。`
				}
			}
		}
		
		return {
			loaded,
			formatDate,
			documentingLog
		};
	},
};
</script>