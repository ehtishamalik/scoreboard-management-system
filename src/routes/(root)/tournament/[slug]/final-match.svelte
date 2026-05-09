<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion/index.js';
  import * as Table from '$lib/components/ui/table/index.js';

  import { formateDate } from '$lib/utils';

  import type { MatchSeriesWithDetails } from '$lib/server/db/types';

  let {
    matches
  }: {
    matches: MatchSeriesWithDetails[];
  } = $props();
</script>

<div class="grid grid-cols-1 gap-x-6 xl:grid-cols-2">
  {#each matches as match (match.id)}
    <Accordion.Root type="multiple" class="mb-2">
      <Accordion.Item value={`item-${match.id}`}>
        <Accordion.Trigger class="mb-2 bg-muted px-4">
          <div>
            <p>
              {match.team1.name} vs {match.team2.name}
            </p>
            <div class="flex items-center gap-2 text-sm">
              <p>{formateDate(match.playedDate)}</p>
              {#if match.winnerId && match.winner?.name}
                <p>
                  - Won By <strong class="text-emerald-400">{match.winner.name}</strong>
                </p>
              {/if}
            </div>
          </div>
        </Accordion.Trigger>
        <Accordion.Content>
          <div>
            <Table.Root class="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.Head>Duel</Table.Head>
                  <Table.Head>{match.team1.name} Points</Table.Head>
                  <Table.Head>{match.team2.name} Points</Table.Head>
                  <Table.Head class="w-64">Winner</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Duel of Dawn</Table.Cell>
                  <Table.Cell>
                    {match.game1Team1Points}
                  </Table.Cell>
                  <Table.Cell>
                    {match.game1Team2Points}
                  </Table.Cell>
                  <Table.Cell>
                    {match.game1Team1Points > match.game1Team2Points
                      ? match.team1.name
                      : match.game1Team2Points > match.game1Team1Points
                        ? match.team2.name
                        : 'No winner yet'}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Duel of Valor</Table.Cell>
                  <Table.Cell>
                    {match.game2Team1Points}
                  </Table.Cell>
                  <Table.Cell>
                    {match.game2Team2Points}
                  </Table.Cell>
                  <Table.Cell>
                    {match.game2Team1Points > match.game2Team2Points
                      ? match.team1.name
                      : match.game2Team2Points > match.game2Team1Points
                        ? match.team2.name
                        : 'No winner yet'}
                  </Table.Cell>
                </Table.Row>
                {#if !(match.winnerId && match.game3Team1Points === 0 && match.game3Team2Points === 0)}
                  <Table.Row>
                    <Table.Cell>Duel of Glory</Table.Cell>
                    <Table.Cell>
                      {match.game3Team1Points}
                    </Table.Cell>
                    <Table.Cell>
                      {match.game3Team2Points}
                    </Table.Cell>
                    <Table.Cell>
                      {match.game3Team1Points > match.game3Team2Points
                        ? match.team1.name
                        : match.game3Team2Points > match.game3Team1Points
                          ? match.team2.name
                          : 'No winner yet'}
                    </Table.Cell>
                  </Table.Row>
                {/if}
              </Table.Body>
            </Table.Root>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  {/each}
</div>
