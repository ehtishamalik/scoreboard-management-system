<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head>
	<!-- Basic SEO -->
	<title>Lycus Score – Tournament Management System</title>
	<meta
		name="description"
		content="Lycus Score is a powerful tournament management system for esports. Organize teams, schedule matches, track real-time scores, and view detailed statistics."
	/>
	<meta
		name="keywords"
		content="tournament management, esports, team registration, match scheduling, real-time scores, tournament app, lycuscore"
	/>
	<meta name="author" content="Lycus Inc." />

	<!-- Favicon & App Icons -->
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="manifest" href="/site.webmanifest" />

	<!-- Open Graph (Facebook, LinkedIn, etc.) -->
	<meta property="og:title" content="Lycus Score – Tournament Management System" />
	<meta
		property="og:description"
		content="Manage esports tournaments effortlessly with Lycus Score. Register teams, schedule matches, update scores in real time, and track stats."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://score.lycusinc.com/" />
	<meta property="og:image" content="https://score.lycusinc.com/apple-touch-icon.png" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Lycus Score – Tournament Management System" />
	<meta
		name="twitter:description"
		content="Organize and manage esports tournaments with team registration, scheduling, and live score updates."
	/>
	<meta name="twitter:image" content="https://score.lycusinc.com/apple-touch-icon.png" />

	<!-- PWA for iOS -->
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="lycuscore" />

	<!-- iOS Splash Screens (Logo when loading) -->
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_17_Pro_Max__iPhone_16_Pro_Max_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_17_Air__iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/iPhone_11__iPhone_XR_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
		href="splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/13__iPad_Pro_M4_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/12.9__iPad_Pro_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/11__iPad_Pro_M4_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/11__iPad_Pro__10.5__iPad_Pro_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/10.9__iPad_Air_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/10.5__iPad_Air_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/10.2__iPad_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="splash/8.3__iPad_Mini_landscape.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_17_Pro_Max__iPhone_16_Pro_Max_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_17_Air__iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/iPhone_11__iPhone_XR_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
		href="splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/13__iPad_Pro_M4_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/12.9__iPad_Pro_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/11__iPad_Pro_M4_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/10.9__iPad_Air_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/10.5__iPad_Air_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/10.2__iPad_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="splash/8.3__iPad_Mini_portrait.png"
	/>
</svelte:head>

{@render children?.()}
