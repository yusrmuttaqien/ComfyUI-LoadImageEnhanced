(function () {
    function addFilenameWidget(node) {
        if (node.comfyClass !== "LoadImageEnhanced") return;
        if (node.widgets && node.widgets.find((w) => w.name === "original_filename")) return;

        // Find the image dropdown widget
        const imageWidget = node.widgets?.find((w) => w.name === "image");

        function createWidget() {
            return node.addWidget("text", "original_filename", "", function (value) {
                node.widgets.find((w) => w.name === "original_filename").value = value;
            });
        }

        if (!imageWidget) {
            // No image widget yet — add at the bottom of existing widgets
            const w = createWidget();
            node.widgets.push(w);
            return;
        }

        // Insert right after the image dropdown
        const idx = node.widgets.indexOf(imageWidget);
        if (idx >= 0) {
            const w = createWidget();
            node.widgets.splice(idx + 1, 0, w);
        } else {
            const w = createWidget();
            node.widgets.push(w);
        }

        // Initialize with the current image's basename
        if (!w || !w.value || w.value === "") {
            w.value = imageWidget.value.split("/").pop();
        }

        // Watch for dropdown changes and update original_filename
        const origOnChanged = imageWidget.onChanged;
        imageWidget.onChanged = function () {
            if (origOnChanged) origOnChanged.call(this);
            const filenameWidget = node.widgets.find((w) => w.name === "original_filename");
            if (filenameWidget) {
                filenameWidget.value = this.value.split("/").pop();
            }
        };
    }

    app.registerExtension({
        name: "LoadImageEnhanced.FilenameSync",

        setup() {
            console.log("[LoadImageEnhanced] Filename sync extension loaded");
        },

        nodeCreated(node) {
            addFilenameWidget(node);
        },
    });
})();