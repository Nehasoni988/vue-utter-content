# vue-utter-content

## Demo

![Demo](./src/assets/demo.gif)

#### [Codesandbox Example](https://codesandbox.io/s/vue-utter-content-uqfct)

## Installation

```
npm install --save vue-utter-content
```

or

```
yarn add vue-utter-content
```

## Declaration

#### Global Import (In main.js file)

```
import VUC from "vue-utter-content";
import "vue-utter-content/dist/vuc.css";
Vue.component("VUC", VUC);
```

#### Local Import (In any component)

```
<script>
import VUC from "vue-utter-content";
import "vue-utter-content/dist/vuc.css";

export default {
  components: {
    VUC
  }
}
<script>
```

## Basic Usage

#### Example-1

```
<template>
  <div>
    <textarea v-model="body"></textarea>
    <VUC
      :text="body"
      @speechend="body = $event.text"
    ></VUC>
  </div>
<template>
<script>
export default {
  name: "MyComponent",
  data() {
		return {
			body: "Hello World",
		};
	},
}
```

#### Example-2

```
<template>
  <div>
    <textarea v-model="body"></textarea>
    <VUC
      :text="body"
      lang="fr-FR"
      header_title="Commencer à parler"
      placeholder="le texte parlé sera ici..."
      quit_label="Fermer"
      clear_label="Effacer le texte"
      start_label="Début"
      stop_label="Arrêter"
      save_label="sauver"
      @speechend="body = $event.text"
    ></VUC>
  </div>
<template>
<script>
export default {
  name: "MyComponent",
  data() {
		return {
			body: "Bonjour le monde",
		};
	},
}
</script>
```
## Properties

  | Name | Type | Required | Default Value | Support Values |
  | ---- | ---- |--------- |------------ |--------------- |
  | text | String | Yes | - | any string|
  | lang | String | No | "en-US" | [BCP-47 Languages Codes](https://cloud.google.com/speech-to-text/docs/languages) (go to this link and scroll down for language codes)|
  | header_title | String | No | "Speech To Text" | any string|
  | placeholder | String | No | "start speaking and text will display here..." | any string |
  | quit_label | String | No | "Quit" | any string |
  | clear_label | String | No | "Clear" | any string |
  | start_label | String | No | "Start Speaking" | any string |
  | stop_label | String | No | "Stop" | any string |
  | save_label | String | No | "Save & Exit"  | any string |

## Events
- `speechend`

    This event will fire when user stop speaking and save the content. i.e-

  ```
   <template>
    <VUC :text="text" @speechend="onSpeechEnd"></VUC>
   </template>

   <script>
    export default {
      methods:{
        onSpeechEnd(event) {
          console.log(event)
        }
      }
    }
   </script>

