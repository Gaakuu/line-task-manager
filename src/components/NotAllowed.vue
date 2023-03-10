<template>
	<div class="my-5">アクセスに失敗しました。グループのメンバーになっているか確認してください。</div>
	<v-btn @click="back">戻る</v-btn>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from 'vue-router'

export default {
	name: "NowAllowed",

	components: {},
	setup() {
		const router = useRouter();
		const store = useStore();

		store.dispatch("setPageNum", 8)
		function back(){
				router.push('/')
		}

		return {
			back
		};
	},
};
</script>
