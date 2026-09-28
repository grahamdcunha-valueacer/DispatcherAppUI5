
sap.ui.define(["sap/ui/model/type/Currency"], function (Currency) {
    "use strict";

    var mColorMapping = {

        "FU_PLANNED": {
            stroke: "#99D101",
            strokeWidth: 2,
            fill: "#99D101",
            strokeDasharray: ""
        },

        "FU_UNPLANNED": {
            stroke: "#99D101",
            strokeWidth: 2,
            fill: "#fff",
            strokeDasharray: "3,3"
        },

        "FO_PLANNED": {
            stroke: "#99D101",
            strokeWidth: 0,
            fill: "#99D101",
            strokeDasharray: ""
        },

        "FO_UNPLANNED": {
            stroke: "#99D101",
            strokeWidth: 3,
            fill: "#fff",
            strokeDasharray: "3,3"
        },

        "DEFAULT": {
            stroke: "#000",
            strokeWidth: 2,
            fill: "#000",
            strokeDasharray: "5,1"
        }
    };

    function getMappingItem(sType, sPlanStatus) {

        var sKey = (sType && sPlanStatus)
            ? sType.toUpperCase() + "_" + sPlanStatus.toUpperCase()
            : "DEFAULT";

        return mColorMapping[sKey] || mColorMapping["DEFAULT"];
    }

    return {

        orderTitle: function (sRequirementId, sSource, sDestination) {
            return [
                sRequirementId
                // ":",
                // sSource,
                // "->",
                // sDestination
            ].join(" ");
        },

        strokeColor: function (sType, sPlanStatus) {
            return getMappingItem(sType, sPlanStatus).stroke;
        },

        strokeWidth: function (sType, sPlanStatus) {
            return getMappingItem(sType, sPlanStatus).strokeWidth;
        },

        strokeDasharray: function (sType, sPlanStatus) {
            return getMappingItem(sType, sPlanStatus).strokeDasharray;
        },

        fillColor: function (sType, sPlanStatus) {
            return getMappingItem(sType, sPlanStatus).fill;
        },

        statusIconColor: function (sPlanStatus) {
            return sPlanStatus &&
                sPlanStatus.toUpperCase() === "PLANNED"
                ? "Success"
                : "Normal";
        },

        /*
         * Converts API date:
         * 20260908173500
 
         * 2026-09-08T071635Z
         *
         * to JavaScript Date object.
         */
        dateToObject: function (sDate) {

            if (!sDate) {
                return null;
            }

            // Already a Date object
            if (sDate instanceof Date) {
                return sDate;
            }

            // API format:
            // 2026-09-08T071635Z
            var oMatch = String(sDate).match(
                /^(\d{4})-(\d{2})-(\d{2})T(\d{2})(\d{2})(\d{2})Z$/
            );

            if (oMatch) {

                return new Date(Date.UTC(
                    Number(oMatch[1]),
                    Number(oMatch[2]) - 1,
                    Number(oMatch[3]),
                    Number(oMatch[4]),
                    Number(oMatch[5]),
                    Number(oMatch[6])
                ));
            }

            // Handle standard ISO format:
            // 2026-09-08T07:16:35Z
            var oDate = new Date(sDate);


            if (!isNaN(oDate.getTime())) {
                return oDate;
            }

            console.error(
                "Invalid Gantt date:",
                sDate
            );

            return null;
        },
        dateToNewObject: function (sDate) {

            if (!sDate) {
                return null;
            }

            var sUTC = sap.ui.core.format.DateFormat
                .getDateTimeInstance({
                    pattern: "yyyyMMddHHmmss",
                    UTC: true
                })
                .format(sDate);

            var sIST = sap.ui.core.format.DateFormat
                .getDateTimeInstance({
                    pattern: "yyyyMMddHHmmss",
                    UTC: false
                })
                .format(sDate);

            sap.m.MessageToast.show("sUTC" + sUTC);
            sap.m.MessageToast.show("sIST" + sIST);

            var oMatch;

            switch (true) {

                // Format: 2026-09-22T044441Z
                case /^\d{4}-\d{2}-\d{2}T\d{6}Z$/.test(sDate):

                    oMatch = sDate.match(
                        /^(\d{4})-(\d{2})-(\d{2})T(\d{2})(\d{2})(\d{2})Z$/
                    );

                    return new Date(
                        Number(oMatch[1]),
                        Number(oMatch[2]) - 1,
                        Number(oMatch[3]),
                        Number(oMatch[4]),
                        Number(oMatch[5]),
                        Number(oMatch[6])
                    );

                // Format: 20260922044441
                case /^\d{14}$/.test(sDate):
                    oMatch = sDate.match(
                        /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/
                    );

                    return new Date(
                        Number(oMatch[1]),
                        Number(oMatch[2]) - 1,
                        Number(oMatch[3]),
                        Number(oMatch[4]),
                        Number(oMatch[5]),
                        Number(oMatch[6])
                    );

                default:
                    return null;
            }


        },
        dateToObjectByZone: function (sDateTime) {

            if (!sDateTime) {
                return null;
            }

            var sSettings = localStorage.getItem(
                "DispatcherZoneSettings"
            );

            var sZone = "UTC";

            if (sSettings) {
                sZone = JSON.parse(sSettings).zone;
            }

            var oDate = new Date(sDateTime);

            switch (sZone) {

                case "IST":
                    oDate = new Date(
                        oDate.getTime() + (5.5 * 60 * 60 * 1000)
                    );
                    break;

                case "EST":
                    oDate = new Date(
                        oDate.getTime() - (5 * 60 * 60 * 1000)
                    );
                    break;

                case "UTC":
                default:
                    break;
            }

            return oDate;
        },

        formatDate: function (oDate) {

            return oDate.getFullYear() +

                String(oDate.getMonth() + 1).padStart(2, "0") +

                String(oDate.getDate()).padStart(2, "0") +

                String(oDate.getHours()).padStart(2, "0") +

                String(oDate.getMinutes()).padStart(2, "0") +

                String(oDate.getSeconds()).padStart(2, "0");

        },
        getFOColor: function (sVehId, sDriverId) {

            sVehId = (sVehId || "").trim();
            sDriverId = (sDriverId || "").trim();

            if (sVehId && sDriverId) {
                return "#22C55E"; // Fully assigned
            }
            else if (sVehId) {
                return "#dba7a7"; // Vehicle assigned
            }
            else if (sDriverId) {
                return "#7cd8e4"; // Driver assigned
            }

            return "#cccccc"; // Unassigned
        }
    };
});

