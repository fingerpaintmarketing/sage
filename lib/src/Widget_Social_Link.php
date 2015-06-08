<?php

/**
 * Contains a widget class for implementing a social link.
 *
 * PHP Version 5.5+
 *
 * @category Themes
 * @package  Fingerpaint_Theme_Extensions
 * @author   Fingerpaint Developers <devs@fingerpaintmarketing.com>
 * @license  GPLv3
 * @link     http://fingerpaintmarketing.com
 * @version  2.0.0
 */

namespace Fingerpaint;

/**
 * A widget class for implementing a social link.
 *
 * @category Themes
 * @package  Fingerpaint_Theme_Extensions
 * @author   Fingerpaint Developers <devs@fingerpaintmarketing.com>
 * @license  GPLv3
 * @link     http://fingerpaintmarketing.com
 */
class Widget_Social_Link extends Widget {

	/**
	 * Constructor function. Defines the fields in use by this widget.
	 *
	 * @access public
	 * @return Widget_Social_Link
	 */
	public function __construct() {
		parent::__construct(
			'social_link',
			'Social Media Link',
			'Adds a list item containing a linked social icon.'
		);

		$this->fields = [
			'title' => [
				'type' => 'text',
			],
			'icon'  => [
				'type'   => 'select',
				'values' => [
					'fa-behance'            => 'Behance',
					'fa-behance-square'     => 'Behance (square)',
					'fa-bitbucket'          => 'BitBucket',
					'fa-bitbucket-square'   => 'BitBucket (square)',
					'fa-codepen'            => 'CodePen',
					'fa-delicious'          => 'Delicious',
					'fa-deviantart'         => 'DeviantArt',
					'fa-digg'               => 'Digg',
					'fa-dribble'            => 'Dribble',
					'fa-dropbox'            => 'Dropbox',
					'fa-facebook'           => 'Facebook',
					'fa-facebook-official'  => 'Facebook (official)',
					'fa-facebook-square'    => 'Facebook (square)',
					'fa-flickr'             => 'Flickr',
					'fa-foursquare'         => 'FourSquare',
					'fa-git'                => 'Git',
					'fa-git-square'         => 'Git (square)',
					'fa-github'             => 'GitHub',
					'fa-github-alt'         => 'GitHub (alt)',
					'fa-github-square'      => 'GitHub (square)',
					'fa-gittip'             => 'GitTip',
					'fa-google-plus'        => 'Google+',
					'fa-google-plus-square' => 'Google+ (square)',
					'fa-instagram'          => 'Instagram',
					'fa-jsfiddle'           => 'JSFiddle',
					'fa-linkedin'           => 'LinkedIn',
					'fa-linkedin-square'    => 'LinkedIn (square)',
					'fa-medium'             => 'Medium',
					'fa-pinterest'          => 'Pinterest',
					'fa-pinterest-p'        => 'Pinterest (P)',
					'fa-pinterest-square'   => 'Pinterest (square)',
					'fa-slideshare'         => 'SlideShare',
					'fa-stumbleupon'        => 'StumbleUpon',
					'fa-stumbleupon-circle' => 'StumbleUpon (circle)',
					'fa-tumblr'             => 'Tumblr',
					'fa-tumblr-square'      => 'Tumblr (square)',
					'fa-twitter'            => 'Twitter',
					'fa-twitter-square'     => 'Twitter (square)',
					'fa-vimeo-square'       => 'Vimeo',
					'fa-vine'               => 'Vine',
					'fa-weibo'              => 'Weibo',
					'fa-weixin'             => 'Weixin (WeChat)',
					'fa-whatsapp'           => 'WhatsApp',
					'fa-wordpress'          => 'WordPress',
					'fa-xing'               => 'Xing',
					'fa-xing-square'        => 'Xing (square)',
					'fa-yelp'               => 'Yelp',
					'fa-youtube'            => 'YouTube',
					'fa-youtube-play'       => 'YouTube (play)',
					'fa-youtube-square'     => 'YouTube (square)',
				],
			],
			'url'   => [
				'type' => 'url',
			],
		];
	}

	/**
	 * A function to display the widget contents on the front-end.
	 *
	 * @param array $args The widget area arguments.
	 * @param array $instance Data on this instance as reported by WP.
	 *
	 * @access public
	 * @return void
	 */
	public function widget( $args, $instance ) {
		if ( ! empty( $instance['icon'] ) && ! empty( $instance['url'] ) ) {

			/* Negotiate icon. */
			$icon = '<i class="fa ' . esc_attr( $instance['icon'] ) . '"></i>';

			/* Sanitize URL. */
			$url = esc_url( $instance['url'] );

			/* Print widget contents. */
			echo <<<HTML
{$args['before_widget']}
	<a href="{$url}" target="_blank" rel="me">{$icon}</a>
{$args['after_widget']}

HTML;
		}
	}
}
