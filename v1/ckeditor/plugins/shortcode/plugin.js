CKEDITOR.plugins.add('shortcode', {
    requires: ['richcombo'], 
    init: function (editor) {

        let config = editor.config;

        function buildList(thiz, list) {

            for (var i in list) {
                thiz.add(list[i].value, list[i].name);
            }
        }

        if (config.shortcode.value.length !== 0) {

            const title = (config.shortcode.name) ? config.shortcode.name : 'Shortcode';

            editor.ui.addRichCombo('sc', {

                label: title,
                title: title,
                toolbar: 'insert,100',

                panel: {
                    css: [CKEDITOR.skin.getPath('editor')].concat(config.contentsCss),
                    multiSelect: false,
                    attributes: { 'aria-label': title }
                },

                init: function () {
                    buildList(this, config.shortcode.value);
                },

                onClick: function (value) {
                    var sel = editor.getSelection();
                    var range = sel.getRanges()[0];

                    // no range, means the editor is empty. Select the range.
                    if (!range) {
                        range = editor.createRange();
                        range.selectNodeContents(editor.editable());
                        sel.selectRanges([range]);
                    }

                    editor.focus();
                    editor.fire('saveSnapshot');

                    editor.insertHtml(value);
                    editor.fire('saveSnapshot');
                }
            });
        }
    }
});