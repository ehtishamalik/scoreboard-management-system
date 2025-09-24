<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import HouseIcon from '@lucide/svelte/icons/house';
	import DicesIcon from '@lucide/svelte/icons/dices';
	import UsersIcon from '@lucide/svelte/icons/users';
	import UserIcon from '@lucide/svelte/icons/user';
	import VolleyballIcon from '@lucide/svelte/icons/volleyball';
	import HandshakeIcon from '@lucide/svelte/icons/handshake';
	import TrophyIcon from '@lucide/svelte/icons/trophy';

	const { session } = $props();

	const sidebar = Sidebar.useSidebar();

	const items = [
		{
			title: 'Home',
			url: '/',
			icon: HouseIcon
		}
	];

	const committeeItems = [
		{
			title: 'Manage Tournaments',
			url: '/management/tournaments',
			icon: DicesIcon
		},
		{
			title: 'Manage Participations',
			url: '/management/participations',
			icon: HandshakeIcon
		},
		{
			title: 'Manage Teams',
			url: '/management/teams',
			icon: UsersIcon
		},
		{
			title: 'Manage Matches',
			url: '/management/matches',
			icon: VolleyballIcon
		},
		{
			title: 'Manage Finals',
			url: '/management/finals',
			icon: TrophyIcon
		}
	];

	const adminItems = [
		{
			title: 'Manage Users',
			url: '/admin/users',
			icon: UserIcon
		}
	];

	const handleClick = () => {
		sidebar.setOpenMobile(false);
	};
</script>

<Sidebar.Root>
	<Sidebar.SidebarHeader>
		<img src="/logo.png" alt="company logo" class="mx-auto mt-2 w-24 object-cover" width={96} />
	</Sidebar.SidebarHeader>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Scoreboard</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a {...props} href={item.url} onclick={handleClick}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		{#if session && (session.user.role === 'ADMIN' || session.user.role === 'COMMITTEE')}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Management</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each committeeItems as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton>
									{#snippet child({ props })}
										<a {...props} href={item.url} onclick={handleClick}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
		{#if session && session.user.role === 'ADMIN'}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each adminItems as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton>
									{#snippet child({ props })}
										<a {...props} href={item.url} onclick={handleClick}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>
</Sidebar.Root>
