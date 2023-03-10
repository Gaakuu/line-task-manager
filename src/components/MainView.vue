<template>
	<div v-show="loaded">
		<div v-if="noGroup">
			<div class="text-center text-large font-weight-bold mt-8">
					まだグループが登録されていません。<br>
					<v-btn :to="{ name: 'addGroup' }">こちら</v-btn>
					から最初のグループを登録するか、招待を受けるとグループが表示されます。<br>
					グループとは複数のタスクをまとめて管理するもので、ほかの人をグループに招待したりしてタスクを共有することができます。
			</div>
		</div>
		<div v-else>
			<v-card
				v-for="g in $store.getters.myGroups"
				:key="g.title"
				:to="{ name: 'groupView', params: { gid: g.id } }"
				class="my-3 pb-2"
				variant="tonal"
				:color="g.color"
			>
				<v-card-title>{{ g.title }}</v-card-title>
				<v-card-subtitle>
					<span v-for="m in g.member" :key="m">{{ $store.getters.nameList[m] }},</span>
				</v-card-subtitle>
				<v-card-subtitle v-if="g.tasks">タスク数：{{ g.tasks.length }}</v-card-subtitle>
			</v-card>
		</div>

		<v-btn
			class="fab-icon"
			icon
			size="large"
			:to="{ name: 'addGroup' }"
		>
			<v-icon>
				mdi-plus-thick
			</v-icon>
		</v-btn>
	</div>
</template>

<script>
import { onMounted, onUnmounted, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import moment from "moment";

//import liff from "@line/liff";

export default {
	name: "MainView",

	components: {},
	setup() {
		const loaded = ref(false);
		const noGroup = ref(true);

		const store = useStore();

		store.dispatch("setPageNum", 0)


		const load = async() => {
			if(store.getters.userInfo.groups.length>0){
				noGroup.value = false;
				await store.dispatch("getGroups");
				let ids = [];
				store.getters.myGroups.forEach(g => {
					ids = ids.concat(g.member)
				})
				await store.dispatch("getUserInfo", store.getters.userID);
				await store.dispatch("getUserNames", ids);
			}
			await store.dispatch("setAppbarTitle", store.getters.userInfo.name);
			loaded.value = true;
		}

		load();

		function formatDate(value){
			return moment(value).format("lll")
		}
		onMounted(() => {
			console.log("MainView.vue mounted")
		});
		onUnmounted(()=>{
			store.dispatch("setAppbarTitle", "")
		})
		return {
			noGroup,
			loaded,
			formatDate
		};
	},
};
</script>
