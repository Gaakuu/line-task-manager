<template>
	<div v-show="loaded">
		<div v-if="noTask">
			<div class="text-center text-large font-weight-bold mt-8">
				まだタスクが登録されていません。<br>
				<v-btn :to="{ name: 'addTask', params: { gid: path } }">こちら</v-btn>
				から最初のタスクを登録してみましょう。
			</div>
		</div>

		<div v-else>
			<v-select
				v-model="data.sortMode"
				prepend-icon="mdi-sort-variant"
				density="compact"
				variant="plain"
				:items="data.sortItems"
				@update:modelValue="sort"
				class="sort"
			></v-select>
			<v-card
				v-for="t in $store.getters.myTasks[0]"
				:key="t.title" 
				:to="{ name: 'taskView', params: { gid:path, tid: t.id } }"
				class="my-3 pb-2"
				variant="tonal"
			>
				<v-card-title>{{ t.title }}</v-card-title>
				<v-card-subtitle v-if="t.limit">~{{ formatDate(t.limit) }}</v-card-subtitle>
				<v-card-subtitle>
					優先度：<span :class="showData.priority[1][t.priority]">{{showData.priority[0][t.priority]}}</span>
					&nbsp;&nbsp;状況：<span>{{ showData.status[t.status] }}</span>
					&nbsp;&nbsp;<span v-if="t.status==1">進捗：{{ t.progress }}</span>
				</v-card-subtitle>
			</v-card>

			<div v-if="data.doneTaskExists">
				<v-divider class="mb-4"></v-divider>
				完了したタスク
				<v-card
					v-for="t in $store.getters.myTasks[1]"
					:key="t.title" 
					:to="{ name: 'taskView', params: { gid:path, tid: t.id } }"
					class="my-3 pb-2"
					variant="tonal"
					color="grey-lighten-1"
				>
					<v-card-title>{{ t.title }}</v-card-title>
					<v-card-subtitle v-if="t.limit">~{{ formatDate(t.limit) }}</v-card-subtitle>
					<v-card-subtitle>
						優先度：<span :class="showData.priority[1][t.priority]">{{showData.priority[0][t.priority]}}</span>
						&nbsp;&nbsp;状況：<span>{{ t.progress }}</span>
					</v-card-subtitle>
				</v-card>

			</div>
		</div>
		<v-btn
			class="fab-icon"
			icon
			size="large"
			:to="{ name: 'addTask', params: { gid: path } }"
		>
			<v-icon>
				mdi-plus-thick
			</v-icon>
		</v-btn>
	</div>
</template>

<script>
import { onMounted, reactive, ref, onBeforeUnmount} from "@vue/runtime-core";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";

moment.locale("ja");

export default {
	name: "GroupView",

	setup() {
		const store = useStore();
		const route = useRoute();
		const router = useRouter();
		const data = reactive({
			sortItems:[ {title:"優先度降順", value:0}, 
						{title:"優先度昇順", value:1},
						{title:"状況", value:2},
						{title:"期限", value:3}
					],
			sortMode:store.getters.sortModeHolder,
			doneTaskExists:false
		});


		const noTask = ref(true);
		const loaded = ref(false);
		const path = route.params.gid;
		const showData = {
			priority:[["低", "中", "高"],["text-green","text-amber", "text-red"]],
			status:["未着手", "取組中", "完了"]
		}

		const load = async()=>{
			store.dispatch("setPageNum", 1);
			await store.dispatch("getGroupInfo", path)
			if(store.getters.dataLoadedStatus.names==false){
				await store.dispatch("getUserNames", store.getters.groupInfo.member);
			}
			if(store.getters.groupInfo.member.includes(store.getters.userID)){
				if(store.getters.groupInfo.tasks.length>0){
					noTask.value = false;
					await store.dispatch("getTasks");
					await store.dispatch("sortTasks", data.sortMode);
					data.doneTaskExists = store.getters.myTasks[1].length > 0; 
				}
				await store.dispatch("setAppbarTitle", store.getters.groupInfo.title)
				loaded.value = true;
			}
			else{
				router.push("/oops")
			}
		}

		load();

		onMounted(() => {
		});

		onBeforeUnmount(()=>{
			store.state.sortModeHolder = data.sortMode;
			store.dispatch("setAppbarTitle", "")
		})

		const formatDate = (value)=>{
			if(value.allDay){
				return moment(value.time.toDate()).format("M/D(ddd)")
			}
			else{
				return moment(value.time.toDate()).format("M/D(ddd) H:mm")
			}
		}

		const sort = (event)=>{
			console.log(event)
			store.dispatch("sortTasks", event);
		}

		return {
			data,
			noTask,
			loaded,
			path,
			formatDate,
			showData,
			sort
		};
	},
};
</script>
