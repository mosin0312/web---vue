<!-- App.vue -->
<template>
  <div id="app">
    <SuspectedFraudInformation />
  </div>
</template>

<script>
import SuspectedFraudInformation from './components/SuspectedFraudInformation.vue';

export default {
  components: {
    SuspectedFraudInformation
  }
};
</script>