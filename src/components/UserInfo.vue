<template>
	<v-container>
		<v-row>
			<v-col class="text-large">ユーザー名：{{$store.getters.userInfo.name }}</v-col>
		</v-row>
		<v-row>
			<v-col>
				<v-btn @click="data.changeName=!data.changeName">ユーザー名を変更</v-btn>
			</v-col>
		</v-row>
		<v-row v-if="data.changeName">
			<v-col><v-text-field 
				v-model="data.name"
				label="新しい名前"
			></v-text-field></v-col>
			<v-col cols="3">
				<v-btn @click="updateName">更新</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { reactive } from "@vue/runtime-core";
import { useStore } from "vuex";

export default {
	name: "UserInfo",
	setup() {
		const store = useStore();
		const data = reactive({
			changeName:false,
			name:""
		})
		const load = async()=>{
			store.dispatch("setPageNum", 12);
		}

		const updateName = async()=>{
			if(data.name){
				await store.dispatch("updateUserName", data.name);
				await store.dispatch("showSnackbar", "更新しました")
				data.changeName = false;
			}
		}
		load();


		return {
			data,
			updateName
		};
	},
};
</script>