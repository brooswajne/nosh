<script>
const root = document.documentElement;
let checked = root.dataset['theme'] === 'dark';
$: root.dataset['theme'] = checked ? 'dark' : 'light';
</script>

<div class="dark-mode-toggle">
	<input id="dark-mode" type="checkbox" 
		bind:checked={checked}
		aria-label="Toggle dark theme" />
	<label for="dark-mode">
		<i class="icon dark  fas fa-moon"></i>
		<i class="icon light fas fa-sun"></i>
	</label>
</div>

<style>
.dark-mode-toggle { font-size: 1.5rem }

input { display: none }

label {
	cursor: pointer;
	transition: color var(--transition-duration-quick);
}
.dark-mode-toggle:hover
label { color: var(--color-accent-coral) }

:global(html:not([data-theme="dark"]))
.icon.light { display: none }
:global(html[data-theme="dark"])
.icon.dark { display: none }
</style>
