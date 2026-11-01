<script setup lang="ts">
// OIDCButton — OIDC / SSO login button with the provider's dashboard-icon
// (falls back to a generic key if the icon can't be found).
import { ZABtn, ZAIcon, ZAImg } from "@v2/lib";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({ inheritAttrs: false });

defineProps<{
  provider: string | null | undefined;
  blocking?: boolean;
}>();

const { t } = useI18n();
const loading = ref(false);

function login() {
  if (loading.value) return;
  loading.value = true;
  window.open("/api/login/openid", "_self");
}

defineExpose({ login, loading });
</script>

<template>
  <ZABtn
    variant="outlined"
    block
    :disabled="loading || blocking"
    :loading="loading"
    @click="login"
  >
    <template v-if="provider" #prepend>
      <ZAIcon size="20">
        <ZAImg
          :src="`/assets/dashboard-icons/${provider
            .toLowerCase()
            .replace(/ /g, '-')}.png`"
        >
          <template #error>
            <ZAIcon icon="mdi-key" size="20" />
          </template>
        </ZAImg>
      </ZAIcon>
    </template>
    {{ t("login.login-oidc", { oidc: provider || "OIDC" }) }}
  </ZABtn>
</template>
