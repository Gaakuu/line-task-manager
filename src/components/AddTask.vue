<template>
	<v-container>
		<v-row>
			<v-col class="text-large text-center">タスクを追加</v-col>
		</v-row>
		<v-row>
			<v-col>
				<v-card variant="tonal" color="black">
					<v-container>
						<v-row>
							<v-col>必須項目</v-col>
						</v-row>
						<v-row>
							<v-col>
								<v-text-field
									v-model="data.title"
									label="タスク名"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<v-select
									v-model="data.priority"
									label="優先度"
									:items="control.priorityItems"
									return-object
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
							<v-col><v-textarea label="タスクの説明" v-model="data.desc"></v-textarea></v-col>
						</v-row>
						<v-row>
							<v-col align-self="center" >推定所要時間</v-col>
							<v-col>
								<v-text-field type="number" hide-details v-model="data.need_time"></v-text-field>時間
							</v-col>
						</v-row>
						<v-row>
							<v-col class="text-right">
								<v-btn @click="addTask" :disabled="!data.title.length||data.priority==null">追加</v-btn>
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
import { useRoute, useRouter  } from 'vue-router'
import moment from "moment";

export default {
	name: "AddTask",
	setup() {
		const router = useRouter();
		const route = useRoute();
		const store = useStore();

		store.dispatch("setPageNum", 4)

		const path = route.params.gid;
		console.log(path)
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
			date:today(),
			time:"00:00"
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

		const data = reactive({
			title:"",
			priority:null,
			limit:null,
			color:'#FFFFFF',
			comments:[],
			status:0,
			progress:0,
			desc:"",
			need_time:null,
		});
		const datepicker = ref();

		onMounted(() => {
		});

		function addTask(){
			data.priority = data.priority.value;
			data.limit = unitDate();
			console.log(data.limit)
			store.dispatch("addTask", {task:data, GroupID:path}).then(()=>{
				store.dispatch("showSnackbar", "タスクを追加しました")
				router.push({ name: 'groupView', params: { gid: path } })
			})
		}

		return {
			data,
			date,
			control,
			datepicker,
			today,
			addTask
		};
	},
};
</script>