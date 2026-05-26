(function () {
    function syncOriginalFilename(node) {
        // Try to find widgets via node.widgets first (legacy approach)
        var imageWidget = node.widgets && node.widgets.find(function (w) { return w.name === "image"; });
        var filenameWidget = node.widgets && node.widgets.find(function (w) { return w.name === "original_filename"; });

        if (!imageWidget || !filenameWidget) {
            // Fallback: try to find via _domWidgets or _inputs
            var domWidgets = node._domWidgets || [];
            for (var i = 0; i < domWidgets.length; i++) {
                if (domWidgets[i].name === "image") imageWidget = domWidgets[i];
                if (domWidgets[i].name === "original_filename") filenameWidget = domWidgets[i];
            }
        }

        if (!imageWidget || !filenameWidget) return;

        // Get the current value from the widget
        var imgVal = imageWidget.value;
        if (!imgVal) return;

        var newFilename = imgVal.split("/").pop();
        filenameWidget.value = newFilename;
    }

    function syncAllLoadImageEnhanced() {
        // Use app.canvas.selected_nodes or iterate over all nodes
        var nodes = [];
        if (app.graph && app.graph._nodes) {
            nodes = app.graph._nodes;
        } else if (app.canvas && app.canvas.selected_nodes) {
            // Try canvas-based node iteration
            nodes = Object.values(app.canvas.selected_nodes || {});
        }

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] && nodes[i].comfyClass === "LoadImageEnhanced") {
                syncOriginalFilename(nodes[i]);
            }
        }
    }

    app.registerExtension({
        name: "LoadImageEnhanced.FilenameSync",

        setup: function () {
            console.log("[LoadImageEnhanced] Filename sync extension loaded");
            console.log("[LoadImageEnhanced] app.graph:", !!app.graph);
            console.log("[LoadImageEnhanced] app.canvas:", !!app.canvas);
            console.log("[LoadImageEnhanced] app.graph._nodes:", app.graph && app.graph._nodes ? app.graph._nodes.length : "N/A");

            // Hook into the graph's change event — fires when anything in the graph changes
            var origGraphChange = app.graph && app.graph.change;
            if (app.graph) {
                app.graph.change = function () {
                    if (origGraphChange) origGraphChange.apply(this, arguments);
                    syncAllLoadImageEnhanced();
                };
            }

            // Hook into LiteGraph canvas events for mouse interactions
            if (app.canvas) {
                var origOnMouseUp = app.canvas.onMouseUp;
                app.canvas.onMouseUp = function (e) {
                    if (origOnMouseUp) origOnMouseUp.call(this, e);
                    syncAllLoadImageEnhanced();
                };

                var origOnMouseDown = app.canvas.onMouseDown;
                app.canvas.onMouseDown = function (e) {
                    if (origOnMouseDown) origOnMouseDown.call(this, e);
                };
            }

            // DOM-level: observe the body for any DOM changes as a fallback
            var domObserver = new MutationObserver(function () {
                syncAllLoadImageEnhanced();
            });

            setTimeout(function () {
                domObserver.observe(document.body, { childList: true, subtree: true });
            }, 1000);
        },

        nodeCreated: function (node) {
            if (!node || node.comfyClass !== "LoadImageEnhanced") {
                return;
            }

            // Wait for widgets to be fully initialized
            setTimeout(function () {
                syncOriginalFilename(node);

                var imageWidget = node.widgets && node.widgets.find(function (w) { return w.name === "image"; });
                if (!imageWidget) {
                    console.log("[LoadImageEnhanced] No image widget found on node", node.id);
                    return;
                }

                // Polling as a reliable fallback — check widget values every 300ms.
                var lastValue = imageWidget.value;

                function checkAndSync() {
                    var currentVal = imageWidget.value;
                    if (currentVal !== lastValue) {
                        console.log("[LoadImageEnhanced] Image changed:", lastValue, "->", currentVal);
                        lastValue = currentVal;
                        syncOriginalFilename(node);
                    }
                    setTimeout(checkAndSync, 300);
                }

                setTimeout(checkAndSync, 300);
            }, 200);
        },
    });
})();