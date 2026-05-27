import { app } from "../../scripts/app.js";

app.registerExtension({
  name: "LoadImageEnhanced.FilenameSync",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    // Only patch our specific node
    if (nodeType.comfyClass !== "LoadImageEnhanced") return;

    // Hijack nodeCreated on the prototype so it runs for every instance
    const onNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      const r = onNodeCreated?.apply(this, arguments);

      const node = this;
      const imageWidget    = node.widgets?.find(w => w.name === "image");
      const filenameWidget = node.widgets?.find(w => w.name === "original_filename");

      if (!imageWidget || !filenameWidget) {
        console.warn("[LoadImageEnhanced] Could not find required widgets.");
        return r;
      }

      // Hook widget.callback — this fires on user dropdown selection.
      // MaskEditor sets widget.value directly and bypasses this, so no
      // extra guard needed for that case.
      const origCallback = imageWidget.callback;
      imageWidget.callback = function (value, canvas, nodeParam, pos, event) {
        if (value && typeof value === "string") {
          filenameWidget.value = value.split(/[\/\\]/).pop();
          node.setDirtyCanvas(true, true);
        }
        return origCallback?.apply(this, arguments);
      };

      return r;
    };
  },
});