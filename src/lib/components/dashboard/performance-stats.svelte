<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
  } from '$lib/components/ui/card';
  import { Chart, Svg, Area, Axis, Grid, Highlight, LinearGradient } from 'layerchart';
  import { curveMonotoneX } from 'd3-shape';
  import { ChartContainer, ChartTooltip } from '$lib/components/ui/chart';
  import type { UserPerformanceStats, ApiResponse } from '$lib/types';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import {
    TrophyIcon as Trophy,
    TargetIcon as Target,
    TrendingUpIcon as TrendingUp,
    UsersIcon as Users
  } from '@lucide/svelte/icons';

  let stats = $state<UserPerformanceStats | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const response = await fetch('/api/users/me/stats');
      const result: ApiResponse<UserPerformanceStats> = await response.json();
      if (result.success) {
        stats = result.data;
      } else {
        error = result.error.message;
      }
    } catch (e) {
      error = 'Failed to load performance statistics.';
    } finally {
      loading = false;
    }
  });

  const chartData = $derived(
    stats?.pointsHistory.map((h, i) => ({
      index: i + 1,
      points: h.points,
      date: new Date(h.date).toLocaleDateString()
    })) || []
  );

  const chartConfig = {
    points: {
      label: 'Points',
      color: 'hsl(var(--primary))'
    }
  };
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="space-y-1">
      <h2 class="text-2xl font-bold tracking-tight">Your Performance</h2>
      <p class="text-muted-foreground">Detailed overview of your match statistics and trends.</p>
    </div>
  </div>

  {#if loading}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {#each Array(4) as _}
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton class="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <Skeleton class="h-8 w-[60px]" />
          </CardContent>
        </Card>
      {/each}
    </div>
    <Card class="col-span-4">
      <CardHeader>
        <Skeleton class="h-6 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton class="h-[300px] w-full" />
      </CardContent>
    </Card>
  {:else if error}
    <Card class="border-destructive">
      <CardContent class="pt-6">
        <p class="text-destructive">{error}</p>
      </CardContent>
    </Card>
  {:else if stats}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          <Trophy class="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{Math.round(stats.winRate)}%</div>
          <p class="text-xs text-muted-foreground">
            {stats.wins} Wins / {stats.totalMatches} Matches
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">Avg. Points</CardTitle>
          <Target class="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{stats.avgPointsPerMatch.toFixed(1)}</div>
          <p class="text-xs text-muted-foreground">Per match average</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
          <TrendingUp class="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{stats.totalPointsFor}</div>
          <p class="text-xs text-muted-foreground">
            {stats.totalPointsAgainst} Conceded
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">Global Rank</CardTitle>
          <Users class="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {stats.winRate > stats.globalAvgWinRate ? 'Above' : 'Below'} Avg
          </div>
          <p class="text-xs text-muted-foreground">
            Global Avg: {Math.round(stats.globalAvgWinRate)}%
          </p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card class="col-span-4">
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Points scored across your match history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <Chart
                data={chartData}
                x="index"
                y="points"
                series={[{ key: 'points', label: 'Points', color: 'hsl(var(--primary))' }]}
                yDomain={[0, Math.max(...chartData.map((d) => d.points), 10) + 5]}
                padding={{ top: 10, bottom: 20, left: 20, right: 10 }}
                tooltipContext={{ mode: 'bisect-x' }}
              >
                <Svg>
                  <Grid y />
                  <Axis placement="left" format={(d) => `${d} pts`} ticks={5} />
                  <Axis placement="bottom" format={(d) => `M${d}`} ticks={chartData.length} />
                  <LinearGradient class="from-primary/30 to-primary/0" vertical>
                    {#snippet children({ gradient })}
                      <Area
                        seriesKey="points"
                        class="fill-primary/20 stroke-primary stroke-2"
                        fill={gradient}
                        curve={curveMonotoneX}
                      />
                    {/snippet}
                  </LinearGradient>
                  <Highlight points lines />
                </Svg>
                <ChartTooltip labelKey="date" />
              </Chart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card class="col-span-3">
        <CardHeader>
          <CardTitle>Metric Comparison</CardTitle>
          <CardDescription>How you stack up against the field.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-8 pt-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Win Rate</span>
              <span class="font-medium"
                >{Math.round(stats.winRate)}% / {Math.round(stats.globalAvgWinRate)}%</span
              >
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div class="h-full bg-primary" style="width: {stats.winRate}%"></div>
            </div>
            <div class="h-1 w-full overflow-hidden rounded-full bg-secondary/50">
              <div class="h-full bg-chart-1" style="width: {stats.globalAvgWinRate}%"></div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Avg Points</span>
              <span class="font-medium"
                >{stats.avgPointsPerMatch.toFixed(1)} / {stats.globalAvgPoints.toFixed(1)}</span
              >
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                class="h-full bg-chart-2"
                style="width: {Math.min(
                  (stats.avgPointsPerMatch / (stats.globalAvgPoints || 1)) * 50,
                  100
                )}%"
              ></div>
            </div>
            <div class="h-1 w-full overflow-hidden rounded-full bg-secondary/50">
              <div class="h-full bg-chart-4" style="width: 50%"></div>
            </div>
          </div>
        </CardContent>
        <CardFooter class="mt-auto">
          <div class=" rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <p>
              Comparison bars: Top bar (bigger) is you, bottom bar (smaller) is the global average.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  {/if}
</div>
