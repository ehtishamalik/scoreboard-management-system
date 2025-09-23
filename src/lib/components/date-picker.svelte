<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import Loader from '@lucide/svelte/icons/loader';

	import { Button } from '$lib/components/ui/button/index.js';
	import { getLocalTimeZone, CalendarDate } from '@internationalized/date';
	import { dateToString } from '$lib/utils';
	import { getCalenderDate } from '$lib';

	const ID = $props.id();
	const {
		id = `${ID}-date`,
		placeholder = 'Select date',
		value: propValue,
		isLoading = false,
		disabled = false,
		minValue,
		maxValue,
		onChange
	}: {
		id?: string;
		placeholder?: string;
		value: Date | null;
		isLoading?: boolean;
		disabled?: boolean;
		minValue?: Date;
		maxValue?: Date;
		onChange: (date: string | null) => void;
	} = $props();

	let open = $state(false);
	let value = $state<CalendarDate>();

	$effect(() => {
		if (propValue) {
			const calendarDate = getCalenderDate(propValue);
			value = calendarDate;
		}
	});

	const handleChange = () => {
		open = false;
		onChange(value ? dateToString(value?.toDate(getLocalTimeZone())) : null);
	};
</script>

<div class="flex w-full">
	<Popover.Root bind:open>
		<Popover.Trigger {id}>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="outline"
					disabled={disabled || isLoading}
					class={{
						'w-full justify-between rounded-sm font-normal active:scale-100': true,
						'text-muted-foreground': !value
					}}
				>
					{value
						? new Intl.DateTimeFormat('en-US', {
								day: '2-digit',
								month: 'short',
								year: 'numeric',
								weekday: 'short'
							}).format(value.toDate(getLocalTimeZone()))
						: placeholder}
					{#if isLoading}
						<Loader class="animate-spin" />
					{:else}
						<ChevronDownIcon />
					{/if}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-auto overflow-hidden p-0" align="start">
			<Calendar
				type="single"
				bind:value
				captionLayout="dropdown"
				minValue={getCalenderDate(minValue)}
				maxValue={getCalenderDate(maxValue)}
				onValueChange={handleChange}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
