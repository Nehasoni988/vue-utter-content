<template>
	<div id="app">
		<textarea
			placeholder="Type text inside it..."
			v-model="text"
			rows="5"
			style="width:400px;font-size:20px;margin-top:80px"
		></textarea>
		<VUC :text="text" @speechend="text = $event.text"></VUC>
	</div>
</template>

<script>
import VUC from "./components/VUC.vue";

export default {
	name: "App",

	data() {
		return {
			text: null,
		};
	},

	components: {
		VUC,
	},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
