jQuery(document).ready(function () {

    /* Establish event listener for clicks on the add media button. */
    jQuery('.widget').on('click', '.fingerpaint-widget-add-media', function () {
        var $this = jQuery(this);
        wp.media.editor.send.attachment = function (props, attachment) {
            $this.siblings('input[type="hidden"]').val(attachment.id);
            $this.closest('.widget-content').siblings().find('.widget-control-save').click();
        };
        wp.media.editor.open($this);
        return false;
    });

    /* Establish event listener for clicks on the remove media button. */
    jQuery('.widget').on('click', '.fingerpaint-widget-remove-media', function () {
        var $this = jQuery(this);
        $this.siblings('input[type="hidden"]').val('');
        $this.closest('.widget-content').siblings().find('.widget-control-save').click();
        return false;
    });
});