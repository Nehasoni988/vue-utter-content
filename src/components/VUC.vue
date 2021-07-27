<template>
	<div class="vuc">
		<!-- Icon to display -->

		<img
			:src="black_microphone_img_source"
			@click="dialog = true"
			:style="{ cursor: 'pointer' }"
		/>

		<!-- Modal Box Parent -->
		<transition name="vuc-modal-fade" appear>
			<div class="vuc-modal-backdrop" v-if="dialog">
				<div class="vuc-modal">
					<!-- Header -->
					<header class="vuc-modal-header">
						{{ header_title }}
					</header>

					<!-- Body -->
					<section class="vuc-modal-body">
						<div v-if="!error" class="px-0">
							<div v-if="!sentences.length" style="color:grey">
								{{ placeholder }}
							</div>
							<div v-else :style="contentStyleObj">
								<span
									v-for="(sentence, index) in sentences"
									:key="index"
									style="color:black"
									>{{ sentence }}.
								</span>
							</div>
						</div>
						<div v-else style="color:red">{{ error }}</div>
					</section>

					<footer class="vuc-modal-footer">
						<div
							v-for="(action, index) in actions"
							:key="index"
							:style="action.style"
							class="button"
							@click="handleFunctionCall(action.method_name)"
						>
							<div
								v-if="action.value === 4"
								:class="['vuc-pulse-el', { 'vuc-pulse-red': speaking }]"
							></div>
							<div v-else>
								<img v-if="action.img" :src="action.img" />
							</div>
							<div :style="{ paddingTop: action.value === 4 ? null : '5px' }">
								&ensp;{{ action.title }}
							</div>
						</div>
					</footer>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
let SpeechRecognition = null;
let recognition = null;

const IMG_SOURCES = {
	blue_microphone:
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAACDUlEQVRIiaXVy2+OURAG8N8rWiEE0UTFJY1riPulUnbEBok/wIodIVbK2i34A+wt7ARFE0mbStk07JBaSER3bmEh2sZmLN5pvOr7vn7VSSZ5zpznPHMy5zJMaTGLOEkMEWPpQ8SJcm5GFi3EfeIZcYCYk36QeE7cI2bPJMG1+iIxm3hAXP5f8XnEN2JpA057cubWYzSq4Q4MU3yqTyk+4m1ya1qj+i3CBqIvx4MUV0oYV9GZ8fVY/D8JCrzDjRy/r8zdxtPEl5I77QSwEdcTD6A78RnsS7xmCo3JFueIDuIo0U+sTl9U4bRV4v3J7SDOTlardcjb0J64C33p1et4sxLvyli7Goc9VYkGcTzxaCV+GhNX804jgVoJRjEfY+V88f1fSjGO8RJHS2XNz8nMWiUaUR7cW2xLgToWLSXHMNbiQ33un0XbiceJHxHnG3AvED2Je4mtTSSAGCR2EyuJEaKbaK3MtxIXc24FsZcYaFIcYgvxmliSAj3E59xlb+IHxPK8sm+ITdNIQN7tV8TOHC8jDqcvy9iu5Byup1L3iafAVtzCF/Qovw5Yh2NowymKN9Pc/T+JOomHxHD6Q2JPMyub7EbFi7KrGc7AV4qXzaycaU+d0hqcQazCQUw8tENYkPiH8h+CX3iSzafZBLFYWY67/n7+E42l+n0sxBFsoBirv+G/E+wnYpq+uZbSb1Az3B2C1jsfAAAAAElFTkSuQmCC",
	black_microphone:
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB7UlEQVRIiaXVS29NURQH8B9pK4RoQ6KNRxrPEOpdKTNiUhIfwIgZIUZaY6/gA5gbmAktmkjakDJpmCG3gybCzCsMRCsmDPa6elrnnnvau5KV/Pfa/73W3muvvRf1ZSFOYwxToWM4FXMNSTMe4DkOY1HoEbzAfTQ1EuB6gZMmDODKfJ0vwTesKuC0B2dxLUJRDnejgk8FnI8YD26uFOWvFVswHONRXA18Dd2BN6NtPgEWYAI3Y/wuM3cHzwJfDu6cA8BW3Aj8FH2Bz+Fg4A11fPwnF9CJ4xjB+tDWDGdlxj4S3E6cn+0s75J3StUBPdIdDJtZjrcy9p6wtcu57HopGsXJwJMZ+1nTpXm3yEFegEkslb6EJnzP4fwKJb326pqfs4l5KfogXdy4lK7mgg02B6eCjXhfwP0nu/A48CNcLOD2YzDwELrKBCDlfh/WSifqQ0tmvgWXYm4NDkhlXFp24A1WhINBfI5dDgUewGqpZN9i21wCkGr7NfbEuAO9oR1h2xuc3lpOaj7xkC7cxpc4xUTYN+FE7P5MnKAh6cZDqVoqgfeXWVi2G72Uulolxl/xqszChntqPSm6g3VS760+tKNYFviH6T7xG0+k5lM6QJuUjntmPv9qY8l+H8txTGpOUwUbniGH8GeOuj3P0V8Q5GeIwd9sJQAAAABJRU5ErkJggg==",
	save:
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB/UlEQVRIie2SMWgTURzGv/8lTZqjgpaugUoFheQuQ3HrUuhQurdSE+8ShYJDQdRFXDoKgoOLZBCuyfVqGkhHsWN1UKFDUoudRBQHESOlbbSX3Pu7KB7hbO7OdPObHt/7eL/3/t8jABi35kfaIvYZwB6O1yARnnUGWpd25qp2jywAIPpnyR8budLocWHV1O8y43a0LVdSa7O+IJKfW7hFTA8E4yBylFg/93Ax3ncAE4sLsVaeiZrymb1aL0hgAABU56qOX0goQBBIiBFhTFnRppQVbWq3nZiUSJggOisP71fGiwsD3fmo1yF/ExG9JeYMQAsuFwS8YfCkPXSkAtgKDahnjRqAmteeauqbXn7oDvzqP6CnApUcRGo5P00S5BN5wfnHV0+B+BE7zqcTAcTj4h4x1hta+VXfRsSAEwE5GUubYMHTzEIF+tiBEKwPDba+HNryFgHX61r5EAjxi9KrhWRq7dpwt7+jlT4ctBN3AHpdzy1v/PYDAyIdZ0ayO8/Tq4Wk21fMvEJMBdsRt9x+YED9SqkIovuSI16kLU0FACwtSQQuMtHNXb309Z8AALCdNQwwFiVBTzOWNpEZe3eDgeZ21qh2Z10lU1I19aZPxstGbnlGLee/sUCFCSQ5fNErSAAABinW5dN+X7Bvx76/Lxg/gF+zJ6QaWeOJV/Yn8jbFH0owJp8AAAAASUVORK5CYII",
	broom:
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABMklEQVRIieXUTytEURjH8Y8xxp+a2Uxs0GzEwv+tLLwAWzYsbFgiG+UFeB9skZfgLYhSLBUlsSKaGBZzpsbNHXfmWii/Ot2ezvP8vud0n+eQXGu4CWu1ibpEGsclBsO6wliSwvaEgHk8ox+jeEAGpz8VZhMCsnjDdYgH0JG0sBkdhu9M0oJMk4Cm9WcAGVTq4krS2rguasMUZjGNdeyrtir0YAtPGFH94XdxRlFNYC+c8gwvOMFBJG8Rc+jGJD6wgvNGNxrGLZYaJcVoWXXKhxolHWOjBfOaNnEUt9mpOqG5FIAcHoMXvnZCH+5RTgEoB4/e7wDRVmxV7+q6888M2j8GRJ/rAhZSehYaAfK/AMjHbZRwkdJc8CjVgugNithOCSjWB/WvaQ476EoJeMWu8CJ8AjM6LZ0RT+DGAAAAAElFTkSuQmCC",
	quit:
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB40lEQVRIidXVzYuPURQH8M8dphkTSWFhqbwkkkyTMCsva+pXZGyszWbW/gHZWFkQVppCmY0aSWGBItEUYWEwZaWZvDReRnMsnmfq+vk9M894WfjWU88995zzPfd77z2XmghS0BVcDT4E54I0V1xbjcRtwWW8xzN8xnJswK6g448I0IuVWIrreJz4hhFcxLvgbNVqKgmCnuA0+vEiERhtcjuJZdiM7toEwWIM4X5Z/XRFHa8S3/FaIdsvWFgRuBGjqdjIdmyp8JsTVRK142P5/+l3k89G8Nfw/xNUbXIV7v4LgieYhMTNzD6gOKI/IehR3ItribE5JUo8SlxpYZ8sb3Se/AguKNrIvWBtLYmC9sRUk60j8TUz9eIwdibeBBNo1N3kY8H5KA9FKcPLYEnmM4ADZfIF2IOnVRX3BsPZuDMYLkm2BW+D3dn8ieBQNj4eRatpjWaCjOR2MBXsnSV2X/A8iu47r3uwCWvwAAejRWwU86fQSMX7UW8FQfeMLE1ypcynKxjJpZptBdOKjZrBevQlbiS+YD/G0Zn5nMGtxGBl5Vk1q6Po8bUQHA3ulK29dtDDoFHDb3sUR3NV7eRl4NZS9/5gRYv5RUFfMBbsmFfyLMm64FIwUX7j2TcRDEXx+lXiB3mQsUtG4xOlAAAAAElFTkSuQmCC",
};

const VALUES = {
	quit: 1,
	clear: 2,
	start: 3,
	stop: 4,
	save: 5,
};

export default {
	name: "VUC",

	props: {
		text: {
			required: true,
		},
		lang: {
			type: String,
			default: "en-US",
		},
		header_title: {
			type: String,
			default: "Speech To Text",
		},
		placeholder: {
			type: String,
			default: "start speaking and text will display here...",
		},
		quit_label: {
			type: String,
			default: "Quit",
		},
		clear_label: {
			type: String,
			default: "Clear",
		},
		start_label: {
			type: String,
			default: "Start Speaking",
		},
		stop_label: {
			type: String,
			default: "Stop",
		},
		save_label: {
			type: String,
			default: "Save & Exit",
		},
	},

	data() {
		return {
			dialog: false,
			error: false,
			speaking: false,
			toggle: false,
			runtimeTranscription: "",
			sentences: [],
		};
	},

	watch: {
		dialog(newVal, oldVal) {
			if (newVal && this.text) {
				this.sentences.push(this.text);
			}
		},
	},

	computed: {
		black_microphone_img_source() {
			return IMG_SOURCES.black_microphone;
		},

		contentStyleObj() {
			return {};
		},

		actions() {
			return [
				{
					value: VALUES.quit,
					title: this.quit_label,
					style: { color: "red" },
					method_name: "closeWithoutSaving",
					img: IMG_SOURCES.quit,
				},
				{
					value: VALUES.clear,
					title: this.clear_label,
					style: { color: "black" },
					method_name: "clearText",
					img: IMG_SOURCES.broom,
				},
				{
					value: this.toggle ? VALUES.stop : VALUES.start,
					title: this.toggle ? this.stop_label : this.start_label,
					style: { color: this.toggle ? "red" : "blue" },
					method_name: this.toggle
						? "stopSpeechRecognition"
						: "startSpeechRecognition",
					img: this.toggle ? null : IMG_SOURCES.blue_microphone,
				},
				{
					value: VALUES.save,
					title: this.save_label,
					style: { color: "green" },
					method_name: "saveRecognitionAndExit",
					img: IMG_SOURCES.save,
				},
			];
		},
	},

	methods: {
		closeModal() {
			this.dialog = false;
		},

		handleFunctionCall(method_name) {
			this[method_name]();
		},

		capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},

		checkCompatibility() {
			try {
				if (!recognition) {
					throw {
						message: "There is some error while recording",
					};
				}
			} catch (error) {
				console.error(error);
			}
		},

		async setRecognition() {
			SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			recognition = SpeechRecognition ? await new SpeechRecognition() : false;
		},

		async startSpeechRecognition() {
			try {
				await this.setRecognition();

				await this.checkCompatibility();

				this.toggle = true;
				recognition.lang = this.lang;
				recognition.interimResults = true;

				this.setSpeechStartListener();

				this.setSpeechEndListener();

				this.setResultListener();

				this.setEndListener();

				recognition.start();
			} catch (error) {
				console.error(error);
				return false;
			}
		},

		setSpeechStartListener() {
			recognition.addEventListener("speechstart", (event) => {
				this.speaking = true;
			});
		},

		setSpeechEndListener() {
			recognition.addEventListener("speechend", (event) => {
				this.speaking = false;
			});
		},

		setResultListener() {
			recognition.addEventListener("result", (event) => {
				const text = Array.from(event.results)
					.map((result) => result[0])
					.map((result) => result.transcript)
					.join("");
				this.runtimeTranscription = text;
			});
		},

		setEndListener() {
			recognition.addEventListener("end", () => {
				if (this.runtimeTranscription !== "") {
					this.sentences.push(
						this.capitalizeFirstLetter(this.runtimeTranscription),
					);
					this.$emit(
						"update:text",
						`${this.text}${this.sentences.slice(-1)[0]}. `,
					);
				}
				this.runtimeTranscription = "";
				recognition.stop();
				if (this.toggle) {
					// keep it going.
					recognition.start();
				}
			});
		},

		stopSpeechRecognition() {
			if (recognition) {
				recognition.stop();
				this.toggle = false;
			}
		},

		clearText() {
			// Before clearing check if recording is on and off it.
			this.stopSpeechRecognition();

			this.sentences = [];
			this.runtimeTranscription = "";
		},

		saveRecognitionAndExit() {
			try {
				// Save recorded text in local variable
				let result = this.sentences.join(". ");

				// Clear the text
				this.clearText();

				// Close dialog
				this.closeModal();

				// Emit event with recorded result
				this.$emit("speechend", { text: result });
			} catch (error) {
				console.error(error);
				return false;
			}
		},

		closeWithoutSaving() {
			try {
				// Clear the text
				this.clearText();

				// Close dialog
				this.closeModal();
			} catch (error) {
				console.error(error);
				return false;
			}
		},
	},
};
</script>

<style>
/* MODAL BOX CSS */
.vuc-modal-backdrop {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	padding: 2rem;
	box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
	background: #fff;
	z-index: 999;
	transform: none;
	justify-content: center;
	display: flex;
	align-items: center;
	background-color: rgba(53, 49, 49, 0.7);
}

.vuc-modal {
	background: #ffffff;
	box-shadow: none !important;
	overflow-x: auto;
	display: flex;
	flex-direction: column;
	width: 900px;
	height: 700px;
	text-align: left;
	position: relative;
}

.vuc-modal-header {
	padding: 20px 10px;
	position: relative;
	text-align: center;
	border-bottom: 1px solid #eeeeee;
	font-weight: bold;
	color: black;
}

.vuc-modal-footer {
	width: 900px;
	position: absolute;
	bottom: 0;
	border-top: 1px solid #eeeeee;
}

.vuc-modal-body {
	position: relative;
	padding: 20px 10px;
}

.vuc-modal-fade-enter,
.vuc-modal-fade-leave-to {
	opacity: 0;
}

.vuc-modal-fade-enter-active,
.vuc-modal-fade-leave-active {
	transition: opacity 0.5s ease;
}

/* MODAL BOX's BUTTONS' CSS */
.vuc .button {
	background-color: transparent;
	border: none;
	padding: 12px 0;
	font-size: 16px;
	cursor: pointer;
	width: calc(900px / 4);
	outline: none;
	display: inline-flex;
	justify-content: center;
}

/* PULSE ANIMATION ON SPEAKING CSS */
.vuc-pulse-el {
	width: 18px;
	height: 18px;
	background: red;
	border-radius: 50%;
}

.vuc-pulse-red {
	transform: scale(1);
	animation: pulse-black 1s infinite;
	box-shadow: 0 0 0 0 red;
	animation: vuc-pulse-red 1s infinite;
}

@keyframes vuc-pulse-red {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.8);
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(255, 82, 82, 0.2);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.2);
	}
}
</style>
