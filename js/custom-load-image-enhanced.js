import { app } from "../../scripts/app.js";

app.registerExtension({
  name: "LoadImageEnhanced.FilenameSync",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    // Ensure this perfectly matches your Python class name in NODE_CLASS_MAPPINGS
    if (nodeData.name === "LoadImageEnhanced") {
      const onNodeCreated = nodeType.prototype.onNodeCreated;

      nodeType.prototype.onNodeCreated = function () {
        // Run original native setup
        if (onNodeCreated) {
          onNodeCreated.apply(this, arguments);
        }

        // Find the dropdown and the tracker widget
        const imageWidget = this.widgets.find((w) => w.name === "image");
        // Assuming Python side named it "original_filename" based on your agent's code
        const filenameWidget = this.widgets.find(
          (w) => w.name === "original_filename",
        );

        if (imageWidget && filenameWidget) {
          // 1. Hide the tracker widget so it doesn't clutter the UI
          filenameWidget.type = "hidden";
          filenameWidget.computeSize = () => [0, 0];

          // 2. Initialize it safely on creation
          if (!filenameWidget.value || filenameWidget.value === "") {
            if (
              typeof imageWidget.value === "string" &&
              !imageWidget.value.startsWith("clipspace/")
            ) {
              // Extract just the filename if desired, or keep the whole path
              filenameWidget.value = imageWidget.value.split("/").pop();
            }
          }

          // 3. Hijack the LiteGraph callback (NOT onChanged)
          const originalCallback = imageWidget.callback;
          imageWidget.callback = function (value, ...args) {
            // Always run the original callback so the image preview updates
            if (originalCallback) {
              originalCallback.apply(this, [value, ...args]);
            }

            // 4. The Magic Filter: Only update if it's NOT a MaskEditor clipspace file
            if (typeof value === "string" && !value.startsWith("clipspace/")) {
              filenameWidget.value = value.split("/").pop();
            }
          };
        }
      };
    }
  },
});
