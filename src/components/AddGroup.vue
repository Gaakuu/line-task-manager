<template>
	<v-container>
		<v-row>
			<v-col class="text-large text-center">グループを追加</v-col>
		</v-row>
		<v-row>
			<v-col>
				<v-card variant="tonal" color="black">

					<!-- グループ設定画面 -->
					<v-container v-if="step==0">
						<v-row>
							<v-col>必須項目</v-col>
						</v-row>
						<v-row>
							<v-col>
								<v-text-field
									v-model="data0.title"
									label="グループ名"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col>任意項目</v-col>
						</v-row>
						<!-- <v-row>
							<v-col align-self="center" class="custom-switch"><v-checkbox label="期限を設定する" v-model="control0.showDatePic"></v-checkbox></v-col>
						</v-row>
						<div v-if="control0.showDatePic">
							<v-row>
								<v-col align-self="center" cols="3">期限：</v-col>
								<v-col align-self="center" class="custom-switch">
									<v-switch v-model="control0.showTime" label="時間指定"></v-switch>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="6">
									<input type="date" :value="today">
								</v-col>
								<v-col v-if="control0.showTime" cols="6">
									<input type="time" value="00:00">
								</v-col>
							</v-row>
						</div> -->
						<v-row>
							<v-col>グループのカラー</v-col>
							<v-col><v-btn icon size="x-small" :color="data0.color" @click="control0.showColPicker=!control0.showColPicker"></v-btn></v-col>
							<transition name="slide">
								<v-col v-if="control0.showColPicker" cols="12">
									<v-color-picker
										transition="scroll-y-transition"
										v-model="data0.color"
										hide-inputs
										hide-canvas
										hide-sliders
										:swatches="swatches"
										show-swatches
									></v-color-picker>
								</v-col>
							</transition>
						</v-row>
						<v-row>
							<v-col class="text-right">
								<v-btn @click="changeStep(2)" :disabled="!data0.title.length > 0">次へ</v-btn>
							</v-col>
						</v-row>
					</v-container>

					<!-- 確認画面 -->
					<v-container v-if="step==2">
						<v-row>
							<v-col>確認</v-col>
						</v-row>
						<v-row>
							<v-col>グループ「{{data0.title}}」を登録します。
							よろしいですか？</v-col>

						</v-row>
						<v-row>
							<v-col class="text-left">
								<v-btn @click="changeStep(0)">戻る</v-btn>
							</v-col>
							<v-col class="text-right">
								<v-btn @click="addGroupandTask()">登録</v-btn>
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
import { useRouter } from 'vue-router'

export default {
	name: "AddGroup",
	setup() {
		const router = useRouter();
		const step = ref(0)
		const store = useStore();

		//ページ番号を登録
		store.dispatch("setPageNum", 3)

		const data0 = reactive({
			title:"",
			limit:null,
			member:[store.getters.userID],
			color:'#756F99',
			id:"test",
			tasks:[]
		});
		const swatches=[
			["#C8787A", "#499B95"],
			["#D59369", "#517F9C"],
			["#CCB664", "#756F99"],
			["#76AB63", "#9E6D8F"]
		]
		const control0 = reactive({
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

		onMounted(() => {
		});
		function addGroupandTask(){
			store.dispatch("addGroup", {group:data0}).then(()=>{
				store.dispatch("showSnackbar", "グループを作成しました")
				router.push("/")
			})
		}
		const changeStep = (n) => {
			step.value = n;
		};

		return {
			step,
			data0,
			control0,
			addGroupandTask,
			changeStep,
			swatches
		};
	},
};
</script>