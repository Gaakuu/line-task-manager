<template>
	<v-app>
		<v-app-bar class="px-2" app>
			<v-icon v-if="showArrow" @click="back">mdi-arrow-left</v-icon>
			<v-app-bar-title>{{ $store.getters.appbarTitle }}</v-app-bar-title>
			<v-menu left bottom>
				<template v-slot:activator="{ props }">
					<v-btn icon v-bind="props">
						<v-icon v-if="menuItems.targetPage.includes($store.getters.pageNum)" class=""
							>mdi-dots-vertical</v-icon
						>
					</v-btn>
				</template>

				<v-list>
					<v-list-item v-for="i in menuItems.item[$store.getters.pageNum]" :key="i" @click="i.action">
						<v-list-item-title>{{i.text}}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
		</v-app-bar>
		<v-main>
			<v-container>
			<router-view v-if="$store.getters.mounted" />
			<v-row v-else class="ma-16 justify-center align-center">
				<v-progress-circular
					class="loading-circle"
					:width="3"
					color="green"
					indeterminate
				></v-progress-circular>
			</v-row>
			</v-container>
		</v-main>
		<v-dialog
			v-model="data.dialog"
			class="pa-3"
		>
			<v-card>
				<v-container>
					<v-row>
						<v-col>
							{{ data.dialogText }}
						</v-col>
					</v-row>
					<v-row>
						<v-col><v-btn @click="data.dialog=false">閉じる</v-btn></v-col>
						<v-col class="d-flex justify-end">
							<v-btn @click="dialogEvent" color="red-accent-1">実行</v-btn>
						</v-col>
					</v-row>
				</v-container>
			</v-card>
		</v-dialog>
		<v-snackbar
			v-model="$store.state.snackbar.show"
			:timeout="2000"
			>
			{{ $store.getters.snackbar.text }}
			<template v-slot:actions>
				<v-btn
					color="blue"
					variant="text"
					@click="snackbar = false"
				>
				閉じる
				</v-btn>
			</template>
    </v-snackbar>
	</v-app>
</template>

<script>
import { computed, onMounted, reactive } from "@vue/runtime-core";
import { useStore } from "vuex";
import { useRoute, useRouter } from 'vue-router'

export default {
	name: "App",
	setup() {
		console.log("App.vue created");
		const store = useStore();
		const router = useRouter();
		const route = useRoute();

		const data = reactive({
			dialog:false,
			dialogText:"",
		})

		const taskViewAction = () => {
			const paths = [route.params.gid, route.params.tid];
			router.push({ name: 'editTask', params: { gid: paths[0], tid:paths[1] } })
		}
		const InviteViewAction = () => {
			router.push({name:'invite', params:{gid:route.params.gid}})
		}
		const LogViewAction = () => {
			router.push({name:'groupDetail', params:{gid:route.params.gid}})
		}
		const UserViewAction = () => {
			router.push("/user")
		}

		store.dispatch("LINElogin").then(() => {
			store.dispatch("changeMount", true);
		});

		onMounted(() => {
			console.log("App.vue mounted");
		});

		const back = () => {
			switch(store.getters.pageNum){
				//メイン画面
				case 0:
					break;
				//グループ画面
				case 1:
					store.dispatch("resetGroupInfo")
					router.push("/")
					break;
				//タスク画面
				case 2:{
					const path = route.params.gid
					store.dispatch("resetGroupInfo")
					router.push({name:'groupView', params:{gid:path}})
					break;
				}
				//グループ追加画面
				case 3:{
					router.push("/");
					break;
				}
				//タスク追加画面
				case 4:{
					router.push({name:'groupView', params:{gid:route.params.gid}})
					break;
				}
				//タスク編集画面
				case 5:
					router.push({name:'taskView', params:{gid:route.params.gid, tid:route.params.tid}})
					break;
				//グループ詳細画面
				case 6:
					router.push({name:'groupView', params:{gid:route.params.gid}})
					break;
				//招待リンク発行画面
				case 10:
					router.push({name:'groupView', params:{gid:route.params.gid}});
					break;
				case 11:
					router.push("/");
					break;				
				case 12:
					router.push("/");
					break;
			}
		};

		const openDialog = ()=>{
				data.dialog = true;
				switch(store.getters.pageNum){
					case 1:
						data.dialogText = "グループから抜けます。参加するためには再度招待される必要があります。"
						break;
					case 2:
						data.dialogText = "タスクをグループから削除します。（ログ画面から削除を取り消すことができます）"
						break;
				}
		}

		const dialogEvent = ()=>{
			switch(store.getters.pageNum){
				case 1:{
					const gid = route.params.gid;
					store.dispatch("deleteGroup", gid).then(()=>{
						router.push("/");
						store.dispatch("showSnackbar", "グループから抜けました");
						data.dialog = false;
					});
					break;
				}
				case 2:{
					const tid = route.params.tid;
					const newTaskArray = store.getters.groupInfo.tasks.filter(t => t!==tid)
					store.dispatch("deleteTask", {
						gid:route.params.gid,
						taskArray:newTaskArray,
						taskTitle:store.getters.taskInfo.title,
						tid:tid
					}).then(()=>{
						router.push({name:'groupView', params:{gid:route.params.gid}});
						store.dispatch("showSnackbar", "タスクを削除しました")
						data.dialog = false;
					})
					break;
				}
			}
		}

		const menuItems = reactive({
			targetPage:[0, 1, 2],
			item:[
				[{text:"ユーザー情報", action:UserViewAction}], 
				[{text:"詳細", action:LogViewAction}, {text:"招待", action:InviteViewAction}, {text:"削除", action:openDialog}], 
				[{text:"編集", action:taskViewAction}, {text:"削除", action:openDialog}], 
				[{text:"編集", action:""}, {text:"削除"}]]
		})

		return {
			data,
			back,
			menuItems,
			openDialog,
			showArrow: computed(() => [1, 2, 3, 4, 5, 6, 10, 11, 12].includes(store.getters.pageNum)),
			dialogEvent
		};
	},
};
</script>
