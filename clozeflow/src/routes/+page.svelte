<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  goto(`${base}/activity`, { replaceState: true });
</script>
