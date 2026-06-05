<template>
  <div class="app-shell">
    <header>
      <h1>FFL Vue Prototype</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.25rem;
  margin: 0;
}

nav {
  display: flex;
  gap: 0.75rem;
}
</style>
