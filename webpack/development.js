import merge from "webpack-merge"
import environment from "./environment"

module.exports = merge(environment, {
    devtool: "inline-source-map",
    devServer: {
        before: function(app, server, compiler) {
            //use this part to simulate http response
            app.get("/command", function(req, res) {
                var url = req.originalUrl
                if (url.indexOf("ESP800") != -1) {
                    res.json({
                        FWVersion: "3.0.0.a27",
                        FWTarget: "???",
                        SDConnection: "None",
                        Authentication: "Disabled",
                        WebCommunication: "Synchronous",
                        WebSocketIP: "192.168.1.43",
                        WebSocketport: "81",
                        Hostname: "esp3d",
                        WiFiMode: "STA",
                        WebUpdate: "Enabled",
                        Filesystem: "SPIFFS",
                        Time: "None",
                    })
                } else {
                    res.json({ custom: "unknown query" })
                }
            })
            app.get("/camera", function(req, res) {
                //res.send("You should not be there");
                res.redirect("/")
            })
            app.get("/login", function(req, res) {
                res.redirect("/")
            })
            app.get("/settings", function(req, res) {
                res.redirect("/")
            })
        },
    },
})
