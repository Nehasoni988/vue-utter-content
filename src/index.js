import VUC from "./components/VUC.vue";

function install(Vue) {
	if (install.installed) return;
	install.installed = true;
	Vue.component("vuc", VUC);
}

const plugin = {
	install,
};

let GlobalVue = null;
if (typeof window !== "undefined") {
	GlobalVue = window.Vue;
} else if (typeof global !== "undefined") {
	GlobalVue = global.vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
}

VUC.install = install;

export default VUC;
