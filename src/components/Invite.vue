<template>
	<v-container>
		<v-row>
			<v-col class="text-large text-center">招待する</v-col>
		</v-row>
		<div v-if="$store.getters.groupInfo.inviteCode==null">
			<v-row>
				<v-col class="text-center">
					<v-btn @click="publishInviteCode">招待リンクを発行</v-btn>
				</v-col>
			</v-row>
		</div>
		<div style="overflow: visible;" v-else>
			<v-row>
				<v-col>
					<v-btn @click="copyLink">リンクをコピー<v-icon>mdi-content-copy</v-icon></v-btn>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-btn @click="publishInviteCode">招待リンクを再発行</v-btn>
				</v-col>
			</v-row>
			<p>
				（既存のリンクは使えなくなります）
			</p>
		</div>
	</v-container>
</template>

<script>
import { reactive } from '@vue/runtime-core';
import { onMounted } from "@vue/runtime-core";
import { useStore } from "vuex";
import { useRoute } from 'vue-router'

export default {
	name: "InviteView",
	setup() {

		const route = useRoute();
		const store = useStore();
		const path = route.params.gid;
		
		const data = reactive({
			loaded:false,
			inviteCode:null,
			baseURL:`https://line-task-manager-76828.web.app/${path}/invited/`
		})

		const load = async()=>{
			store.dispatch("setPageNum", 10);
			if(store.getters.dataLoadedStatus.groupInfo==false){
				await store.dispatch("getGroupInfo", path);
				await store.dispatch("setAppbarTitle", store.getters.groupInfo.title);
				data.inviteCode = store.getters.groupInfo.inviteCode;
			}
			data.loaded = true;
		}

		load();

		const publishInviteCode = async() => {
			await store.dispatch("registerInviteCode", path);
			await store.dispatch("getGroupInfo", path);
			data.inviteCode = store.getters.groupInfo.inviteCode;
			store.dispatch("showSnackbar", "リンクを発行しました")
		}

		const copyLink = () => {
			navigator.clipboard.writeText(data.baseURL+store.getters.groupInfo.inviteCode).then(
			() => {
				// コピーに成功したときの処理
				store.dispatch("showSnackbar", "コピーしました")
			})
		}

		onMounted(() => {
		});


		return {
			data,
			publishInviteCode,
			copyLink
		};
	},
};
</script>