<?php

/**
 * Contains a widget base class for handling configurable widgets.
 *
 * PHP Version 5.5+
 *
 * @category Theme
 * @package  Fingerpaint_Theme_Extensions
 * @author   Fingerpaint Developers <devs@fingerpaintmarketing.com>
 * @license  GPLv3
 * @link     http://fingerpaintmarketing.com
 * @version  2.0.0
 */

namespace Fingerpaint;

/**
 * A widget base class for handling configurable widgets.
 *
 * @category Theme
 * @package  Fingerpaint_Theme_Extensions
 * @author   Fingerpaint Developers <devs@fingerpaintmarketing.com>
 * @license  GPLv3
 * @link     http://fingerpaintmarketing.com
 */
class Widget extends \WP_Widget {

	/**
	 * Fields listing. To be overriden by child class.
	 *
	 * @access protected
	 * @var array
	 */
	protected $fields = [ ];

	/**
	 * Constructor function. Registers the widget by calling the parent constructor.
	 *
	 * @param string $id The ID of the widget.
	 * @param string $name The name of the widget.
	 * @param string $description The description for the widget.
	 *
	 * @access public
	 * @return Widget
	 */
	public function __construct( $id, $name, $description ) {

		/* Run the parent constructor with information passed to this constructor from the child class. */
		parent::__construct( $id, $name, $description );

		/* Add action hooks. */
		add_action( 'admin_print_scripts', [ $this, 'action_admin_print_scripts' ] );
		add_action( 'admin_print_styles', [ $this, 'action_admin_print_styles' ] );
	}

	/**
	 * Function to retrieve form data values from the instance based on defined fields.
	 *
	 * @param array $instance The widget instance from WP.
	 *
	 * @access protected
	 * @return array
	 */
	protected function get_data( $instance ) {

		/* Loop through field data and compile a data array with keys and values. */
		$data = [ ];
		foreach ( $this->fields as $key => $field ) {

			/* Construct field data from instance data for each field. */
			$data[ $key ]['title']      = ucwords( str_replace( '-', ' ', $key ) ) . ':';
			$data[ $key ]['value']      = ( isset( $instance[ $key ] ) ) ? esc_attr( $instance[ $key ] ) : '';
			$data[ $key ]['field_id']   = $this->get_field_id( $key );
			$data[ $key ]['field_name'] = $this->get_field_name( $key );

			/* Sanitize field value. */
			switch ( $field['type'] ) {
				case 'select':
				case 'text':
					$data[ $key ]['value'] = esc_attr( $data[ $key ]['value'] );
					break;
				case 'textarea':
					$data[ $key ]['value'] = esc_textarea( $data[ $key ]['value'] );
					break;
				case 'url':
					$data[ $key ]['value'] = esc_url( $data[ $key ]['value'] );
					break;
			}
		}

		return $data;
	}

	/**
	 * A function to print a field on the edit form.
	 *
	 * @param string $key The key from the fields definition for this field.
	 * @param array $data The data array for this field.
	 *
	 * @access protected
	 * @return void
	 */
	protected function print_field( $key, $data ) {

		/* Switch to construct HTML for the field itself. */
		$field = '';
		switch ( $this->fields[ $key ]['type'] ) {
			case 'select':
				$options = [ ];
				foreach ( $this->fields[ $key ]['values'] as $value => $name ) {
					$option = '<option value="' . esc_attr( $value ) . '"';
					if ( $data['value'] === esc_attr( $value ) ) {
						$option .= ' selected="selected"';
					}
					$option .= '>' . esc_attr( $name ) . '</option>';
					$options[] = $option;
				}
				$options = implode( "\n", $options );
				$field   = <<<HTML
<select id="{$data['field_id']}" name="{$data['field_name']}">
    <option value="">-- Select --</option>
    {$options}
</select>
HTML;
				break;
			case 'text':
			case 'url':
				$field = <<<HTML
<input id="{$data['field_id']}" name="{$data['field_name']}" type="text" value="{$data['value']}" />
HTML;
				break;
			case 'textarea':
				$field = <<<HTML
<textarea id="{$data['field_id']}" name="{$data['field_name']}">{$data['value']}</textarea>
HTML;
				break;
			case 'checkbox':
				if ( ! empty( $this->fields[ $key ]['values'] ) && is_array( $this->fields[ $key ]['values'] ) ) {
					$values = unserialize( base64_decode( $data['value'] ) );
					foreach ( $this->fields[ $key ]['values'] as $value => $name ) {
						$checked = ( ! empty( $values ) && in_array( $value, $values ) ) ? 'checked="checked"' : '';
						$field .= <<<HTML
</label><br/><label><input id="{$data['field_id']}" value="{$value}" name="{$data['field_name']}[]" type="checkbox" {$checked} /> {$name}
HTML;
					}
				} else {
					$checked       = ( ! empty( $data['value'] ) ) ? 'checked="checked"' : '';
					$name          = substr( $data['title'], 0, - 1 );
					$data['title'] = <<<HTML
<input id="{$data['field_id']}" name="{$data['field_name']}" type="checkbox" {$checked} /> {$name}
HTML;
				}

				break;
			case 'file':
				$field = <<<HTML
<input id="{$data['field_id']}" name="{$data['field_name']}" type="hidden" value="{$data['value']}" />
HTML;
				if ( ! empty( $data['value'] ) ) {
					$media = wp_get_attachment_image( $data['value'] );
					$field .= <<<HTML
{$media}<br />
<a href="#" class="widget-base-remove-media">Remove media</a>
HTML;
				} else {
					$field .= <<<HTML
<input class="button widget-base-add-media" type="button" value="Add Media" />
HTML;
				}
		}

		/* Print the field. */
		echo <<<HTML
<p>
    <label for="{$data['field_id']}">{$data['title']}</label><br/>
    {$field}
</p>
HTML;
	}

	/**
	 * Action hook function to enqueue admin scripts used by this widget.
	 *
	 * @see https://developer.wordpress.org/reference/hooks/admin_print_scripts
	 *
	 * @access public
	 * @return void
	 */
	public function action_admin_print_scripts() {
		wp_enqueue_media();
		wp_enqueue_script( 'widget-base', get_template_directory_uri() . '/assets/js/widget_base.js' );
	}

	/**
	 * Action hook function to enqueue admin styles used by this widget.
	 *
	 * @see https://developer.wordpress.org/reference/hooks/admin_print_styles/
	 *
	 * @access public
	 * @return void
	 */
	public function action_admin_print_styles() {
		wp_enqueue_style( 'thickbox' );
	}

	/**
	 * A function to print the edit form on the back-end.
	 *
	 * @param array $instance The instance variables, as reported by WP.
	 *
	 * @access public
	 * @return void
	 */
	public function form( $instance ) {

		/* Loop through data for this instance and print each field according to the settings. */
		$data = $this->get_data( $instance );
		foreach ( $data as $key => $field ) {
			$this->print_field( $key, $field );
		}
	}

	/**
	 * A function to process and sanitize inputs on save.
	 *
	 * @param array $new_instance The new save data.
	 * @param array $old_instance The old save data.
	 *
	 * @access public
	 * @return array  The modified instance data.
	 */
	public function update( $new_instance, $old_instance ) {

		/* Loop through each field, sanitize, and save values. */
		$instance = [ ];
		foreach ( $this->fields as $key => $field ) {
			if ( is_array( $new_instance[ $key ] ) ) {
				$values = [ ];
				foreach ( $new_instance[ $key ] as $value ) {
					$values[] = strip_tags( $value );
				}
				$instance[ $key ] = base64_encode( serialize( $values ) );
			} else {
				$instance[ $key ] = strip_tags( $new_instance[ $key ] );
			}
		}

		return $instance;
	}
}
