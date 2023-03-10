<template>
	<v-container v-if="loaded">
		<v-row>
			<v-col class="text-xlarge font-weight-bold text-center" align-self="center">{{$store.getters.taskInfo.title}}</v-col>
			<v-col cols="2" class="text-center text-small text-right pa-0" align-self="center">
				優先度
			</v-col>
			<v-col cols="3">
				<v-select
					class="prSelect w-75"
					v-model="priority"
					:class="data.priorityClass[priority]"
					:items="data.priorityItems"
					return-object
					variant="plain"
					>
				</v-select>
			</v-col>
		</v-row>
		<v-row>
			<v-col v-if="$store.getters.taskInfo.limit">
				期限：{{formatDate($store.getters.taskInfo.limit)}}まで : {{ compareDate($store.getters.taskInfo.limit) }}
			</v-col>
		</v-row>
		<v-row>
			<v-col style="white-space: pre-wrap;">{{$store.getters.taskInfo.desc}}</v-col>
		</v-row>
		<v-row v-if="$store.getters.taskInfo.need_time">
			<v-col>推定所要時間：{{$store.getters.taskInfo.need_time}}時間</v-col>
		</v-row>
		<v-row class="align-center" style="height:102px">
			<v-col cols="5">
				<v-select
					v-model="status"
					:items="data.statusItems"
					return-object
					variant="outlined"
					density="compact"
				></v-select>
			</v-col>
			<v-col cols="7" v-if="status==1">
				<p>進捗</p>
				<v-slider
					:onpointerup="updateProgress"
					v-model="progress"
					label="Inverse label"
					tick-size="3"
					step="10"
					thumb-label
				></v-slider>
			</v-col>
		</v-row>
		<v-row>
			<v-col><v-divider class="mt-3"></v-divider></v-col>
			<v-col cols="3"><p class="text-center text-small">コメント</p></v-col>
			<v-col><v-divider class="mt-3"></v-divider></v-col>
		</v-row>
		<v-row>
			<v-col cols="11" class="pr-0">
				<v-textarea
					class="comment-input"
					rows="1"
					auto-grow
					density="compact"
					variant="outlined"
					placeholder="コメントを追加"
					v-model="data.commentInput"
				></v-textarea>
			</v-col>
			<v-col cols="1" class="mt-1">
				<v-icon :disabled="data.commentInput==''" @click="postComment()">mdi-send</v-icon>
			</v-col>
		</v-row>
		<v-row>
			<v-col>
			<v-card 
			v-for="c in $store.getters.taskInfo.comments"
			:key="c"
			variant="outlined"
			style="border-color: rgba(0,0,0,0.1);"
			>
			<v-card-text>
				<v-row>
					<v-col>
							<span class="text-small">{{ $store.getters.nameList[c.id] }}</span>&nbsp;
							<span class="text-xxsmall font-weight-thin">{{ formatDate(c) }}</span>	
					</v-col>
				</v-row>
				<v-row>
					<v-col style="white-space: pre-wrap;">{{c.content}}</v-col>
				</v-row>
			</v-card-text>
			<v-divider></v-divider>
			</v-card>
		</v-col>
		</v-row>
		<v-row>
			<v-col><v-divider class="mt-3"></v-divider></v-col>
			<v-col cols="3"><p class="text-center text-small">ログ</p></v-col>
			<v-col><v-divider class="mt-3"></v-divider></v-col>
		</v-row>
		<v-row class="mt-4">
			<v-expansion-panels variant="accordion" class="elevation-0">
			<v-expansion-panel class="taskLog">
				<v-expansion-panel-title>
					ログ
				</v-expansion-panel-title>
				<v-expansion-panel-text>
					<v-row v-for="l in $store.getters.taskInfo.log" :key="l">
					<v-col>
						<span class="text-small">{{ formatDate(l) }} {{ $store.getters.nameList[l.user] }}</span>
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import { useRoute, useRouter } from 'vue-router';
import moment from "moment";

moment.locale("ja")

export default {
	name: "TaskView",

	components: {},
	setup() {
		const loaded = ref(false);
		const store = useStore();
		const route = useRoute();
		const router = useRouter();

		store.dispatch("setPageNum", 2);

		const data = reactive({
			priorityItems:[
				{title:"低", value:0},
				{title:"中", value:1},
				{title:"高", value:2}
			],
			priorityClass:["text-green","text-amber", "text-red"],
			statusItems:[
				{title:"未着手", value:0},
				{title:"取組中", value:1},
				{title:"完了", value:2}
			],
			progress:0,
			commentInput:"",
			comments:[],
		});

		const progress = ref();
		const tid = route.params.tid;
		const gid = route.params.gid;

		store.dispatch("getTaskInfo", tid).then(()=>{
			loaded.value = true;
		})

		const load = async()=>{
			if(store.getters.dataLoadedStatus.groupInfo==false){
				await store.dispatch("getGroupInfo", gid)
			}
			if(store.getters.dataLoadedStatus.names==false){
				await store.dispatch("getUserNames", store.getters.groupInfo.member);
			}
			if(store.getters.groupInfo.member.includes(store.getters.userID)){
				await store.dispatch("getTaskInfo", tid);
				progress.value = store.getters.taskInfo.progress;
				await store.dispatch("setAppbarTitle", store.getters.groupInfo.title);
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

		})


		function formatDate(value){
			if(value.allDay){
				return moment(value.time.toDate()).format("M/D(ddd)")
			}
			else if(value.allDay==false){
				return moment(value.time.toDate()).format("M/D(ddd) H:mm")
			}
			else{
				return moment(value.time.toDate()).format("YYYY/M/D(ddd) H:mm")
			}
		}

		// const progress0 = computed({
		// 	get(){
		// 		return store.getters.taskInfo.progress
		// 	},
		// 	set(value){
		// 		store.dispatch("updateTask", {id:tid, data:{progress: value}}).then(()=>{
		// 			// store.dispatch("writeTaskLog",{
		// 			// 	tid:tid,
		// 			// 	content:{
		// 			// 		action:"updateProgress",
		// 			// 		detail:value
		// 			// 	}
		// 			// })
		// 		})
		// 	}
		// })

		const priority = computed({
			get(){
				return store.getters.taskInfo.priority
			},
			set(value){
				console.log(value)
				store.dispatch("updateTask", {id:tid, data:{priority: value.value}}).then(()=>{
					store.dispatch("writeTaskLog",{
						tid:tid,
						content:{
							action:"updatePriority",
							detail:value.value
						}
					})
				})
			}
		})

		const status = computed({
			get(){
				return store.getters.taskInfo.status
			},
			set(value){
				store.dispatch("updateTask", {id:tid, data:{status: value.value}}).then(()=>{
					if(value.value == 0){
						store.dispatch("updateTask", {id:tid, data:{progress: 0}})
					}
					else if(value.value == 2){
						store.dispatch("updateTask", {id:tid, data:{progress: 100}})
					}
					store.dispatch("writeTaskLog",{
						tid:tid,
						content:{
							action:"updateStatus",
							detail:value.value
						}
					})
				})
			}
		})

		const postComment = ()=>{
			const checkCtt = data.commentInput.replace(/\r?\n/g, '')
			if(checkCtt!=""){
				console.log("working")
				store.dispatch("postComment", {id:tid, comment:data.commentInput})
				data.commentInput = "";
			}
		}

		const documentingLog = (l)=>{
			switch(l.action){
				case "updateProgress":
					return "進捗を更新："+l.detail
				case "updatePriority":
					return "優先度を更新："+data.priorityItems[l.detail].title;
				case "updateStatus":
					return "状態を更新："+data.statusItems[l.detail].title;
			}
		}

		const updateProgress = () => {
			// if(e.cancelable){
			// 	e.preventDefault();
			// }
			if(store.getters.taskInfo.progress!=progress.value){
				store.dispatch("updateTask", {id:tid, data:{progress: progress.value}}).then(()=>{
					store.dispatch("writeTaskLog",{
						tid:tid,
						content:{
							action:"updateProgress",
							detail:progress.value
						}
					});
				})
			}
		}

		const compareDate = (t) => {
			const limit = moment(t.time.toDate())
			const today = moment()
			if(t.allDay){
				if(limit.isSame(today, 'days')){
					return "本日が期限です！"
				}
				else{
					const diff = limit.diff(today, 'days');
					if(diff < 0){
						return `期限を${Math.abs(diff)}日過ぎています！`
					}
					else{
						return `残り${diff+1}日`
					}
				}
			}
			else{
				if(limit.isSame(today, 'days')){
					const diff = limit.diff(today, 'hour');
					console.log(diff)
					if(diff==0){
						return "期限の時間です"
					}
					if(diff < 0){
						return `期限を${Math.abs(diff)}時間過ぎています！`
					}
					if(diff > 0){
						console.log(diff)
						return `残り${diff+1}時間`
					}
				}
				else{
					const diff = limit.diff(today, 'days');
					console.log(diff)
					if(diff <= 0){
						return `期限を${Math.abs(diff-1)}日過ぎています！`
					}
					else{
						return `残り${Math.abs(diff)}日`
					}
				}
			}

		}

		return {
			data,
			formatDate,
			postComment,
			loaded,
			progress,
			priority,
			status,
			documentingLog,
			updateProgress,
			compareDate
		};
	},
};
</script>
