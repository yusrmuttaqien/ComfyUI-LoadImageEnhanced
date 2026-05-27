(function () {
  app.registerExtension({
    name: "LoadImageEnhanced.FilenameSync",

    setup: function () {
      console.log("[LoadImageEnhanced] Filename sync extension loaded.");
    },

    nodeCreated: function (node) {
      // Only apply to your specific custom node
      if (!node || node.comfyClass !== "LoadImageEnhanced") {
        return;
      }

      // A tiny delay ensures ComfyUI has finished building the Python-defined widgets
      setTimeout(function () {
        var imageWidget =
          node.widgets &&
          node.widgets.find(function (w) {
            return w.name === "image";
          });
        var filenameWidget =
          node.widgets &&
          node.widgets.find(function (w) {
            return w.name === "original_filename";
          });

        if (!imageWidget || !filenameWidget) {
          console.warn(
            "[LoadImageEnhanced] Could not find 'image' or 'original_filename' widgets.",
          );
          return;
        }

        // 1. Save the original callback so we don't break ComfyUI's image preview logic
        var origCallback = imageWidget.callback;

        // 2. Override the callback to intercept USER actions
        imageWidget.callback = function (
          value,
          canvas,
          node_param,
          pos,
          event,
        ) {
          // If a valid string is selected/uploaded, update the filename widget
          if (value && typeof value === "string") {
            // Regex split handles both Windows (\) and Unix (/) path separators
            var newFilename = value.split(/[\/\\]/).pop();
            filenameWidget.value = newFilename;
          }

          // 3. Always fire the original callback so ComfyUI functions normally
          if (origCallback) {
            return origCallback.apply(this, arguments);
          }
        };
      }, 10);
    },
  });
})();
