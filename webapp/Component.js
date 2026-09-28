sap.ui.define([
    "sap/ui/core/UIComponent",
    "./model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/resource/ResourceModel",
    "./service/FreightOrderService",
    "./service/DriverService",
    "./service/VehicleService",
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/MetadataHelper"
], (UIComponent, models, JSONModel, ODataModel, ResourceModel, FreightOrderService, DriverService, VehicleService, Engine, SelectionController, MetadataHelper) => {
    "use strict";

    return UIComponent.extend("dispatcherns.dispatcherproj.Component", {
        metadata: {
            rootView: {
                "id": "RootView",
                "viewName": "dispatcherns.dispatcherproj.App",
                "type": "XML",
                "async": true
            },
            manifest: "json",
            interfaces: []
            // Commented Because - it will not work when we deployed to the BTP cloud  
            //"sap.ui.core.IAsyncContentCreation"

        },

        init() {
            // call the base component's init function       

            UIComponent.prototype.init.apply(this, arguments);


            const oDataModel = new sap.ui.model.json.JSONModel({
                Requirements: [],
                Drivers: [],
                Resources: [],
                ui: {
                    expandFO: true,
                    expandDrivers: true,
                    expandVehicles: true
                }
            });

            this.setModel(oDataModel, "data");
            this.loadMasterData();
            this.setModel(
                new ResourceModel({
                    bundleName: "dispatcherns.dispatcherproj.i18n.i18n"
                }), "i18n"
            );


            var oCalJSONModel = new JSONModel();
            oCalJSONModel.loadData(sap.ui.require.toUrl("dispatcherns/dispatcherproj/localService/mockdata/Calendars.json"));
            this.setModel(oCalJSONModel, "calc");

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        },
        exit: function () {
            //this._oMockServer.stop();
            //this._oMockServer.destroy();
        },

        async loadMasterData(oFromDate, oToDate, oDc) {
            try {

                var sFromDate =
                    oFromDate.getFullYear() + "-" +
                    String(oFromDate.getMonth() + 1).padStart(2, "0") + "-" +
                    String(oFromDate.getDate()).padStart(2, "0");

                var sToDate =
                    oToDate.getFullYear() + "-" +
                    String(oToDate.getMonth() + 1).padStart(2, "0") + "-" +
                    String(oToDate.getDate()).padStart(2, "0");

                const sStartTime = sFromDate + "T00:00:00Z";
                const sEndTime = sToDate + "T23:59:59Z";
                const sDC = oDc;

                // const [
                //     _requirements,
                //     _resources,
                //     _drivers,
                // ] = await Promise.allSettled([

                //     FreightOrderService.GetBulkfo({
                //         p_start_time: sStartTime,
                //         p_end_time: sEndTime,
                //         p_dc: sDC
                //     }),
                //     VehicleService.GetRes({
                //         p_start_time: sStartTime,
                //         p_end_time: sEndTime,
                //         p_dc: sDC
                //     }),
                //     DriverService.GetDrv({
                //         p_start_time: sStartTime,
                //         p_end_time: sEndTime,
                //         p_dc: sDC
                //     }),

                // ]);

                const results = await Promise.allSettled([
                    FreightOrderService.GetBulkfo({
                        p_start_time: sStartTime,
                        p_end_time: sEndTime,
                        p_dc: sDC
                    }),
                    VehicleService.GetRes({
                        p_start_time: sStartTime,
                        p_end_time: sEndTime,
                        p_dc: sDC
                    }),
                    DriverService.GetDrv({
                        p_start_time: sStartTime,
                        p_end_time: sEndTime,
                        p_dc: sDC
                    })
                ]);

                const [_fo, _veh, _drv] = results;

                if (_fo.status === "rejected") {
                    console.error("FO Service Failed:", _fo.reason);
                }

                if (_veh.status === "rejected") {
                    console.error("Vehicle Service Failed:", _veh.reason);
                }

                if (_drv.status === "rejected") {
                    console.error("Driver Service Failed:", _drv.reason);
                }

                const _requirements = _fo.status === "fulfilled" ? _fo.value : [];
                const _resources = _veh.status === "fulfilled" ? _veh.value : [];
                const _drivers = _drv.status === "fulfilled" ? _drv.value : [];

                var aShapes = [];
                var aRestBreakShapes = [];


                var aResources = Array.isArray(_resources) ? _resources : (_resources?.value || []);

                aResources.forEach(function (oResource) {
                    oResource.AvailabilityShapes = [];
                    (oResource.availability || []).forEach(function (oAvail, i) {
                        oResource.AvailabilityShapes.push({
                            resourceId: oResource.resourceId,
                            StartTime: new Date(oAvail.startTime).toISOString().replace(".000", ""),
                            EndTime: new Date(oAvail.endTime).toISOString().replace(".000", ""),
                            description: oResource.description
                        })
                    });

                });

                var aRequirements = Array.isArray(_requirements) ? _requirements : (_requirements?.value || []);
                aResources.forEach(function (oTruck) {
                    oTruck.FOShapes = aRequirements
                        .filter(function (oFO) {
                            return oFO.Veh_id === oTruck.resourceId;
                        })
                        .map(function (oFO) {
                            return {
                                shapeId: oFO.id,
                                Title: oFO.id,
                                StartTime: oFO.Departure_Time,
                                EndTime: oFO.Arrival_Time,
                                restType: oTruck.restType,
                                rest_startTime: oTruck.rest_startTime,
                                rest_endTime: oTruck.rest_endTime,
                                Title: oTruck.restType
                            };
                        });

                });

                aRequirements.forEach(function (oRequirement) {
                    (oRequirement.restBreaks || []).forEach(function (oBreak) {
                        aRestBreakShapes.push({
                            RequirementId: oRequirement.id,
                            VehicleId: oRequirement.Veh_id,
                            DriverId: oRequirement.driver_id,
                            restType: oBreak.restType,
                            rest_startTime: oBreak.rest_startTime,
                            rest_endTime: oBreak.rest_endTime,
                            Title: oBreak.restType
                        });
                    });

                });

                this.setModel(
                    new JSONModel({
                        Requirements: _requirements?.value || [],
                        Drivers: _drivers,
                        Resources: aResources,
                        AvailabilityShapes: aShapes,
                        RestBreakShapes: aRestBreakShapes
                    }),
                    "data"
                );

            } catch (error) {
                sap.m.MessageBox.show(
                    "Unable to load data: " +
                    (error.message || error.toString())
                );
            }
        },

        GetResbreaks: function () {
            aRequirements.forEach(function (oFO) {
                var aRestBreaks = Array.isArray(oFO.restBreaks)
                    ? oFO.restBreaks
                    : [];

                oFO.RestBreakShapes = aRestBreaks
                    .filter(function (oBreak) {
                        return oBreak &&
                            oBreak.rest_startTime &&
                            oBreak.rest_endTime;
                    })
                    .map(function (oBreak, iIndex) {
                        var sType = String(
                            oBreak.restType || "BREAK"
                        ).toUpperCase();

                        return {
                            shapeId: [
                                oFO.id || oFO.transportationOrderUUID || "FO",
                                sType,
                                iIndex
                            ].join("-"),

                            RequirementId: oFO.id,
                            Type: sType,
                            Title: sType,
                            StartTime: oBreak.rest_startTime,
                            EndTime: oBreak.rest_endTime,

                            Tooltip:
                                sType +
                                ": " +
                                oBreak.rest_startTime +
                                " - " +
                                oBreak.rest_endTime
                        };
                    });
            });
        }



    });
});