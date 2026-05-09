<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import PulseDot from './pulse-dot.svelte';

  import { CalendarIcon } from '@lucide/svelte/icons';
  import { formateDate } from '$lib/utils';

  import type { TournamentSelectModel } from '$lib/server/db/types';

  let { tournament } = $props<{ tournament: TournamentSelectModel }>();
</script>

<Card.Root
  class="group relative transition-all duration-300 hover:border-chart-1/30 hover:bg-muted/30"
>
  <Card.Header>
    <div class="flex items-start justify-between gap-3">
      <Card.Title class="text-lg leading-tight font-bold">
        <a
          href={`/tournament/${tournament.slug}`}
          class="absolute inset-0"
          aria-label={`View tournament ${tournament.name}`}
        >
        </a>
        {tournament.name}
      </Card.Title>

      <Badge variant="muted">Ended</Badge>
    </div>

    <Card.Description class="flex items-center gap-2 text-xs text-muted-foreground">
      <CalendarIcon class="size-3.5" />
      <span>
        {formateDate(tournament.startDate, 'No start date')}
      </span>
      <span class="text-muted-foreground/30">—</span>
      <span>
        {formateDate(tournament.endDate, 'No end date')}
      </span>
    </Card.Description>
  </Card.Header>

  <Card.Footer
    class="mt-auto flex items-center justify-between text-xs font-medium text-muted-foreground/70"
  >
    <div class="flex items-center gap-2">
      <PulseDot />
      Archived
    </div>
    <span>
      {formateDate(tournament.updatedAt)}
    </span>
  </Card.Footer>
</Card.Root>
