(function () {
    function syncOriginalFilename(node) {
        var imageWidget = node.widgets && node.widgets.find(function (w) { return w.name === "image"; });
        var filenameWidget = node.widgets && node.widgets.find(function (w) { return w.name === "original_filename"; });

        if (!imageWidget || !filenameWidget) {
            return;
        }

        // Initialize original_filename from the current dropdown value
        if (!filenameWidget.value || filenameWidget.value === "") {
            filenameWidget.value = imageWidget.value.split("/").pop();
        }
    }

    app.registerExtension({
        name: "LoadImageEnhanced.FilenameSync",

        setup: function () {
            console.log("[LoadImageEnhanced] Filename sync extension loaded");
        },

        nodeCreated: function (node) {
            if (node.comfyClass === "LoadImageEnhanced") {
                setTimeout(function () {
                    syncOriginalFilename(node);
                }, 0);
            }
        },
    });
})();