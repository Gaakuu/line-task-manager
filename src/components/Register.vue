<template>
	<div class="my-5">ようこそ！登録することでLINEアカウントを用いてサービスが利用できます。</div>
	<v-text-field v-model="data.name" label="名前"></v-text-field>
	<v-btn @click="register" :disabled="data.name==''">登録</v-btn>
</template>

<script>
import { reactive } from "@vue/runtime-core";
import { useStore } from "vuex";
import { useRouter } from 'vue-router'

export default {
	name: "RegisterPage",

	components: {},
	setup() {
		const router = useRouter();
		const store = useStore();
		const data = reactive({
			name:""
		});
		store.dispatch("setPageNum", 7)
		function register(){
			store.dispatch("registerAccount", data.name).then(()=>{
				router.push('/')
			})
		}

		return {
			data,
			register,
		};
	},
};
</script>
