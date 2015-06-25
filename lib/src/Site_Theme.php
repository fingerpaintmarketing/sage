<?php

/**
 * Contains a theme class to provide core functionality for the theme.
 *
 * PHP Version 5.5+
 *
 * @category Themes
 * @package  Fingerpaint_Theme_Extensions
 * @author   Fingerpaint Developers <devs@fingerpaintmarketing.com>
 * @license  Copyright 2015 Fingerpaint. All rights reserved.
 * @link     http://fingerpaintmarketing.com
 */

namespace Fingerpaint;

/**
 * A theme class to provide core functionality for the theme.
 *
 * PHP Version 5.5+
 *
 * @category Themes
 * @package  Fingerpaint_Theme_Extensions
 * @author   Fingerpaint Developers <devs@fingerpaintmarketing.com>
 * @license  Copyright 2015 Fingerpaint. All rights reserved.
 * @link     http://fingerpaintmarketing.com
 */
class Site_Theme extends Theme {

	/**
	 * A function to return the result of any get function in the instance of this class.
	 *
	 * @param string $func The function part to use when getting the result to return.
	 *
	 * @access public
	 * @return mixed
	 */
	public static function get( $func ) {
		return call_user_func( [ get_called_class(), 'get_' . $func ] );
	}

	/**
	 * A function to echo the result of any get function in the instance of this class.
	 *
	 * @param string $func THe function part to use when getting the result to echo.
	 *
	 * @access public
	 * @return void
	 */
	public static function the( $func ) {
		echo self::get( $func );
	}

	/**
	 * An action hook to register widgets.
	 *
	 * @see https://developer.wordpress.org/reference/hooks/widgets_init/
	 *
	 * @access public
	 * @return void
	 */
	public static function action_widgets_init() {

		/* Register custom sidebars. */
		register_sidebar( [
			'name'          => __( 'Social Links', 'sage' ),
			'id'            => 'sidebar-social-links',
			'before_widget' => '<ul class="widget %1$s %2$s">',
			'after_widget'  => '</ul>',
			'before_title'  => '<h3>',
			'after_title'   => '</h3>',
		] );

		/* Register custom widgets. */
		register_widget( __NAMESPACE__ . '\\Widget_Social_Link' );
	}

	/**
	 * Action hook to register custom scripts and styles.
	 *
	 * @see https://developer.wordpress.org/reference/hooks/wp_enqueue_scripts/
	 *
	 * @access public
	 * @return void
	 */
	public static function action_wp_enqueue_scripts() {

		/* Store the theme path for use in Sage scripts. */
		wp_localize_script( 'sage_js', 'themes_path', substr( get_template_directory(), strpos( get_template_directory(), 'wp-content/' ) ) );

		/* Add the Wistia Embed Shepherd script to help with Google Analytics integration. */
		// IF USING WISTIA, UNCOMMENT THIS SECTION.
		//wp_enqueue_script( 'wistia-embed-shepherd', '//fast.wistia.com/assets/external/embed_shepherd-v1.js' );
	}

	/**
	 * A filter for the confirmation to add custom JavaScript to fire Google Analytics events.
	 *
	 * @param mixed $confirmation The confirmation message or array to be filtered.
	 * @param array $form The current form.
	 * @param array $lead The current entry array.
	 * @param bool $is_ajax Whether the form is configured to be submitted via AJAX or not.
	 *
	 * @see https://www.gravityhelp.com/documentation/article/gform_confirmation/
	 *
	 * @access public
	 * @return mixed
	 */
	public static function filter_gform_confirmation( $confirmation, $form, $lead, $is_ajax ) {

		/* If the confirmation is not configured to be text, bail out. */
		if ( is_array( $confirmation ) ) {
			return $confirmation;
		}

		/* Set default form values for Google Analytics events. */
		$events = [
			[
				'category' => 'Forms',
				'action'   => 'Submitted',
				'label'    => strip_tags( $form['title'] ),
			],
		];

		/* Override or augment default event values in specific cases, if needed. */
		switch ( $form['id'] ) {
		}

		/* Add Google Analytics tracking snippet to confirmation message dynamically. */
		$ga_function_calls = [ ];
		foreach ( $events as $event ) {

			/* Build base function call. */
			$function_call = 'ga(\'send\', \'event\', \'' . $event['category'] . '\', \'' . $event['action'] . '\'';

			/* If a label is specified, add it. */
			if ( ! empty( $event['label'] ) ) {
				$function_call .= ', \'' . $event['label'] . '\'';
			}

			/* If a value is specified, add it. */
			if ( ! empty( $event['value'] ) && is_int( $event['value'] ) ) {
				$function_call .= ', ' . $event['value'];
			}

			/* Close the function call and add it to the array of function calls. */
			$function_call .= ');';
			$ga_function_calls[] = $function_call;
		}

		/* Flatten function calls array into return-delimited string. */
		$ga_function_calls = implode( "\n", $ga_function_calls );

		return $confirmation . <<<HTML
<script type="text/javascript">
	if (typeof ga === 'function') {
		{$ga_function_calls}
	}
</script>
HTML;
	}

	/**
	 * A filter function for the Gravity Forms tabindex.
	 *
	 * @param int $tabindex What Gravity Forms wants to use as the tab index.
	 * @param RGFormsModel $form The form object.
	 *
	 * @see https://www.gravityhelp.com/documentation/article/gform_tabindex/
	 *
	 * @return bool False to disable tabindex completely.
	 */
	public static function filter_gform_tabindex( $tabindex, $form ) {
		return false;
	}

	/**
	 * Initialization function. Registers action and filter hooks.
	 *
	 * @access public
	 * @return void
	 */
	public static function init() {

		/* Register action hooks. */
		add_action( 'widgets_init', [ get_called_class(), 'action_widgets_init' ] );
		add_action( 'wp_enqueue_scripts', [ get_called_class(), 'action_wp_enqueue_scripts' ], 1000 );

		/* Register filter hooks. */
		add_filter( 'gform_confirmation', [ get_called_class(), 'filter_gform_confirmation' ], 10, 4 );
		add_filter( 'gform_tabindex', [ get_called_class(), 'filter_gform_tabindex' ], 10, 2 );
	}
}
