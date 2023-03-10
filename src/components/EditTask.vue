<template>
	<v-container>
		<v-row>
			<v-col class="text-large text-center">タスクを編集</v-col>
		</v-row>
		<v-row v-if="loaded">
			<v-col>
				<v-card variant="tonal" color="black">
					<v-container>
						<v-row>
							<v-col>
								<v-text-field
									v-model="$store.getters.taskInfo.title"
									label="タスク名"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<v-select
									v-model="$store.getters.taskInfo.priority"
									label="優先度"
									:items="control.priorityItems"
								>
								</v-select>
							</v-col>
						</v-row>
						<v-row>
							<v-col>任意項目</v-col>
						</v-row>
						<v-row>
							<v-col align-self="center" class="custom-switch"><v-checkbox label="期限を設定する" v-model="control.showDatePic"></v-checkbox></v-col>
						</v-row>
						<div v-if="control.showDatePic">
							<v-row>
								<v-col align-self="center" cols="3">期限：</v-col>
								<v-col align-self="center" class="custom-switch">
									<v-switch v-model="control.showTime" label="時間指定"></v-switch>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="6">
									<input type="date" v-model="date.date">
								</v-col>
								<v-col v-if="control.showTime" cols="6">
									<input type="time" v-model="date.time">
								</v-col>
							</v-row>
						</div>
						<v-row>
							<v-col><v-textarea label="タスクの説明" v-model="$store.getters.taskInfo.desc"></v-textarea></v-col>
						</v-row>
						<v-row>
							<v-col align-self="center">推定所要時間</v-col>
							<v-col>
								<v-text-field type="number" hide-details v-model="$store.getters.taskInfo.need_time"></v-text-field>時間
							</v-col>
						</v-row>
						<v-row>
							<v-col class="text-right">
								<v-btn @click="editTask">編集</v-btn>
							</v-col>
						</v-row>
					</v-container>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { onMounted, reactive, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import { useRoute, useRouter } from 'vue-router'
import moment from "moment";

export default {
	name: "EditTask",
	setup() {
		const route = useRoute();
		const router = useRouter();
		const store = useStore();

		const loaded = ref(false);
		const tid = route.params.tid;
		const gid = route.params.gid;

		const control = reactive({
			showColPicker:false,
			priorityItems:[
				{title:"低", value:0},
				{title:"中", value:1},
				{title:"高", value:2}
			],
			showDate:"",
			showTime:false,
			showDatePic:false,
		});

		const today = ()=>{
			var today = new Date();
				today.setDate(today.getDate());
				var yyyy = today.getFullYear();
				var mm = ("0"+(today.getMonth()+1)).slice(-2);
				var dd = ("0"+today.getDate()).slice(-2);
				return yyyy+'-'+mm+'-'+dd
		}

		const date = reactive({
			date:null,
			time:null
		})

		const unitDate = ()=>{
			let data = {};
			if(control.showDatePic){
				if(control.showTime){
					data.time = date.date + " " + date.time;
					data.allDay = false;
				}
				else{
					data.time = date.date;
					data.allDay = true;
				}
				return {allDay:data.allDay, time:moment(data.time).toDate()}
			}
			else{
				return null
			}
		}

		const timeSetting = () =>{
			if(store.getters.taskInfo.limit!=null){
					control.showDatePic = true;
					if(store.getters.taskInfo.limit.allDay){
						const time = moment(store.getters.taskInfo.limit.time.toDate());
						date.date = time.format("YYYY-MM-DD").toString();
						date.time="00:00";
					}
					else{
						control.showTime = true;
						const time = moment(store.getters.taskInfo.limit.time.toDate());
						date.date = time.format("YYYY-MM-DD").toString();
						date.time = time.format("HH:mm").toString();
					}
			}
			else{
				date.date = today();
				date.time = "00:00";
			}
			console.log(date)
		}
		

		const load = async() =>{
			store.dispatch("setPageNum", 5);
			if(store.getters.dataLoadedStatus.groupInfo==false){
				await store.dispatch("getGroupInfo", gid)
			}
			if(store.getters.groupInfo.member.includes(store.getters.userID)){
				if(store.getters.dataLoadedStatus.taskInfo==false){
					await store.dispatch("getTaskInfo", tid)
				}
				timeSetting();
				await store.dispatch("setAppbarTitle", store.getters.groupInfo.title);
				loaded.value = true;
			}
			else{
				router.push("/oops")
			}
		}
	
		load();

		const datepicker = ref();

		const editTask = async() =>{
			const data = store.getters.taskInfo;
			//data.priority = data.priority.value
			console.log(data.priority);
			data.limit = unitDate();
			await store.dispatch("updateTask", {data:data, id:tid})
			await store.dispatch("showSnackbar", "更新しました")
		}
		onMounted(() => {
		});


		return {
			date,
			control,
			datepicker,
			today,
			loaded,
			editTask
		};
	},
};
</script>