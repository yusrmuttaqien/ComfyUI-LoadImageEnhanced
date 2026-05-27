import { app } from "../../scripts/app.js";

app.registerExtension({
  name: "LoadImageEnhanced.FilenameSync",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeType.comfyClass !== "LoadImageEnhanced") {
      return;
    }

    const origOnCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      const result = origOnCreated?.apply(this, arguments);

      const imageWidget = this.widgets.find((w) => w.name === "image");
      const filenameWidget = this.widgets.find(
        (w) => w.name === "original_filename"
      );

      if (imageWidget && filenameWidget) {
        const origCallback = imageWidget.callback;
        imageWidget.callback = (value, ...args) => {
          if (value && typeof value === "string") {
            const newFilename = value.split(/[\/\\]/).pop();
            filenameWidget.value = newFilename;
          }
          return origCallback?.apply(this, args);
        };
      }

      return result;
    };
  },
});