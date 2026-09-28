sap.ui.define([
    "./ApiService"
], function (ApiService) {

    "use strict";

    return {
        

        GetFOSimilution(oPayload) {

            const query = new URLSearchParams({
                IvTorKey: oPayload.IvTorKey,
                IvNewDepartureDatetime: oPayload.IvNewDepartureDatetime
            }).toString();

            return ApiService.get(`/GetFOSimilution?${query}`);
        },

        GetBulkfo: function (oPayload) {

            const query = new URLSearchParams({
                        p_start_time: oPayload.p_start_time,
                        p_end_time: oPayload.p_end_time,
                        p_dc: oPayload.p_dc
            }).toString();

            return ApiService.get(
                `/GetBulkfo?${query}`
            );
        },
        SaveFO: function (oPayload) {
            return ApiService.post("/SaveFOSAP", oPayload);
        }

    };
});