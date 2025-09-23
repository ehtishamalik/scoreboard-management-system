<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { nanoid } from 'nanoid';

	let {
		items = [],
		selected = $bindable(''),
		placeholder = 'Select an option...',
		emptyMessage = 'No results found.',
		noItemsMessage = 'No options available.',
		onChange
	}: {
		items: { value: string; label: string }[];
		selected: string;
		placeholder?: string;
		emptyMessage?: string;
		noItemsMessage?: string;
		onChange?: (value: string) => void;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedLabel = $derived(items.find((f) => f.value === selected)?.label);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => triggerRef.focus());
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		id={nanoid()}
		bind:ref={triggerRef}
		class={{ 'w-full justify-between': true, 'text-muted-foreground': !selectedLabel }}
	>
		{#snippet child({ props })}
			<Button variant="outline" {...props} role="combobox" aria-expanded={open}>
				{selectedLabel || placeholder}
				<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content class="p-0">
		{#if items.length === 0}
			<p class="p-2 text-sm text-muted-foreground">{noItemsMessage}</p>
		{:else}
			<Command.Root>
				<Command.Input placeholder="Search..." />
				<Command.List>
					<Command.Empty>{emptyMessage}</Command.Empty>
					<Command.Group>
						{#each items as item}
							<Command.Item
								value={item.label}
								onSelect={() => {
									selected = item.value;
									closeAndFocusTrigger();
									onChange?.(item.value);
								}}
							>
								<CheckIcon
									class={cn('mr-2 size-4', selected !== item.value && 'text-transparent')}
								/>
								{item.label}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		{/if}
	</Popover.Content>
</Popover.Root>
