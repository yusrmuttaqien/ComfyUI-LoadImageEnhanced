// ComfyUI Extension: LoadImageEnhanced - Original Filename Widget Sync
// Place this file in your ComfyUI web/extensions/ directory
// e.g., custom_nodes/ComfyUI-LoadImageWithFilename/custom-load-image-enhanced.js

(function () {
    function syncOriginalFilename(node) {
        const imageWidget = node.widgets?.find((w) => w.name === "image");
        const filenameWidget = node.widgets?.find((w) => w.name === "original_filename");

        if (!imageWidget || !filenameWidget) {
            return;
        }

        // Initialize original_filename from the current dropdown value on first load
        if (!filenameWidget.value || filenameWidget.value === "") {
            const initialFilename = imageWidget.value.split("/").pop();
            filenameWidget.value = initialFilename;
        }

        // Track the last user-selected value so we can detect programmatic changes
        let lastUserSelectedImage = imageWidget.value;

        // Override the image widget's change handler
        const originalOnChanged = imageWidget.onChanged;

        imageWidget.onChanged = function () {
            if (originalOnChanged) {
                originalOnChanged.call(this);
            }

            const currentValue = imageWidget.value;

            // Only update when the user actually changed it, not programmatic updates
            if (currentValue !== lastUserSelectedImage) {
                filenameWidget.value = currentValue.split("/").pop();
                lastUserSelectedImage = currentValue;
            }
        };
    }

    app.registerExtension({
        name: "LoadImageEnhanced.FilenameSync",

        setup() {
            console.log("[LoadImageEnhanced] Filename sync extension loaded");
        },

        nodeCreated(node) {
            const comfyClass = node.comfyClass;
            if (comfyClass === "LoadImageEnhanced") {
                syncOriginalFilename(node);
            }
        },

        beforeRegisterNodeDef(nodeType, nodeData) {
            // Also catch nodes that might be registered after extension loads
            if (nodeData?.name === "LoadImageEnhanced") {
                const origOnCreated = nodeType.prototype.onExecuted;
                nodeType.prototype.onExecuted = function () {
                    if (origOnCreated) {
                        origOnCreated.call(this);
                    }
                    // Sync after execution (in case widget values were reset)
                    syncOriginalFilename(this);
                };
            }
        },
    });
})();