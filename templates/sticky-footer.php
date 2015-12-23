<footer class="sticky-footer content-info" role="contentinfo">
	<section class="hide-when-unstuck">
		<div class="container">This section is only visible when the footer is stuck.</div>
	</section>
	<section>
		<div class="container">
			This content is visible whether the footer is stuck or not.
		</div>
	</section>
	<section class="hide-when-stuck">
		<div class="container">
			<h2>This section is only visible when the footer is not stuck.</h2>
			<?php dynamic_sidebar('sidebar-footer'); ?>
			<?php dynamic_sidebar('sidebar-social-links'); ?>
		</div>
	</section>
</footer>