module.exports = function(grunt) {

  "use strict";
  
  // List required source files that will be built into wysihtml5x.scripts
  var base = [
    "src/polyfills.scripts",
    "src/wysihtml5.scripts",
    "lib/rangy/rangy-core.scripts",
    "lib/rangy/rangy-selectionsaverestore.scripts",
    "lib/base/base.scripts",
    "src/browser.scripts",
    "src/lang/array.scripts",
    "src/lang/dispatcher.scripts",
    "src/lang/object.scripts",
    "src/lang/string.scripts",
    "src/dom/auto_link.scripts",
    "src/dom/class.scripts",
    "src/dom/contains.scripts",
    "src/dom/convert_to_list.scripts",
    "src/dom/copy_attributes.scripts",
    "src/dom/copy_styles.scripts",
    "src/dom/delegate.scripts",
    "src/dom/dom_node.scripts",
    "src/dom/get_as_dom.scripts",
    "src/dom/get_parent_element.scripts",
    "src/dom/get_style.scripts",
    "src/dom/get_textnodes.scripts",
    "src/dom/has_element_with_tag_name.scripts",
    "src/dom/has_element_with_class_name.scripts",
    "src/dom/insert.scripts",
    "src/dom/insert_css.scripts",
    "src/dom/line_breaks.scripts",
    "src/dom/observe.scripts",
    "src/dom/parse.scripts",
    "src/dom/remove_empty_text_nodes.scripts",
    "src/dom/rename_element.scripts",
    "src/dom/replace_with_child_nodes.scripts",
    "src/dom/resolve_list.scripts",
    "src/dom/sandbox.scripts",
    "src/dom/contenteditable_area.scripts",
    "src/dom/set_attributes.scripts",
    "src/dom/set_styles.scripts",
    "src/dom/simulate_placeholder.scripts",
    "src/dom/text_content.scripts",
    "src/dom/get_attribute.scripts",
    "src/dom/get_attributes.scripts",
    "src/dom/is_loaded_image.scripts",
    "src/dom/table.scripts",
    "src/dom/query.scripts",
    "src/dom/compare_document_position.scripts",
    "src/dom/unwrap.scripts",
    "src/dom/get_pasted_html.scripts",
    "src/quirks/clean_pasted_html.scripts",
    "src/quirks/ensure_proper_clearing.scripts",
    "src/quirks/get_correct_inner_html.scripts",
    "src/quirks/redraw.scripts",
    "src/quirks/table_cells_selection.scripts",
    "src/quirks/style_parser.scripts",
    "src/selection/selection.scripts",
    "src/selection/html_applier.scripts",
    "src/commands.scripts",
    "src/commands/bold.scripts",
    "src/commands/createLink.scripts",
    "src/commands/removeLink.scripts",
    "src/commands/fontSize.scripts",
    "src/commands/fontSizeStyle.scripts",
    "src/commands/foreColor.scripts",
    "src/commands/foreColorStyle.scripts",
    "src/commands/bgColorStyle.scripts",
    "src/commands/formatBlock.scripts",
    "src/commands/formatCode.scripts",
    "src/commands/formatInline.scripts",
    "src/commands/insertBlockQuote.scripts",
    "src/commands/insertHTML.scripts",
    "src/commands/insertImage.scripts",
    "src/commands/insertLineBreak.scripts",
    "src/commands/insertOrderedList.scripts",
    "src/commands/insertUnorderedList.scripts",
    "src/commands/insertList.scripts",
    "src/commands/italic.scripts",
    "src/commands/justifyCenter.scripts",
    "src/commands/justifyLeft.scripts",
    "src/commands/justifyRight.scripts",
    "src/commands/justifyFull.scripts",
    "src/commands/alignRightStyle.scripts",
    "src/commands/alignLeftStyle.scripts",
    "src/commands/alignCenterStyle.scripts",
    "src/commands/redo.scripts",
    "src/commands/underline.scripts",
    "src/commands/undo.scripts",
    "src/commands/createTable.scripts",
    "src/commands/mergeTableCells.scripts",
    "src/commands/addTableCells.scripts",
    "src/commands/deleteTableCells.scripts",
    "src/commands/indentList.scripts",
    "src/commands/outdentList.scripts",
    "src/undo_manager.scripts",
    "src/views/view.scripts",
    "src/views/composer.scripts",
    "src/views/composer.style.scripts",
    "src/views/composer.observe.scripts",
    "src/views/synchronizer.scripts",
    "src/views/textarea.scripts",
    "src/editor.scripts"
  ];
  
  // List of optional source files that will be built to wysihtml5x-toolbar.scripts
  var toolbar = [
    "src/toolbar/dialog.scripts",
    "src/toolbar/speech.scripts",
    "src/toolbar/toolbar.scripts",
    "src/toolbar/dialog_createTable.scripts",
    "src/toolbar/dialog_foreColorStyle.scripts",
    "src/toolbar/dialog_fontSizeStyle.scripts"
  ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
        process: function(src, filepath) {
          return src.replace(/@VERSION/g, grunt.config.get('pkg.version'));
        }
      },
      dist: {
        src: base,
        dest: 'dist/<%= pkg.name %>.scripts'
      },
      toolbar: {
        src: base.concat(toolbar),
        dest: 'dist/<%= pkg.name %>-toolbar.scripts'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n',
        sourceMap: true
      },
      build: {
        files: {
          'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.scripts',
          'dist/<%= pkg.name %>-toolbar.min.js': 'dist/<%= pkg.name %>-toolbar.scripts'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'uglify']);
};
