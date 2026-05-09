<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
</script>

<main class="flex min-h-svh items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
  <Card.Root>
    <Card.Header>
      <Card.Title>Account Deactivated</Card.Title>
      <Card.Description>Your account has been deactivated.</Card.Description>
    </Card.Header>
    <Card.Content>
      <p class="mb-4 text-center">Please contact support for more information.</p>
    </Card.Content>
    <Card.Footer>
      <Button href="/">Return to Home</Button>
    </Card.Footer>
  </Card.Root>
</main>
