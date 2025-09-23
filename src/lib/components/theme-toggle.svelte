<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	import { theme, setTheme } from 'mode-watcher';
	import Label from './ui/label/label.svelte';

	const Themes = [
		{ label: 'Default', value: 'neutral' },
		{ label: 'Stone', value: 'stone' },
		{ label: 'Zinc', value: 'zinc' },
		{ label: 'Gray', value: 'gray' },
		{ label: 'Slate', value: 'slate' },
		{ label: 'Azure', value: 'azure' },
		{ label: 'Verdant', value: 'verdant' },
		{ label: 'Amethyst', value: 'amethyst' },
		{ label: 'Solar Ink', value: 'solar-ink' },
		{ label: 'Cyber Neon', value: 'cyber-neon' },
		{ label: 'Royal Pop', value: 'royal-pop' }
	];

	const currentTheme = $derived(Themes.find((t) => t.value === theme.current)?.label ?? 'Default');
</script>

<div class="w-full max-w-md">
	<Label for="theme-select" class="mb-2 block text-sm font-medium">Select Theme</Label>
	<Select.Root type="single" value={theme.current} onValueChange={setTheme}>
		<Select.Trigger class="w-full max-w-md">{currentTheme}</Select.Trigger>
		<Select.Content>
			{#each Themes as { label, value } (value)}
				<Select.Item {value}>{label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
