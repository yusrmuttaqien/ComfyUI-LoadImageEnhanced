(function () {
    function syncOnImageChange(node) {
        // Set up onWidgetChanged to catch user-initiated value changes
        var original_onWidgetChanged = node.onWidgetChanged;
        node.onWidgetChanged = function (name, value) {
            if (original_onWidgetChanged) {
                original_onWidgetChanged.call(this, name, value);
            }

            if (name === "image") {
                var filenameWidget = this.widgets && this.widgets.find(function (w) { return w.name === "original_filename"; });
                if (filenameWidget) {
                    filenameWidget.value = value.split("/").pop();
                }
            }
        };

        // Initialize original_filename from the current dropdown value
        var imageWidget = node.widgets && node.widgets.find(function (w) { return w.name === "image"; });
        var filenameWidget = node.widgets && node.widgets.find(function (w) { return w.name === "original_filename"; });

        if (imageWidget && filenameWidget && (!filenameWidget.value || filenameWidget.value === "")) {
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
                    syncOnImageChange(node);
                }, 0);
            }
        },
    });
})();