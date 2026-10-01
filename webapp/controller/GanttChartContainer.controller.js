sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/gantt/misc/Utility",
	"sap/ui/core/Fragment",
	"../service/FreightOrderService",
	"sap/m/p13n/Engine",
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/MetadataHelper"
], function (Controller, JSONModel, formatter, Utility, Fragment, FreightOrderService, Engine, SelectionController, MetadataHelper) {
	"use strict";


	return Controller.extend("dispatcherns.dispatcherproj.controller.GanttChartContainer", {

		formatter: formatter,

		onInit: function () {

			var m = this.getOwnerComponent().getModel("data");
			if (!m) return;

			this._initP13n();

			var oToday = new Date();
			// var oFirstDay = new Date(
			// 	oToday.getFullYear(),
			// 	oToday.getMonth(),
			// 	1
			// );

			// const response = await fetch(
			// 		"http://localhost:3000/api/GetData",{
			// 			method: "GET",
			// 			headers: {
			// 				"Content-Type": "application/json"
			// 			},
			// 			  const _requirements = _fo.status === "fulfilled" ? _fo.value : [];
			//   			  const _resources = _veh.status === "fulfilled" ? _veh.value : [];
			//     		 const _drivers = _drv.status === "fulfilled" ? _drv.value : [];

			// 		});


			var oFromDate = new Date(oToday);
			oFromDate.setDate(oFromDate.getDate() - 2);

			var oToDate = new Date(oToday);
			oToDate.setDate(oToDate.getDate() + 2);

			var oFromDate = this._getDateInZone(-2);
			var oToDate = this._getDateInZone(3);


			var sSettings =
				localStorage.getItem("DispatcherZoneSettings");

			if (sSettings) {
				this._applyZoneSettings(
					JSON.parse(sSettings)
				);
			}

			//console.log(oDataModel.getProperty("/Requirements"));
			// var aDeferredGroups = oDataModel.getDeferredGroups();
			// aDeferredGroups = aDeferredGroups.concat(["deferred"]);
			// oDataModel.setDeferredGroups(aDeferredGroups);

			this._updateHorizon(oFromDate, oToDate);
			this.onLoadData();
			this.iNewFOCount = 0;
			/********************************************************************************************* */
			var oGantt1 = this.getView().byId("FreightOrder");

			var oMaximizeButton1 = new sap.m.Button({
				icon: "sap-icon://resize",
				type: "Transparent",
				press: function () {
					this.onMaximize(oGantt1, false, oMaximizeButton1);
					//this.onToggleFullScreen(oGantt1, false, oFullScreenButton1);
				}.bind(this)
			});
			var oFullScreenFOButton = new sap.m.Button({
				icon: "sap-icon://full-screen",
				type: "Transparent",
				press: function () {
					this.onToggleFullScreen(oGantt1, false, oFullScreenFOButton);
				}.bind(this)
			});
			oGantt1.addEventDelegate({
				onAfterRendering: function () {
					var oGanttOverflowToolbar = oGantt1.getChartOverflowToolbar();
					if (oGanttOverflowToolbar) {
						oGanttOverflowToolbar.addContent(oMaximizeButton1);
						oGanttOverflowToolbar.addContent(oFullScreenFOButton);
					}
					//oGantt1.setShowBirdEye(true);
				}
			});

			/********************************************************************************************* */
			var oGantt2 = this.getView().byId("Truck");

			var oMaximizeButton2 = new sap.m.Button({
				icon: "sap-icon://resize",
				type: "Transparent",
				press: function () {
					this.onMaximize(oGantt1, false, oMaximizeButton2);
				}.bind(this)
			});
			var oFullScreenTruck = new sap.m.Button({
				icon: "sap-icon://full-screen",
				type: "Transparent",
				press: function () {
					this.onToggleFullScreen(oGantt2, true, oFullScreenTruck);
				}.bind(this)
			});
			oGantt2.addEventDelegate({
				onAfterRendering: function () {
					var oGanttOverflowToolbar = oGantt2.getChartOverflowToolbar();
					if (oGanttOverflowToolbar) {
						oGanttOverflowToolbar.addContent(oMaximizeButton2);
						oGanttOverflowToolbar.addContent(oFullScreenTruck);
					}
				}
			});

			/********************************************************************************************* */
			var oGantt3 = this.getView().byId("Driver");
			var oMaximizeButton3 = new sap.m.Button({
				icon: "sap-icon://resize",
				type: "Transparent",
				press: function () {
					this.onMaximize(oGantt1, false, oMaximizeButton3);
				}.bind(this)
			});
			var oFullScreenDriver = new sap.m.Button({
				icon: "sap-icon://full-screen",
				type: "Transparent",
				press: function () {
					this.onToggleFullScreen(oGantt3, true, oFullScreenDriver);
				}.bind(this)
			});
			oGantt3.addEventDelegate({
				onAfterRendering: function () {
					var oGanttOverflowToolbar = oGantt3.getChartOverflowToolbar();
					if (oGanttOverflowToolbar) {
						oGanttOverflowToolbar.addContent(oMaximizeButton3);
						oGanttOverflowToolbar.addContent(oFullScreenDriver);
					}
				}
			});
		},

		/********************************************************************************************** */
		onToggleFullScreen: function (oGantt, bShowToolbar, oButton) {

			var oContainer = this.byId("container");

			oGantt.toggleFullScreen(bShowToolbar, oButton);

			var oFreightOrder = this.byId("FreightOrder");
			var oDriver = this.byId("Driver");
			var oTruck = this.byId("Truck");

			if (oGantt.fullScreenMode()) {

				oButton.setIcon("sap-icon://exit-full-screen");

				// Freight Order expanded
				if (oGantt === oFreightOrder) {

					oDriver.setVisible(true);
					oTruck.setVisible(false);

				}
				// Driver expanded
				else if (oGantt === oDriver) {


					oDriver.setVisible(true);
					oTruck.setVisible(false);

				}
				// Vehicle expanded
				else if (oGantt === oTruck) {

					oFreightOrder.setVisible(true);
					oDriver.setVisible(false);

				}

			} else {

				oButton.setIcon("sap-icon://full-screen");

				oFreightOrder.setVisible(true);
				oDriver.setVisible(true);
				oTruck.setVisible(true);
			}


		},
		onMaximize: function (oGantt, bShowToolbar, oButton) {

			var oContainer = this.byId("container");

			var oFreightOrder = this.byId("FreightOrder");
			var oDriver = this.byId("Driver");
			var oTruck = this.byId("Truck");

			this._bMaximized = !this._bMaximized;

			if (this._bMaximized) {

				//oButton.setIcon("sap-icon://exit-full-screen");

				if (oGantt === oFreightOrder) {

					oContainer.removeAllGanttCharts();

					oContainer.addGanttChart(oFreightOrder);
					oContainer.addGanttChart(oDriver);

				} else if (oGantt === oDriver) {

					oContainer.removeAllGanttCharts();

					oContainer.addGanttChart(oFreightOrder);
					oContainer.addGanttChart(oDriver);

				} else if (oGantt === oTruck) {

					oContainer.removeAllGanttCharts();

					oContainer.addGanttChart(oFreightOrder);
					oContainer.addGanttChart(oTruck);
				}

			} else {

				//oButton.setIcon("sap-icon://resize");

				oContainer.removeAllGanttCharts();

				oContainer.addGanttChart(oFreightOrder);
				oContainer.addGanttChart(oDriver);
				oContainer.addGanttChart(oTruck);
			}
		},

		/********************************************************************************************** */

		onToggleFullScreen1: function (oGantt, bShowToolbar, oButton) {
			oGantt.toggleFullScreen(bShowToolbar, oButton);

			var oDriver = this.byId("Driver");
			var oTruck = this.byId("Truck");

			if (oGantt.getId().includes("FreightOrder")) {

				if (oGantt.fullScreenMode()) {

					oButton.setIcon("sap-icon://exit-full-screen");
					oDriver.setVisible(true);
					oTruck.setVisible(false);

				} else {

					oButton.setIcon("sap-icon://full-screen");
					oDriver.setVisible(true);
					oTruck.setVisible(true);
				}
			}

			// if (oGantt.fullScreenMode()) {
			// 	oButton.setIcon("sap-icon://exit-full-screen");
			// 	this.showUtilization()
			// 	//this.getView().byId("layoutSelect").setVisible(false);
			// } else {
			// 	oButton.setIcon("sap-icon://full-screen");
			// 	//this.getView().byId("layoutSelect").setVisible(true);
			// }

			// var oDriverGantt = this.byId("Driver");
			// var oTable = oDriverGantt.getTable();

			// for (let i = 0; i < oTable.getBinding("rows").getLength(); i++) {
			// 	oDriverGantt.expand("driver", i);
			// }

			// var oTruckGantt = this.byId("Truck");
			// var oTable = oTruckGantt.getTable();

			// for (let i = 0; i < oTable.getBinding("rows").getLength(); i++) {
			// 	oTruckGantt.expand("truck_to_ulc", i);
			// }
		},

		onLoadData: async function () {

			var oFromDate = this.byId("dpFromDate").getDateValue();
			var oToDate = this.byId("dpToDate").getDateValue();
			var oDc = this.byId("ownerSelect").getSelectedKey();

			if (!oFromDate || !oToDate) {
				sap.m.MessageToast.show("Please select From Date and To Date");
				return;
			}
			if (oFromDate.getTime() > oToDate.getTime()) {
				sap.m.MessageToast.show(
					"From Date cannot be later than To Date"
				);
				return;
			}
			this._updateHorizon(oFromDate, oToDate);
			try {

				await this.getOwnerComponent().loadMasterData(
					oFromDate,
					oToDate,
					oDc
				);
				/*
				* loadMasterData() populates data>/Requirements.
				* Prepare nested rest-break shapes after the service returns.
				*/
				this._prepareFreightOrderShapes();
				this._prepareDriverData();
				this._prepareDriverShiftShapes(oFromDate, oToDate);

			} catch (oError) {
				console.error(
					"Unable to load cockpit data",
					oError
				);

				sap.m.MessageToast.show(
					oError?.message ||
					"Unable to load cockpit data"
				);
			}

		},
		onFilter: function () {
			this.applyFilters();

		},

		_prepareFreightOrderShapes: function () {
			var oDataModel = this.getView().getModel("data");

			if (!oDataModel) {
				console.error("The named model 'data' is not available");
				return;
			}

			var aRequirements =
				oDataModel.getProperty("/Requirements") || [];

			aRequirements.forEach(function (oFO, iFoIndex) {
				var aRestBreaks = Array.isArray(oFO.restBreaks)
					? oFO.restBreaks
					: [];

				/*
				* Keep the FO properties unchanged.
				* Add a Gantt-specific nested collection.
				*/
				oFO.RestBreakShapes = aRestBreaks
					.filter(function (oBreak) {
						return (
							oBreak &&
							oBreak.rest_startTime &&
							oBreak.rest_endTime
						);
					})
					.map(function (oBreak, iBreakIndex) {
						var sType = String(
							oBreak.restType || "BREAK"
						).toUpperCase();

						var sFoId =
							oFO.id ||
							oFO.transportationOrderUUID ||
							"FO-" + iFoIndex;

						return {
							shapeId: [
								sFoId,
								sType,
								iBreakIndex
							].join("-"),

							RequirementId: oFO.id,
							TransportationOrderUUID:
								oFO.transportationOrderUUID,

							Type: sType,
							Title: sType,

							StartTime: oBreak.rest_startTime,
							EndTime: oBreak.rest_endTime,

							FillColor: this._getRestBreakColor(sType),

							Tooltip:
								this._createRestBreakTooltip(
									sType,
									oBreak.rest_startTime,
									oBreak.rest_endTime
								)
						};
					}.bind(this));
			}.bind(this));

			/*
			* setProperty triggers the binding update.
			* Use a new array reference so JSONModel notices the change.
			*/
			oDataModel.setProperty(
				"/Requirements",
				aRequirements.slice()
			);

			console.log(
				"Requirements prepared for Gantt:",
				oDataModel.getProperty("/Requirements")
			);

			if (aRequirements.length > 0) {
				console.log(
					"First FO rest-break shapes:",
					aRequirements[0].RestBreakShapes
				);
			}
		},


		_getRestBreakColor: function (sType) {
			switch (String(sType || "").toUpperCase()) {
				case "REST":
					return "#6D28D9";

				case "BREAK":
					return "#E9730C";

				default:
					return "#6A6D70";
			}
		},

		_prepareDriverData: function () {
			var oDataModel = this.getView().getModel("data");

			if (!oDataModel) {
				console.error("Named model 'data' is not available");
				return;
			}

			var vDriverData = oDataModel.getProperty("/Drivers");
			var aDrivers = [];

			/*
			* Normalize the Driver response.
			*/
			if (Array.isArray(vDriverData)) {
				aDrivers = vDriverData;
			} else if (Array.isArray(vDriverData?.value)) {
				aDrivers = vDriverData.value;
			} else if (Array.isArray(vDriverData?.results)) {
				aDrivers = vDriverData.results;
			}

			/*
			* Remove @odata.context strings and other invalid entries.
			*/
			aDrivers = aDrivers.filter(function (oDriver) {
				return (
					oDriver !== null &&
					typeof oDriver === "object" &&
					!Array.isArray(oDriver)
				);
			});

			/*
			* Always return a new object.
			* Do not directly add properties to the original value.
			*/
			aDrivers = aDrivers.map(function (oDriver, iIndex) {
				var sDriverId =
					oDriver.driverID ||
					oDriver.driverId ||
					oDriver.DriverID ||
					oDriver.DriverId ||
					oDriver.id ||
					oDriver.ID ||
					"DRIVER-" + iIndex;

				var sFirstName =
					oDriver.firstName ||
					oDriver.FirstName ||
					oDriver.first_name ||
					oDriver.givenName ||
					"";

				var sLastName =
					oDriver.lastName ||
					oDriver.LastName ||
					oDriver.last_name ||
					oDriver.familyName ||
					"";

				var sValidFrom =
					oDriver.resourceValidFrom ||
					oDriver.ResourceValidFrom ||
					oDriver.validFrom ||
					oDriver.ValidFrom ||
					oDriver.startTime ||
					oDriver.StartTime ||
					"";

				var sValidTo =
					oDriver.resourceValidTo ||
					oDriver.ResourceValidTo ||
					oDriver.validTo ||
					oDriver.ValidTo ||
					oDriver.endTime ||
					oDriver.EndTime ||
					"";

				return Object.assign({}, oDriver, {
					driverID: sDriverId,
					firstName: sFirstName,
					lastName: sLastName,
					resourceValidFrom: sValidFrom,
					resourceValidTo: sValidTo,
					resourceType: "Driver"
					//selected: Boolean(oDriver.selected)
				});
			});

			oDataModel.setProperty("/Drivers", aDrivers);

			console.log("Prepared driver count:", aDrivers.length);
			console.log("Prepared Drivers:", aDrivers);
		},

		_prepareDriverShiftShapes: function (
			oSelectedFromDate,
			oSelectedToDate
		) {
			var oDataModel = this.getView().getModel("data");

			if (!oDataModel) {
				console.error("Named model 'data' is not available");
				return;
			}

			var aDrivers = oDataModel.getProperty("/Drivers") || [];

			var oRangeStart = new Date(oSelectedFromDate);
			var oRangeEnd = new Date(oSelectedToDate);

			oRangeStart.setHours(0, 0, 0, 0);
			oRangeEnd.setHours(23, 59, 59, 999);

			aDrivers = aDrivers.map(function (oDriver, iIndex) {
				var aShifts = Array.isArray(oDriver.shifts)
					? oDriver.shifts
					: [];

				/*
				 * Find the earliest shiftValidFrom and the latest
				 * shiftValidUntil across all shifts of the driver.
				 */
				var aValidFromDates = aShifts
					.map(function (oShift) {
						return this._parseYYYYMMDD(
							oShift.shiftValidFrom
						);
					}.bind(this))
					.filter(Boolean);

				var aValidUntilDates = aShifts
					.map(function (oShift) {
						return this._parseYYYYMMDD(
							oShift.shiftValidUntil
						);
					}.bind(this))
					.filter(Boolean);

				var oShiftPeriodStart = aValidFromDates.length
					? new Date(
						Math.min.apply(
							null,
							aValidFromDates.map(function (oDate) {
								return oDate.getTime();
							})
						)
					)
					: null;

				var oShiftPeriodEnd = aValidUntilDates.length
					? new Date(
						Math.max.apply(
							null,
							aValidUntilDates.map(function (oDate) {
								return oDate.getTime();
							})
						)
					)
					: null;

				/*
				 * Include the complete final day.
				 */
				if (oShiftPeriodEnd) {
					oShiftPeriodEnd.setHours(
						23,
						59,
						59,
						999
					);
				}

				return Object.assign({}, oDriver, {
					driverID:
						oDriver.driverID ||
						oDriver.driverId ||
						"DRIVER-" + iIndex,

					firstName: oDriver.firstName || "",
					lastName: oDriver.lastName || "",
					resourceType: "Driver",
					ShiftPeriodStart: oShiftPeriodStart ? oShiftPeriodStart.toISOString() : null,
					ShiftPeriodEnd: oShiftPeriodEnd ? oShiftPeriodEnd.toISOString() : null,
					ShiftPeriodTitle: oShiftPeriodStart && oShiftPeriodEnd ? "Total Shift Period" : "",
					shifts: aShifts
				});
			}.bind(this));

			aDrivers = aDrivers.map(function (oDriver) {
				var aShifts = Array.isArray(oDriver.shifts)
					? oDriver.shifts
					: [];

				var aShiftShapes = [];

				aShifts.forEach(function (oShift, iShiftIndex) {
					var oShiftValidFrom =
						this._parseYYYYMMDD(
							oShift.shiftValidFrom
						);

					var oShiftValidUntil =
						this._parseYYYYMMDD(
							oShift.shiftValidUntil
						);

					if (!oShiftValidFrom || !oShiftValidUntil) {
						console.warn(
							"Invalid shift validity dates:",
							oDriver.driverID,
							oShift
						);

						return;
					}

					/*
					* Limit generated shapes to the selected cockpit
					* horizon and the shift validity period.
					*/
					var oEffectiveStart = new Date(
						Math.max(
							oRangeStart.getTime(),
							oShiftValidFrom.getTime()
						)
					);

					var oEffectiveEnd = new Date(
						Math.min(
							oRangeEnd.getTime(),
							oShiftValidUntil.getTime()
						)
					);

					oEffectiveStart.setHours(0, 0, 0, 0);
					oEffectiveEnd.setHours(23, 59, 59, 999);

					if (
						oEffectiveStart.getTime() >
						oEffectiveEnd.getTime()
					) {
						return;
					}

					var aWorkingDays =
						this._getShiftWorkingDays(
							oShift.shiftSequence,
							oDriver.calendarDays
						);

					var iStartSeconds =
						Number(oShift.shiftStartTime);

					var iEndSeconds =
						Number(oShift.shiftEndTime);

					if (
						Number.isNaN(iStartSeconds) ||
						Number.isNaN(iEndSeconds)
					) {
						console.warn(
							"Invalid shift start/end seconds:",
							oShift
						);

						return;
					}

					var oCurrentDate =
						new Date(oEffectiveStart);

					while (
						oCurrentDate.getTime() <=
						oEffectiveEnd.getTime()
					) {
						var iWeekday = oCurrentDate.getDay();

						if (aWorkingDays.includes(iWeekday)) {
							var oShiftStart =
								this._dateWithSeconds(
									oCurrentDate,
									iStartSeconds
								);

							var oShiftEnd =
								this._dateWithSeconds(
									oCurrentDate,
									iEndSeconds
								);

							/*
							* Handle an overnight shift, for example:
							* 22:00 to 06:00.
							*/
							if (
								iEndSeconds <= iStartSeconds
							) {
								oShiftEnd.setDate(
									oShiftEnd.getDate() + 1
								);
							}

							aShiftShapes.push({
								shapeId: [
									oDriver.driverID,
									"SHIFT",
									iShiftIndex,
									this._formatDateKey(
										oCurrentDate
									)
								].join("-"),

								Type: "SHIFT",
								DriverID: oDriver.driverID,
								Title:
									oShift.shiftDefinition ||
									"Shift",

								StartTime:
									oShiftStart.toISOString(),

								EndTime:
									oShiftEnd.toISOString(),

								ShiftSequence:
									oShift.shiftSequence,

								ShiftDefinition:
									oShift.shiftDefinition,

								Tooltip:
									this._createShiftTooltip(
										oDriver,
										oShift,
										oShiftStart,
										oShiftEnd
									)
							});
						}

						oCurrentDate.setDate(
							oCurrentDate.getDate() + 1
						);
					}
				}.bind(this));

				return Object.assign({}, oDriver, {
					ShiftShapes: aShiftShapes
				});
			}.bind(this));




			oDataModel.setProperty(
				"/Drivers",
				aDrivers
			);

			console.log(
				"Drivers with ShiftShapes:",
				aDrivers
			);
		},

		_createRestBreakTooltip: function (
			sType,
			sStartTime,
			sEndTime
		) {
			var oStartDate = new Date(sStartTime);
			var oEndDate = new Date(sEndTime);

			var iDurationMinutes = Math.round(
				(oEndDate.getTime() - oStartDate.getTime()) /
				(60 * 1000)
			);

			var iHours = Math.floor(iDurationMinutes / 60);
			var iMinutes = iDurationMinutes % 60;

			var sDuration = iHours > 0
				? iHours + "h " + iMinutes + "m"
				: iMinutes + "m";

			return [
				sType,
				"Start: " + sStartTime,
				"End: " + sEndTime,
				"Duration: " + sDuration
			].join("\n");
		},

		_updateHorizon: function (oFromDate, oToDate) {

			this.byId("dpFromDate").setDateValue(oFromDate);
			this.byId("dpToDate").setDateValue(oToDate);

			// Total Horizon = Visible -1 day / +2 days
			var oVisibleStart = new Date(oFromDate);
			oVisibleStart.setDate(oVisibleStart.getDate() - 1);

			var oVisbleEnd = new Date(oToDate);
			oVisbleEnd.setDate(oVisbleEnd.getDate() + 2);


			var sStart =
				oVisibleStart.getFullYear() +
				String(oVisibleStart.getMonth() + 1).padStart(2, "0") +
				String(oVisibleStart.getDate()).padStart(2, "0") +
				"000000";

			var sEnd =
				oVisbleEnd.getFullYear() +
				String(oVisbleEnd.getMonth() + 1).padStart(2, "0") +
				String(oVisbleEnd.getDate()).padStart(2, "0") +
				"235959";

			// Total Horizon = Visible -1 day / +2 days
			var oTotalStart = new Date(oFromDate);
			oTotalStart.setDate(oTotalStart.getDate());

			var oTotalEnd = new Date(oToDate);
			oTotalEnd.setDate(oTotalEnd.getDate());

			var sTStart =
				oTotalStart.getFullYear() +
				String(oTotalStart.getMonth() + 1).padStart(2, "0") +
				String(oTotalStart.getDate()).padStart(2, "0") +
				"000000";

			var sTEnd =
				oTotalEnd.getFullYear() +
				String(oTotalEnd.getMonth() + 1).padStart(2, "0") +
				String(oTotalEnd.getDate()).padStart(2, "0") +
				"235959";


			var oViewModel = new sap.ui.model.json.JSONModel({
				horizonStart: sStart,
				horizonEnd: sEnd,
				total_horizonStart: sTStart,
				total_horizonEnd: sTEnd
			});

			this.getView().setModel(oViewModel, "horizon");

		},

		applyFilters: function () {

			const oView = this.getView();
			const oFilterData = {
				fromDateTime: oView.byId("dpFromDate").getDateValue(),
				toDateTime: oView.byId("dpToDate").getDateValue()
			};

			this.onLoadData();

		},

		onShapeDrop_1: async function (oEvent) {

			try {

				this.byId("btnSave").setEnabled(true);
				var oSourceGantt = oEvent.getSource();
				//var oNewDateTime = oEvent.getParameter("newDateTime");
				var oDraggedShapeDates = oEvent.getParameter("draggedShapeDates");
				var sLastDraggedShapeUid = oEvent.getParameter("lastDraggedShapeUid");
				var oParsedUid = Utility.parseUid(sLastDraggedShapeUid).shapeId;
				oParsedUid = oParsedUid.replace(/-/g, "").toUpperCase();
				var oNewDateTime_s = oEvent.getParameter("newDateTime");

				var NewDepartureDatetime = formatter.formatDate(oNewDateTime_s);
				//var sPath = oParsedUid.shapeDataName;


				const response = await FreightOrderService.GetFOSimilution({
					IvTorKey: oParsedUid,
					IvNewDepartureDatetime: NewDepartureDatetime //'20260922044441'
				});

				// console.log("API Response", response);
				const oSimulation = response?.value?.[0]?.simulationResults || [];

				if (!oSimulation) {
					sap.m.MessageToast.show("No simulation result returned");
					return;
				}
				else if (oSimulation[0].updateRc === 'F') {
					sap.m.MessageToast.show("Simiulation Result is Failed ......");
					return;
				}


				if (oSimulation[0].updateRc != 'F') {

					// console.log("Simulation Results", aResults);
					// const sNewDepartureStart = response?.value?.[0]?.simulationResults?.[0]?.newDepartureStart;
					// const sNewDepartureEnd = response?.value?.[0]?.simulationResults?.[0]?.newDepartureEnd;
					// const aRestBreaks = response?.value?.[0]?.simulationResults?.[0]?.restBreaks || [];

					const {
						newDepartureStart,
						newDepartureEnd,
						restBreaks
					} = response.value[0].simulationResults[0];

					// console.log(newDepartureStart);
					// console.log(newDepartureEnd);
					// console.log(restBreaks);

					var oDataModel = oSourceGantt.getModel("data");

					var sDraggedPath =
						Utility.parseUid(sLastDraggedShapeUid).shapeDataName;

					var oDraggedFO =
						oDataModel.getProperty(sDraggedPath);

					if (!oDraggedFO) {
						throw new Error(
							"Unable to find the dragged Freight Order"
						);
					}

					var aRestBreakShapes = (
						Array.isArray(restBreaks) ? restBreaks : []
					).map(function (oBreak, iIndex) {
						var sType = String(
							oBreak.restType || "BREAK"
						).toUpperCase();

						return {
							shapeId: [
								oDraggedFO.id,
								sType,
								iIndex
							].join("-"),

							RequirementId: oDraggedFO.id,
							Type: sType,
							Title: sType,
							StartTime: oBreak.rest_startTime,
							EndTime: oBreak.rest_endTime,
							FillColor: this._getRestBreakColor(sType),

							Tooltip: this._createRestBreakTooltip(
								sType,
								oBreak.rest_startTime,
								oBreak.rest_endTime
							)
						};
					}.bind(this));

					oDataModel.setProperty(
						sDraggedPath + "/RestBreakShapes",
						aRestBreakShapes
					);

					oDataModel.setProperty(
						sDraggedPath + "/Departure_Time",
						newDepartureStart
					);

					oDataModel.setProperty(
						sDraggedPath + "/Arrival_Time",
						newDepartureEnd
					);

					oDataModel.refresh(true);

					// Convert API datetime string to JS Date
					const oNewDateTime = formatter.dateToNewObject(newDepartureStart);
					const oNewEndDateTime = formatter.dateToNewObject(newDepartureEnd);

					var oOldStartDateTime = oDraggedShapeDates[sLastDraggedShapeUid].time;
					var oOldEndDateTime = oDraggedShapeDates[sLastDraggedShapeUid].endTime;
					var iMoveWidthInMs = oNewDateTime.getTime() - oOldStartDateTime.getTime();
					if (oSourceGantt.getGhostAlignment() === sap.gantt.dragdrop.GhostAlignment.End) {
						iMoveWidthInMs = oNewDateTime.getTime() - oOldEndDateTime.getTime();
					}

					// const sFO = oShapeData.shape.getShapeId();
					// const dStart = oShapeData.time;
					// const dEnd = oShapeData.endTime;

					var getBindingContextPath = function (sShapeUid) {
						var oParsedUid = Utility.parseUid(sShapeUid);
						return oParsedUid.shapeDataName;
					};

					var oTargetRow = oEvent.getParameter("targetRow");
					var oTargetObject = oTargetRow.getBindingContext("data").getObject();
					var sTargetObjectType = oTargetObject.resourceType;

					var oDataModel = oSourceGantt.getModel("data") || this.getOwnerComponent().getModel("data");
					var that = this;

					Object.keys(oDraggedShapeDates).forEach(function (sShapeUid) {
						var sPath = getBindingContextPath(sShapeUid);
						// var oOldDateTime = oDraggedShapeDates[sShapeUid].time;
						// var oOldEndDateTime = oDraggedShapeDates[sShapeUid].endTime;
						var oNewDateTime = new Date(formatter.dateToNewObject(newDepartureStart).getTime() + iMoveWidthInMs);
						var oNewEndDateTime = new Date(formatter.dateToNewObject(newDepartureEnd).getTime() + iMoveWidthInMs);

						var oData = oDataModel.getObject(sPath);
						//var sType = oDataModel.getProperty(sPath + "/Type");

						if (sTargetObjectType == "Truck") {
							that.handleMoveFreightOrderToTruck(oNewDateTime.toISOString().replace(".000", ""), oNewEndDateTime.toISOString().replace(".000", ""), oTargetObject, sPath, oDataModel, iMoveWidthInMs);
							sap.m.MessageToast.show(`Dispatcher Data updated successfully.`);
						}
						else {
							that.applySimulationResultToFreightOrder(oNewDateTime.toISOString().replace(".000", ""), oNewEndDateTime.toISOString().replace(".000", ""), oTargetObject, sPath, oDataModel);
							sap.m.MessageToast.show(`Freight Order updated successfully. Start: ${oNewDateTime}, End: ${oNewEndDateTime}`);
						}
					});

					this.byId("UseAI").setEnabled(false);
				}

			} catch (e) {
				console.error("API Error", e);
				console.error("Response", e?.response);
				console.error("Response Data", e?.response?.data);

				sap.m.MessageToast.show(
					e?.response?.data?.error?.message ||
					e?.message ||
					"Update failed"
				);
			}
		},

		onShapeDrop: async function (oEvent) {
			var oSourceGantt = oEvent.getSource();
			var oDataModel = oSourceGantt.getModel("data");
			var oSimulationFlag = false;

			try {
				var mDraggedShapeDates =
					oEvent.getParameter("draggedShapeDates") || {};

				var sDraggedShapeUid =
					oEvent.getParameter("lastDraggedShapeUid");

				var oTargetRow =
					oEvent.getParameter("targetRow");

				var oDroppedDate =
					oEvent.getParameter("newDateTime");

				if (!sDraggedShapeUid) {
					throw new Error("Dragged Freight Order was not identified");
				}

				if (!oTargetRow) {
					throw new Error("Please drop the Freight Order on a resource row");
				}


				const response = await fetch(
					"http://localhost:3000/api/validate",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(
							{
								AssignmentsToValidate: [
									{
										"foId": "6100001556",
										"driverId": "0001000139",
										"vehId": "VA_01_1010_INT"
									},
									{
										"foId": "6100001556",
										"driverId": "0001000139",
										"vehId": ""
									},
									{
										"foId": "6100001556",
										"driverId": "",
										"vehId": "VA_01_1010_INT"
									},
									{
										"foId": "6100001556",
										"driverId": "",
										"vehId": ""
									},
									{
										"foId": "",
										"driverId": "",
										"vehId": ""
									},
									{
										"foId": "6100001559",
										"driverId": "0001000611",
										"vehId": "VA_04_1010_INT"
									}
								]
							})
					}
				);

				const result = await response.json();
				console.log(result);


				/*
				* Parse the dragged shape UID.
				* shapeDataName contains the JSONModel binding path,
				* for example /Requirements/0.
				*/
				var oParsedUid = Utility.parseUid(sDraggedShapeUid);
				var sFoPath = oParsedUid.shapeDataName;

				var oFreightOrder =
					oDataModel.getProperty(sFoPath);

				if (!oFreightOrder) {
					throw new Error(
						"Freight Order data was not found at " + sFoPath
					);
				}

				/*
				* Prevent REST/BREAK shapes from being processed as FOs.
				*/
				if (
					sFoPath.indexOf("/RestBreakShapes/") !== -1 ||
					oFreightOrder.Type === "REST" ||
					oFreightOrder.Type === "BREAK"
				) {
					sap.m.MessageToast.show(
						"Only Freight Orders can be assigned"
					);
					return;
				}

				var oTargetContext =
					oTargetRow.getBindingContext("data");
				//oTargetContext.sPath 
				//'/Resources/1'
				//'/Truck/1'

				if (!oTargetContext) {
					throw new Error(
						"The target resource row has no data context"
					);
				}

				var oTargetResource =
					oTargetContext.getObject();

				var sResourceType =
					(oTargetResource.resourceType ||
						oTargetResource.ResourceType ||
						"") === "09"
						? "Vehicle"
						: (oTargetResource.resourceType ||
							oTargetResource.ResourceType ||
							"");

				if (
					sResourceType !== "Driver" &&
					sResourceType !== "Vehicle" &&
					sResourceType !== ""
				) {
					sap.m.MessageToast.show(
						"Drop the Freight Order on a Driver, Vehicle, or Simulation row"
					);
					return;
				}

				var oTargetRow = oEvent.getParameter("targetRow");
				var oTargetObject = oTargetRow.getBindingContext("data").getObject();
				var sTargetObjectType = oTargetObject.resourceType;


				console.log(oFreightOrder.driverID);

				// var oDataModel = this.getOwnerComponent().getModel("data");
				// var oDataModel = oSourceGantt.getModel("data");

				/*
				* Handle the different resource-ID names returned by
				* your resource service.
				*/

				// var sTargetVehicleId =
				// 	oTargetResource.resourceId ||
				// 	oTargetResource.driverID ||
				// 	oTargetResource.driverUUID ||
				// 	oTargetResource.ResourceID ||
				// 	oTargetResource.id ||
				// 	oTargetResource.Veh_id ||
				// 	oTargetResource.veh_regno;


				let sTargetId = "";

				if (sResourceType === "Driver") {
					sTargetId =
						oTargetResource.driverID ||
						oTargetResource.driverUUID ||
						oTargetResource.resourceId;
				} else if (sResourceType === "Vehicle") {
					sTargetId =
						oTargetResource.Veh_id ||
						oTargetResource.veh_regno ||
						oTargetResource.resourceId;
				}
				else {
					sTargetId =
						oTargetResource.id ||
						oTargetResource.ID;
				}


				if (!sTargetId) {
					throw new Error(
						"The target vehicle does not contain a resource ID"
					);
				}

				var oDraggedDates =
					mDraggedShapeDates[sDraggedShapeUid];

				if (!oDraggedDates) {
					throw new Error(
						"Original Freight Order dates were not found"
					);
				}

				var oOldStart = oDraggedDates.time;
				var oOldEnd = oDraggedDates.endTime;

				if (!(oOldStart instanceof Date)) {
					oOldStart = new Date(oOldStart);
				}

				if (!(oOldEnd instanceof Date)) {
					oOldEnd = new Date(oOldEnd);
				}

				var oNewStart = oDroppedDate instanceof Date
					? new Date(oDroppedDate.getTime())
					: new Date(oDroppedDate);

				if (Number.isNaN(oNewStart.getTime())) {
					throw new Error("The dropped date/time is invalid");
				}

				var iDuration =
					oOldEnd.getTime() - oOldStart.getTime();

				var oNewEnd = new Date(
					oNewStart.getTime() + iDuration
				);

				/*
				* Ask the backend for the recalculated FO dates and
				* mandatory rest periods.
				*/
				var sTorKey = String(
					oFreightOrder.transportationOrderUUID ||
					oFreightOrder.id ||
					""
				)
					.replace(/-/g, "")
					.toUpperCase();

				const sPath = oTargetContext?.sPath || "";

				oSimulationFlag = ![
					"/Drivers/",
					"/Truck/",
					"/Resources/"
				].some(sType => sPath.includes(sType));

				if (oSimulationFlag) {

					var oResponse =
						await FreightOrderService.GetFOSimilution({
							IvTorKey: sTorKey,
							IvNewDepartureDatetime:
								formatter.formatDate(oNewStart)
						});

					var oSimulation =
						oResponse?.value?.[0]?.simulationResults?.[0];

					if (!oSimulation) {
						throw new Error(
							"No simulation result was returned"
						);
					}

					if (oSimulation.updateRc === "F") {
						throw new Error(
							oSimulation.updateMessage ||
							"Freight Order simulation failed"
						);
					}
				}

				/*
				* Prefer the dates returned by simulation.
				* Use calculated dates as fallback.
				*/

				var sNewDeparture = oSimulation?.newDepartureStart ?? oNewStart.toISOString();

				var sNewArrival = oSimulation?.newDepartureEnd ?? oNewEnd.toISOString();

				const aRestBreaks = oSimulation?.restBreaks ?? [];

				var aRestBreakShapes = aRestBreaks.map(function (oBreak, iIndex) {
					var sType = String(
						oBreak.restType || "BREAK"
					).toUpperCase();

					return {
						shapeId: [oFreightOrder.id, sType, iIndex].join("-"),
						RequirementId: oFreightOrder.id,
						Type: sType,
						Title: sType,
						StartTime: oBreak.rest_startTime,
						EndTime: oBreak.rest_endTime,
						FillColor: this._getRestBreakColor(sType),
						Tooltip: this._createRestBreakTooltip(
							sType,
							oBreak.rest_startTime,
							oBreak.rest_endTime
						)
					};
				}.bind(this));

				// var aRestBreakShapes = (
				// 	Array.isArray(oSimulation.restBreaks)
				// 		? oSimulation.restBreaks
				// 		: []
				// ).map(function (oBreak, iIndex) {
				// 	var sType = String(
				// 		oBreak.restType || "BREAK"
				// 	).toUpperCase();

				// 	return {
				// 		shapeId: [
				// 			oFreightOrder.id,
				// 			sType,
				// 			iIndex
				// 		].join("-"),

				// 		RequirementId: oFreightOrder.id,
				// 		Type: sType,
				// 		Title: sType,
				// 		StartTime: oBreak.rest_startTime,
				// 		EndTime: oBreak.rest_endTime,
				// 		FillColor:
				// 			this._getRestBreakColor(sType),

				// 		Tooltip:
				// 			this._createRestBreakTooltip(
				// 				sType,
				// 				oBreak.rest_startTime,
				// 				oBreak.rest_endTime
				// 			)
				// 	};
				// }.bind(this));



				/*
				* Update the current FO row using the JSONModel API.
				*/



				var that = this;


				if (oSimulationFlag) {

					var oNewDateTime = new Date(formatter.dateToNewObject(sNewDeparture).getTime());
					var oNewEndDateTime = new Date(formatter.dateToNewObject(sNewArrival).getTime());

					oDataModel.setProperty(
						sFoPath + "/Departure_Time",
						oNewDateTime.toISOString().replace(".000", "")
					);

					oDataModel.setProperty(
						sFoPath + "/Arrival_Time",
						oNewEndDateTime.toISOString().replace(".000", "")
					);

					oDataModel.setProperty(
						sFoPath + "/RestBreakShapes",
						aRestBreakShapes
					);

					that.applySimulationResultToFreightOrder(oNewDateTime.toISOString().replace(".000", ""), oNewEndDateTime.toISOString().replace(".000", ""), oTargetContext, sFoPath, oDataModel);
					//that.applySimulationResultToFreightOrder(sNewDeparture instanceof Date? sNewDeparture.toISOString().replace(".000", ""): String(sNewDeparture), sNewArrival instanceof Date? sNewArrival.toISOString().replace(".000", ""): String(sNewArrival), oTargetContext, sPath, oDataModel);
					sap.m.MessageToast.show(`Freight Order updated successfully. Start: ${sNewDeparture}, End: ${sNewArrival}`);

				}
				else {

					console.log("Resource Type", sResourceType);
					console.log("Target Resource", oTargetResource);
					console.log("Target ID", sTargetId);

					// oDataModel.setProperty(
					// 	sFoPath + "/Departure_Time",
					// 	sNewDeparture
					// );

					// oDataModel.setProperty(
					// 	sFoPath + "/Arrival_Time",
					// 	sNewArrival
					// );

					if (sResourceType === "Driver") {

						oDataModel.setProperty(
							sFoPath + "/driverID",
							sTargetId
						);
						var drv_id = sTargetId;

					} else if (sResourceType === "Vehicle") {

						oDataModel.setProperty(
							sFoPath + "/Veh_id",
							sTargetId
						);

						oDataModel.setProperty(
							sFoPath + "/veh_regno",
							oTargetResource.veh_regno || sTargetId
						);
						var veh_id = sTargetId;
					}

					// oDataModel.setProperty(
					// 	sFoPath + "/driverID",
					// 	sTargetVehicleId
					// );

					// oDataModel.setProperty(
					// 	sFoPath + "/Veh_id",
					// 	sTargetVehicleId
					// );

					// oDataModel.setProperty(
					// 	sFoPath + "/veh_regno",
					// 	oTargetResource.veh_regno ||
					// 	sTargetVehicleId
					// );

					/*
				* Keep changes for the Save API.
				*/
					// this._addChangedFreightOrder({
					// 	IvTorKey: sTorKey,
					// 	IvTorID: oFreightOrder.id,
					// 	IvNewDepartureDatetime:
					// 		this._toBackendDateTime(sNewDeparture),
					// 	IvDriverId:
					// 		oFreightOrder.driver_id || "",
					// 	IvVehicleResId:
					// 		sTargetId
					// });

					//that.handleMoveFreightOrderToTruck(sNewDeparture, sNewArrival, oTargetContext, sPath, oDataModel);

					// this._addFOShapeToResource(
					// 	sResourceType,
					// 	sTargetVehicleId,
					// 	oFreightOrder,
					// 	sNewDeparture,
					// 	sNewArrival
					// );

					var aFOShapes = oTargetResource.FOShapes || [];

					aFOShapes.push({
						shapeId: oFreightOrder.id,
						Title: oFreightOrder.id,
						StartTime: oOldStart,
						EndTime: oOldEnd

					});

					oTargetResource.FOShapes = aFOShapes;

					var aDrivers = oDataModel.getProperty("/Drivers") || [];

					var oDriver = aDrivers.find(function (oDrv) {
						return oDrv.driverID === sTargetId;
					});

					if (oDriver) {

						oDriver.FOShapes = oDriver.FOShapes || [];
						oDriver.FOShapes.push({
							shapeId: oFreightOrder.id,
							Title: oFreightOrder.id,
							StartTime: oOldStart,
							EndTime: oOldEnd,
							ActionIcon: true
						});
					}


					sap.m.MessageToast.show(
						"FO " +
						oFreightOrder.id +
						" assigned to " +
						sTargetId
					);

				}

				this._addChangedFreightOrder({
					IvTorKey: sTorKey,
					IvTorID: oFreightOrder.id,
					IvNewDepartureDatetime:
						this._toBackendDateTime(sNewDeparture),
					IvDriverId:
						drv_id,
					//oFreightOrder.driver_id || "",
					IvVehicleResId:
						veh_id
				});

				this.byId("btnSave").setEnabled(true);
				this.byId("UseAI").setEnabled(false);
				oDataModel.refresh(true);
				this.getView().getModel("data").refresh(true);



			} catch (oError) {
				console.error("FO drop failed", oError);

				sap.m.MessageToast.show(
					oError?.response?.data?.error?.message ||
					oError?.message ||
					"Unable to assign Freight Order"
				);
			}
		},
		_toBackendDateTime: function (vDate) {
			var oDate = vDate instanceof Date
				? vDate
				: new Date(vDate);

			if (Number.isNaN(oDate.getTime())) {
				return "";
			}

			return oDate
				.toISOString()
				.replace(/[-:]/g, "")
				.replace(/\.\d{3}Z$/, "");
		},

		_addChangedFreightOrder: function (oChange) {
			this.aChangedFOs = this.aChangedFOs || [];

			var iExistingIndex =
				this.aChangedFOs.findIndex(function (oItem) {
					return oItem.IvTorID === oChange.IvTorID;
				});

			// if (oExisting) {

			// 	if (oChange.IvVehicleResId) {
			// 		oExisting.IvVehicleResId = oChange.IvVehicleResId;
			// 	}

			// 	if (oChange.IvDriverId) {
			// 		oExisting.IvDriverId = oChange.IvDriverId;
			// 	}

			// 	if (oChange.IvNewDepartureDatetime) {
			// 		oExisting.IvNewDepartureDatetime =
			// 			oChange.IvNewDepartureDatetime;
			// 	}

			// } else {
			// 	this.aChangedFOs.push(oChange);
			// }

			if (iExistingIndex >= 0) {
				this.aChangedFOs[iExistingIndex] = oChange;
			} else {
				this.aChangedFOs.push(oChange);
			}
		},

		// handleMoveFreightUnitToTruck: function (oTime, oEndTime, oTargetObject, sPath, oModel) {
		// 	var oData = oModel.getObject(sPath);

		// 	var sTargetResourceId = oTargetObject.id;
		// 	this.iNewFOCount++;
		// 	var sNewFOId = "$" + this.iNewFOCount;

		// 	oData.ParentRequirementID = sNewFOId;
		// 	oData.ResourceID = sTargetResourceId;
		// 	oData.StartTime = oTime;
		// 	oData.EndTime = oEndTime;
		// 	oData.HierarchyLevel = 1;
		// 	oData.PlanStatus = "planned";

		// 	var oFreightOrderData = {
		// 		"RequirementID": sNewFOId,
		// 		"ResourceID": sTargetResourceId,
		// 		"Type": "FO",
		// 		"PlanStatus": "planned",
		// 		"StartTime": oTime,
		// 		"EndTime": oEndTime,
		// 		"SourceLocation": oData.SourceLocation,
		// 		"DestinationLocation": oData.DestinationLocation,
		// 		"ParentResourceID": sTargetResourceId,
		// 		"ParentRequirementID": null,
		// 		"HierarchyLevel": 0,
		// 		"DrillState": "expanded"
		// 	};

		// 	oModel.create("/Requirements", oFreightOrderData);

		// 	var mParameters = {
		// 		success: function (oData) {
		// 			//mockserver.refreshResource(oModel, sTargetResourceId);
		// 		},
		// 		refreshAfterChange: false
		// 	};
		// 	oModel.update(sPath, oData, mParameters);
		// },

		handleMoveFreightOrderToTruck: function (oTime, oEndTime, oTargetObject, sPath, oModel, iMoveWidthInMs) {
			var oData = oModel.getObject(sPath);
			var sCurrentResourceID = oData.ResourceID;
			var sTargetResourceID = oTargetObject.ResourceID;

			if (sCurrentResourceID !== sTargetResourceID) {
				oData.StartTime = oTime;
				oData.EndTime = oEndTime;
				oData.ResourceID = sTargetResourceID;
				oData.ParentResourceID = sTargetResourceID;

				var mParameters = {
					success: function (oData) {
						oModel.read("/Resources('" + sTargetResourceID + "')", {
							urlParameters: {
								"$expand": "ResourceToRequirements"
							}
						});
					},
					refreshAfterChange: false
				};
				oModel.update(sPath, oData, mParameters);
			} else {
				oModel.setProperty(sPath + "/StartTime", oTime, true);
				oModel.setProperty(sPath + "/EndTime", oEndTime, true);
			}

			oModel.read('/Requirements', {
				success: function (oData) {
					var aResult = oData.results;
					aResult.forEach(function (oNode) {
						var sUnitPath = "/Requirements('" + oNode.RequirementID + "')";
						oModel.setProperty(sUnitPath + "/StartTime", oTime, true);
						oModel.setProperty(sUnitPath + "/EndTime", oEndTime, true);
					});

				},
				error: function () {

				},
				urlParameters: {
					"$filter": "ParentRequirementID eq " + oData.RequirementID
				}
			});


			oModel.read('/UtilizationItems', {
				success: function (oItemData) {
					var aResult = oItemData.results;
					aResult.forEach(function (oItem) {
						var sUnitPath = "/UtilizationItems('" + oItem.UtilItemID + "')";
						var oOldStartDateTime = oItem.StartTime;
						var oOldEndDateTime = oItem.EndTime;
						var oNewStartTime = new Date(oOldStartDateTime.getTime() + iMoveWidthInMs);
						var oNewEndTime = new Date(oOldEndDateTime.getTime() + iMoveWidthInMs);
						var oData = {
							StartTime: oNewStartTime,
							EndTime: oNewEndTime
						};

						oModel.update(sUnitPath, oData);
					});

				},
				error: function () {

				},
				urlParameters: {
					"$filter": "RootRequirementID eq " + oData.RequirementID
				}
			});

		},

		applySimulationResultToFreightOrder: function (oTime, oEndTime, oTargetObject, sPath, oModel) {

			var oData = oModel.getObject(sPath);
			var sCurrentResourceID = oData.id;
			var sTargetResourceID = oTargetObject.resourceId;

			if (sCurrentResourceID !== sTargetResourceID) {
				oData.StartTime = oTime;
				oData.EndTime = oEndTime;
				//oData.PlanStatus = "planned";
				oData.ResourceID = sTargetResourceID;
				//oData.ParentResourceID = sTargetResourceID;

				var mParameters = {
					success: function (oData) {
						oModel.read("/Resources('" + sTargetResourceID + "')", {
							urlParameters: {
								"$expand": "ResourceToRequirements"
							}
						});
					},
					refreshAfterChange: false
				};
				//oModel.update(sPath, oData, mParameters);
				oModel.setProperty(sPath, oData);
				oModel.refresh(true);
			} else {
				oModel.setProperty(sPath + "/Departure_Time", oTime, true);
				oModel.setProperty(sPath + "/Arrival_Time", oEndTime, true);
			}


			var aRequirements = oModel.getProperty("/Requirements") || [];

			aRequirements
				.filter(oNode => oNode.ParentRequirementID === oData.id)
				.forEach(function (oNode) {

					var sPath = "/Requirements/" +
						aRequirements.findIndex(r => r.id === oNode.id);

					oModel.setProperty(sPath + "/Departure_Time", oTime);
					oModel.setProperty(sPath + "/Arrival_Time", oEndTime);
				});

			// if (!this.aChangedFOs) {
			// 	this.aChangedFOs = [];
			// }

			// var sFormatted = oTime
			// 	.replace(/[-:]/g, "")
			// 	.replace("T", "")
			// 	.replace("Z", "");

			// this.aChangedFOs.push({

			// 	IvTorKey: oData.transportationOrderUUID.replace(/-/g, "").toUpperCase(),
			// 	IvTorID: oData.id,
			// 	IvNewDepartureDatetime: sFormatted,
			// 	IvDriverId: "",
			// 	IvVehicleResId: ""
			// });

		},

		onLayoutChange: function (oEvent) {
			var oGanttChartContainer = this.byId("container");
			oGanttChartContainer.removeAllGanttCharts();
			var legendContainer = oGanttChartContainer.getToolbar().getLegendContainer();
			var sKey = oEvent.getParameter("selectedItem").getKey();
			switch (sKey) {
				case "ReqAndResAndDrv":
					legendContainer.getLegends()[0].setProperty("visible", true, true);
					legendContainer.getLegends()[0].getItems()[1].setProperty("visible", true, true);
					legendContainer.getLegends()[1].setProperty("visible", true, true);
					this.getGanttInstance("FreightOrder", "ReqAndResAndDrv", oGanttChartContainer);
					break;
				case "ReqAndRes":
					legendContainer.getLegends()[0].setProperty("visible", true, true);
					legendContainer.getLegends()[0].getItems()[1].setProperty("visible", true, true);
					legendContainer.getLegends()[1].setProperty("visible", true, true);
					this.getGanttInstance("FreightOrder", "ReqAndRes", oGanttChartContainer);
					//this.getGanttInstance("FreightOrderAndFreightUnit", "ReqAndRes", oGanttChartContainer);
					break;
				case "Resource":
					legendContainer.getLegends()[0].getItems()[1].setProperty("visible", false, true);
					legendContainer.getLegends()[1].setProperty("visible", true, true);
					this.getGanttInstance("Truck", "Resource", oGanttChartContainer);
					break;
				case "Requirement":
					legendContainer.getLegends()[0].setProperty("visible", true, true);
					legendContainer.getLegends()[0].getItems()[1].setProperty("visible", true, true);
					legendContainer.getLegends()[1].setProperty("visible", false, true);
					this.getGanttInstance("FreightOrderAndFreightUnit", "Requirement", oGanttChartContainer);
					break;
				case "Driver":
					legendContainer.getLegends()[0].setProperty("visible", true, true);
					legendContainer.getLegends()[0].getItems()[1].setProperty("visible", true, true);
					legendContainer.getLegends()[1].setProperty("visible", false, true);
					this.getGanttInstance("Driver", "Driver", oGanttChartContainer);
					break;
				default:
					return;
			}
		},

		onHierarchyChange: function (oEvent) {
			var oGanttChartContainer = this.byId("container");
			oGanttChartContainer.removeGanttChart(0);

			var sKey = oEvent.getParameter("selectedItem").getKey();

			switch (sKey) {
				case "FOFU":
					this.getGanttInstance("FreightOrderAndFreightUnit", "HeirarchyChange", oGanttChartContainer);
					break;
				case "FO":
					this.getGanttInstance("FreightOrder", "HeirarchyChange", oGanttChartContainer);
					break;
				case "FU":
					this.getGanttInstance("FreightUnit", "HeirarchyChange", oGanttChartContainer);
					break;
				default:
					return;
			}
		},

		getGanttInstance: function (sId, sKey, oGanttChartContainer) {
			var oView = this.getView();
			var oGantt = oView.byId(sId);
			if (!oGantt) {
				if (sId == "FreightOrderAndFreightUnit" && this.oFofuGantt) {
					oGanttChartContainer.insertGanttChart(this.oFofuGantt, 0);
				} else if (sId == "FreightOrder" && this.oFoGantt) {
					oGanttChartContainer.insertGanttChart(this.oFoGantt, 0);
				} else if (sId == "FreightUnit" && this.oFuGantt) {
					oGanttChartContainer.insertGanttChart(this.oFuGantt, 0);
				}
				Fragment.load({
					name: "dispatcherns.dispatcherproj.view." + sId,
					type: "XML",
					controller: this
				}).then(function (oGantt) {
					this._loadGanttChart(sKey, sId, true, oGanttChartContainer, oGantt);
				}.bind(this));
			} else {
				this._loadGanttChart(sKey, sId, false, oGanttChartContainer, oGantt);
			}
		},

		_loadGanttChart: function (sKey, sId, bisLoad, oGanttChartContainer, oGantt) {
			switch (sKey) {
				case "HeirarchyChange":
					if (bisLoad) {
						if (sId == "FreightOrderAndFreightUnit") {
							this.oFofuGantt = oGantt;
						} else if (sId == "FreightOrder") {
							this.oFoGantt = oGantt;
						} else if (sId == "FreightUnit") {
							this.oFuGantt = oGantt;
						}
					}
					oGanttChartContainer.insertGanttChart(oGantt, 0);
					break;
				case "ReqAndRes":
					oGanttChartContainer.addGanttChart(oGantt);
					this.getGanttInstance("Truck", "Resource", oGanttChartContainer);
					break;
				case "Resource":
					oGanttChartContainer.addGanttChart(oGantt);
					break;
				case "Requirement":
					oGanttChartContainer.addGanttChart(oGantt);
					break;
				default:
					return oGantt;
			}
		},
		_getOrderCreationDialog: function (bisOpen) {
			if (!this._oDialog) {
				Fragment.load({
					name: "dispatcherns.dispatcherproj.view.OrderCreate",
					type: "XML",
					controller: this
				}).then(function (_oDialog) {
					this._oDialog = _oDialog;
					_oDialog.setModel(new JSONModel(), "order");
					this.getView().addDependent(_oDialog);
					_oDialog.open();
				}.bind(this));
			} else if (bisOpen) {
				this._oDialog.open();
			} else {
				this._oDialog.close();
			}
		},

		_getDetailPopover: function (oShape, oEvent) {
			this.iPopoverOffsetX = oEvent.getParameter("popoverOffsetX");
			if (!this._oPopover) {
				Fragment.load({
					name: "dispatcherns.dispatcherproj.view.DetailPopover",
					type: "XML"
				}).then(function (oPopover) {
					this._oPopover = oPopover;
					this._oPopover.setModel(new JSONModel(), "popover");
					this.getView().addDependent(this._oPopover);
					this._oPopover.getModel("popover").setData({
						RequirementID: oShape.getShapeId(),
						SourceLocation: "",
						DestinationLocation: "",
						DepartureDate: oShape.getTime(),
						ArrivalDate: oShape.getEndTime()
					});
					this._oPopover.setOffsetX(this.iPopoverOffsetX).openBy(oShape);
				}.bind(this));

			} else {
				this._oPopover.setOffsetX(this.iPopoverOffsetX).openBy(oShape);
			}
		},

		onCreate: function (oEvent) {
			this._getOrderCreationDialog(true);
		},

		onConfirmCreateFreightOrder: function (oEvent) {
			var oDataModel = this.getView().getModel("data");
			this.iNewFOCount++;
			var sNewFOId = "$" + this.iNewFOCount;
			var oOrderData = this._oDialog.getModel("order").getData();

			var oFreightOrderData = {
				"RequirementID": sNewFOId,
				"ResourceID": oOrderData.Truck,
				"Type": "FO",
				"PlanStatus": "planned",
				"StartTime": oOrderData.DepartureDate,
				"EndTime": oOrderData.ArriveDate,
				"SourceLocation": oOrderData.SourceLocation,
				"DestinationLocation": oOrderData.DestinationLocation,
				"ParentResourceID": oOrderData.Truck,
				"ParentRequirementID": null,
				"HierarchyLevel": 0,
				"DrillState": "leaf"
			};

			var oController = this;
			var mParameters = {
				success: function (oData) {
					// mockserver.refreshResource(oDataModel, oOrderData.Truck, function () {
					// 	sap.m.MessageToast.show("Freight Order is created successfully");
					// 	oController._getOrderCreationDialog(false);
					// });
				},
				error: function (oData) {
					sap.m.MessageToast.show("Error when creating frieght order");
				},
				refreshAfterChange: false
			};
			oDataModel.create("/Requirements", oFreightOrderData, mParameters);
		},

		onDialogClose: function () {
			this._getOrderCreationDialog(false);
		},

		onDelete: function (oEvent) {
			var oControl = oEvent.getSource();
			while (!(oControl instanceof sap.gantt.simple.GanttChartWithTable)) {
				oControl = oControl.getParent();
			}
			var oDataModel = oControl.getModel("data");
			var aUid = oControl.getSelectedShapeUid();
			aUid.forEach(function (sShapeUid) {
				var o = Utility.parseUid(sShapeUid);
				var sPath = o.shapeDataName;
				var mParameters = {
					success: function () {
						sap.m.MessageToast.show("Freight Order is deleted");
					}
				};
				oDataModel.remove(sPath, mParameters);
			});
		},

		onOrderRescheduled: function (oEvent) {

			var oTableGantt = oEvent.getSource(),
				oDataModel = oTableGantt.getModel("data");

			var oShape = oEvent.getParameter("shape"),
				aNewTime = oEvent.getParameter("newTime"),
				sBindingPath = oShape.getBindingContext("data").getPath();

			oDataModel.setProperty(sBindingPath + "/StartTime", aNewTime[0], true);
			oDataModel.setProperty(sBindingPath + "/EndTime", aNewTime[1], true);
		},

		onShapeDoubleClick: function (oEvent) {
			var oShape = oEvent.getParameter("shape");

			if (oShape) {
				this._getDetailPopover(oShape, oEvent);
			}
		},

		onViewDocument: function (oEvent) {
			sap.m.MessageToast.show("Opening Document ...");
		},

		showUtilization: function () {
			var oGanttChartContainer = this.byId("container");
			var aGantts = oGanttChartContainer.getGanttCharts();

			var oDriver = this.byId("Driver");
			var oTruck = this.byId("Truck");

			if (oGantt.getId().includes("FreightOrder")) {

				if (oGantt.fullScreenMode()) {

					oDriver.setVisible(true);
					oTruck.setVisible(false);

				} else {

					oDriver.setVisible(true);
					oTruck.setVisible(true);
				}
			}

			// aGantts.forEach(function (oGantt) {
			// 	if (oGantt.getId().endsWith("Truck")) {
			// 		oGantt.expand("truck_to_ulc", oGantt.getTable().getSelectedIndices()[0]);
			// 	}
			// 	else if (oGantt.getId().endsWith("driver")) {
			// 		oGantt.expand("driver_to_ulc", oGantt.getTable().getSelectedIndices()[0]);
			// 	}
			// });
		},

		hideUtilization: function () {
			var oGanttChartContainer = this.byId("container");
			var aGantts = oGanttChartContainer.getGanttCharts();
			aGantts.forEach(function (oGantt) {
				if (oGantt.getId().endsWith("Truck")) {
					oGantt.collapse("truck_to_ulc", oGantt.getTable().getSelectedIndices()[0]);
				}
			});
		},
		onLegendItemInteractiveChange: function (oEvent) {
			sap.m.MessageToast.show("Legend Item interactive value changed on shape: " + oEvent.getParameter("legendName"));
		},
		onGanttSidePanel: function (oEvent) {
			oEvent.getParameters().updateSidePanelState.enable();
		},
		onDisplayOverlay: function () {
			var oGantt = this.getView().byId("sampleComp-sap.gantt.sample.GanttChartContainer---RootView--Truck");
			this._toggleoverlay = !this._toggleoverlay;
			if (oGantt) {
				oGantt.showWrapper(this._toggleoverlay);
			}
			var oContainer = this.byId("container");
			this._toggleoverlayforcontainer = !this._toggleoverlayforcontainer;
			if (oContainer) {
				oContainer.showWrapper(this._toggleoverlayforcontainer);
			}
		},
		onSaveData: async function () {

			if (!this.aChangedFOs || this.aChangedFOs.length === 0) {
				sap.m.MessageToast.show("No changes found");
				return;
			}

			try {

				const payload = {
					Updates: this.aChangedFOs
				};

				await FreightOrderService.SaveFO(payload);
				this.aChangedFOs = [];

				await this.getOwnerComponent().loadMasterData();
				this.getView().getModel("data").refresh(true);

				sap.m.MessageToast.show("Freight Orders saved successfully and refreshed successfully");

				this.byId("btnSave").setEnabled(false);
				this.byId("UseAI").setEnabled(true);

			} catch (error) {

				sap.m.MessageToast.show("Save failed");
				console.error(error);
			}

		},
		onAISettings: function () {
			if (!this._oAISettingsDialog) {
				this._oAISettingsDialog =
					sap.ui.xmlfragment(
						this.getView().getId(),
						"dispatcherns.dispatcherproj.view.AISettings",
						this
					);
				//"dispatcherns.dispatcherproj.view.OrderCreate"
				this.getView().addDependent(
					this._oAISettingsDialog
				);
			}
			this._oAISettingsDialog.open();
		},

		onApplyAISettings: function () {
			var oSettings =
				this.getView().getModel("ai").getData();
			console.log("AI Settings", oSettings);
			MessageToast.show(
				"AI Optimization Settings Applied"
			);
			this._oAISettingsDialog.close();
		},

		onResetAISettings: function () {
			this.getView().getModel("ai").setData({

				outsideShiftHours: 2,
				workloadFactor: 70,
				maxIdleTime: 2,
				driverPreference: true,
				emptyMiles: true,
				homeLocation: true,
				overtimeOptimization: false,
				strategyIndex: 1
			});
			MessageToast.show(
				"Settings Reset"
			);
		},

		onAIAnalytics: function () {
			if (!this._oAIAnalyticsPage) {
				this._oAIAnalyticsPage =
					sap.ui.xmlfragment(
						this.getView().getId(),
						"dispatcherns.dispatcherproj.view.AIAnalytics",
						this
					);
				this.getView().getParent().addPage(this._oAIAnalyticsPage);
			}
			this._loadAnalyticsData();
			this.getView().getParent().to(this._oAIAnalyticsPage.getId());
			window.open(this._oAIAnalyticsPage, "_blank");
		},

		onCloseAIAnalytics: function () {
			this.getView().getParent().back();
		},

		_loadAnalyticsData: function () {
			var oModel = new sap.ui.model.json.JSONModel({
				aiAdoption: 89,
				foCoverage: 98,
				planningScore: 87,
				complianceScore: 100,
				costSavings: 12450,
				aiVsManual: [
					{
						metric: "Coverage",
						ai: "98%",
						manual: "93%"
					},
					{
						metric: "Empty Miles",
						ai: "890",
						manual: "1120"
					},
					{
						metric: "Idle Hours",
						ai: "214",
						manual: "302"
					}
				],
				assignmentQuality: [
					{
						metric: "Workload Balance",
						score: 91
					},
					{
						metric: "Route Quality",
						score: 94
					},
					{
						metric: "Vehicle Utilization",
						score: 88
					},
					{
						metric: "Time Window Adherence",
						score: 97
					}
				],
				driverUtilization: [
					{
						driverName: "Driver D001",
						utilization: 92
					},
					{
						driverName: "Driver D002",
						utilization: 78
					},
					{
						driverName: "Driver D003",
						utilization: 64
					},
					{
						driverName: "Driver D004",
						utilization: 88
					}
				]
			});
			this._oAIAnalyticsPage.setModel(
				oModel,
				"analytics"
			);
		},

		onEURegulations: function () {
			this._loadEURegulationData();

			if (!this._oEUDialog) {

				this._oEUDialog = sap.ui.xmlfragment(
					this.getView().getId(),
					"dispatcherns.dispatcherproj.view.driverRegulations",
					this
				);

				this.getView().addDependent(this._oEUDialog);
			}

			this._oEUDialog.open();
		},

		_loadEURegulationData: function () {
			var oModel = this.getView().getModel("eu");

			if (!oModel) {
				oModel = new JSONModel({
					editMode: false,
					REGULATION_ID: "EU561",
					COUNTRY_CODE: "EU",
					REGULATION_VERSION: "561/2006",
					MAX_DAILY_DRIVING_HRS: 9,
					EXTENDED_DAILY_HRS: 10,
					MAX_WEEKLY_HRS: 56,
					MAX_FORTNIGHT_HRS: 90,
					BREAK_AFTER_HRS: 4.5,
					BREAK_DURATION_MIN: 45,
					DAILY_REST_HRS: 11,
					REDUCED_DAILY_REST_HRS: 9,
					WEEKLY_REST_HRS: 45,
					MAX_CONSEC_WORK_DAYS: 6,
					ACTIVE: true,
					VALID_FROM: "2026-01-01",
					VALID_TO: "9999-12-31"
				});

				this.getView().setModel(oModel, "eu");
			}
		},

		onCreateEURegulation: function () {
			var oModel = this.getView().getModel("eu");
			oModel.setProperty("/editMode", true);
			MessageToast.show("New regulation version ready for editing");
		},

		onEditEURegulation: function () {
			var oModel = this.getView().getModel("eu");
			oModel.setProperty("/editMode", true);
		},

		onCloseEURegulation: function () {
			this._oEUDialog.close();
		},

		onSaveEURegulation: function () {
			var oModel = this.getView().getModel("eu");
			var oData =
				this.getView()
					.getModel("eu")
					.getData();

			// OData create/update call

			MessageToast.show(
				"Driver Regulation Configuration Saved..."
			);
			oModel.setProperty("/editMode", false);
		},

		onOpenZoneSettings: function () {

			if (!this._oZoneSettingsDialog) {

				this._oZoneSettingsDialog = new sap.m.Dialog({
					title: "Zone Settings",
					contentWidth: "450px",
					draggable: true,
					resizable: true,
					ShowAvailability: true,
					ShowFOs: true,
					ShowDrivers: true,
					ShowRestBreaks: true,
					ShowBirdEye: true,
					TimeZone: "CET",

					content: [
						new sap.m.VBox({
							class: "sapUiMediumMargin",
							items: [

								new sap.m.Label({
									text: "Time Zone"
								}),

								new sap.m.Select("zoneSelect", {
									selectedKey: "IST",
									items: [
										new sap.ui.core.Item({
											key: "IST",
											text: "India (IST)"
										}),
										new sap.ui.core.Item({
											key: "UTC",
											text: "UTC"
										}),
										new sap.ui.core.Item({
											key: "EST",
											text: "US Eastern"
										})
									]
								}),

								new sap.m.CheckBox("cbAvailability", {
									text: "Show Availability",
									selected: true
								}),

								new sap.m.CheckBox("cbFreightOrders", {
									text: "Show Freight Orders",
									selected: true
								}),

								new sap.m.CheckBox("cbDrivers", {
									text: "Show Drivers",
									selected: true
								}),

								new sap.m.CheckBox("cbBirdEye", {
									text: "Enable Bird Eye View",
									selected: true
								})
							]
						})
					],

					beginButton: new sap.m.Button({
						text: "Save",
						type: "Emphasized",
						press: this.onSaveZoneSettings.bind(this)
					}),

					endButton: new sap.m.Button({
						text: "Cancel",
						press: function () {
							this._oZoneSettingsDialog.close();
						}.bind(this)
					})
				});

				this.getView().addDependent(this._oZoneSettingsDialog);
			}

			this._oZoneSettingsDialog.open();
		},
		onSaveZoneSettings: function () {

			var oSettings = {
				zone: sap.ui.getCore().byId("zoneSelect").getSelectedKey(),
				showAvailability: sap.ui.getCore().byId("cbAvailability").getSelected(),
				showFreightOrders: sap.ui.getCore().byId("cbFreightOrders").getSelected(),
				showDrivers: sap.ui.getCore().byId("cbDrivers").getSelected(),
				birdEye: sap.ui.getCore().byId("cbBirdEye").getSelected()
			};

			localStorage.setItem(
				"DispatcherZoneSettings",
				JSON.stringify(oSettings)
			);

			sap.m.MessageToast.show("Settings Saved");
			this._oZoneSettingsDialog.close();
			this._applyZoneSettings(oSettings);
		},

		_applyZoneSettings: function (oSettings) {

			if (!oSettings) {
				return;
			}

			console.log("Zone Settings:", oSettings);

			// Save timezone separately for _getDateInZone()
			localStorage.setItem(
				"DispatcherZone",
				oSettings.zone || "IST"
			);

			var oFreightOrder = this.byId("FreightOrder");
			var oDriver = this.byId("Driver");
			var oTruck = this.byId("Truck");

			// Show / Hide Freight Orders
			if (oFreightOrder) {
				oFreightOrder.setVisible(
					oSettings.showFreightOrders !== false
				);
			}

			// Show / Hide Drivers
			if (oDriver) {
				oDriver.setVisible(
					oSettings.showDrivers !== false
				);
			}

			// Show / Hide Truck Availability
			if (oTruck) {
				oTruck.setVisible(
					oSettings.showAvailability !== false
				);
			}

			// Bird Eye View
			[oFreightOrder, oDriver, oTruck]
				.filter(Boolean)
				.forEach(function (oChart) {
					if (oChart.setShowBirdEye) {
						oChart.setShowBirdEye(
							!!oSettings.birdEye
						);
					}
				});

			// Recalculate horizon in selected timezone
			var oFromDate = this._getDateInZone(-2);
			var oToDate = this._getDateInZone(3);

			this._updateHorizon(
				oFromDate,
				oToDate
			);

			// Optional reload data so dates appear in selected zone
			this.onLoadData();
		},

		_initP13n: function () {

			var oTable = this.byId("FreightOrder").getTable();

			this._oMetadataHelper = new MetadataHelper([
				{
					key: "id",
					label: "Freight Order"
				},
				{
					key: "Veh_id",
					label: "Vehicle"
				},
				{
					key: "driver_id",
					label: "Driver"
				},
				{
					key: "Departure_Time",
					label: "Departure"
				},
				{
					key: "Arrival_Time",
					label: "Arrival"
				}
			]);

			Engine.getInstance().register(
				oTable,
				{
					helper: this._oMetadataHelper,
					controller: {
						Columns: new SelectionController({
							targetAggregation: "columns",
							control: oTable
						})
					}
				}
			);

		},
		onOpenP13n: function () {

			var oTable = this.byId("FreightOrder").getTable();

			Engine.getInstance().show(
				oTable,
				["Columns"],
				{
					title: "Personalization",
					source: this.byId("btnP13n")
				}
			);

		},
		_parseYYYYMMDD: function (sDate) {
			if (
				typeof sDate !== "string" ||
				!/^\d{8}$/.test(sDate)
			) {
				return null;
			}

			var iYear = Number(sDate.substring(0, 4));
			var iMonth = Number(sDate.substring(4, 6)) - 1;
			var iDay = Number(sDate.substring(6, 8));

			return new Date(
				iYear,
				iMonth,
				iDay,
				0,
				0,
				0,
				0
			);
		},

		_dateWithSeconds: function (
			oBaseDate,
			iSeconds
		) {
			var oDate = new Date(oBaseDate);

			oDate.setHours(0, 0, 0, 0);
			oDate.setSeconds(iSeconds);

			return oDate;
		},

		_formatDateKey: function (oDate) {
			return [
				oDate.getFullYear(),
				String(
					oDate.getMonth() + 1
				).padStart(2, "0"),
				String(
					oDate.getDate()
				).padStart(2, "0")
			].join("");
		},
		_getShiftWorkingDays: function (
			sShiftSequence,
			aCalendarDays
		) {
			/*
			* JavaScript weekday numbers:
			* Sunday = 0
			* Monday = 1
			* Tuesday = 2
			* Wednesday = 3
			* Thursday = 4
			* Friday = 5
			* Saturday = 6
			*/

			var mWeekdays = {
				SUN: 0,
				MON: 1,
				TUE: 2,
				WED: 3,
				THU: 4,
				FRI: 5,
				SAT: 6
			};

			var sSequence =
				String(sShiftSequence || "")
					.toUpperCase();

			/*
			* "MON FRI" is interpreted as a range,
			* Monday through Friday.
			*/
			if (
				sSequence.includes("MON") &&
				sSequence.includes("FRI")
			) {
				return [1, 2, 3, 4, 5];
			}

			var aDays = [];

			Object.keys(mWeekdays).forEach(
				function (sDay) {
					if (sSequence.includes(sDay)) {
						aDays.push(mWeekdays[sDay]);
					}
				}
			);

			/*
			* If no weekday was found, use calendarDays
			* where possible.
			*/
			if (
				aDays.length === 0 &&
				Array.isArray(aCalendarDays)
			) {
				aCalendarDays.forEach(function (oDay) {
					if (
						!oDay ||
						typeof oDay !== "object"
					) {
						return;
					}

					var sDayName = String(
						oDay.day ||
						oDay.dayName ||
						oDay.weekDay ||
						oDay.weekday ||
						""
					).substring(0, 3).toUpperCase();

					var bWorkingDay =
						oDay.workingDay !== false &&
						oDay.isWorkingDay !== false &&
						oDay.available !== false;

					if (
						bWorkingDay &&
						mWeekdays[sDayName] !== undefined
					) {
						aDays.push(
							mWeekdays[sDayName]
						);
					}
				});
			}

			/*
			* Safe default: Monday through Friday.
			*/
			return aDays.length > 0
				? Array.from(new Set(aDays))
				: [1, 2, 3, 4, 5];
		},

		_createShiftTooltip: function (
			oDriver,
			oShift,
			oStartDate,
			oEndDate
		) {
			var sDriverName = [
				oDriver.firstName,
				oDriver.lastName
			]
				.filter(Boolean)
				.join(" ");

			var fnFormat = function (oDate) {
				return oDate.toLocaleString();
			};

			return [
				"Driver: " +
				(
					sDriverName ||
					oDriver.driverID
				),

				"Shift: " +
				(
					oShift.shiftDefinition ||
					""
				),

				"Start: " + fnFormat(oStartDate),
				"End: " + fnFormat(oEndDate)
			].join("\n");
		},

		_addFOShapeToResource: function (
			sResourceType,
			sTargetId,
			oFreightOrder,
			sNewDeparture,
			sNewArrival
		) {

			var oModel = this.getView().getModel("data");

			var sCollection =
				sResourceType === "Driver"
					? "/Drivers"
					: "/Resources";

			var aItems = oModel.getProperty(sCollection) || [];

			var oTarget = aItems.find(function (oItem) {
				return (
					oItem.driverID === sTargetId ||
					oItem.resourceId === sTargetId
				);
			});

			if (!oTarget) {
				return;
			}

			oTarget.FOShapes = oTarget.FOShapes || [];

			oTarget.FOShapes.push({
				shapeId: oFreightOrder.id,
				Title: oFreightOrder.id,
				StartTime: sNewDeparture,
				EndTime: sNewArrival
			});

			oModel.refresh(true);
		},

		_getDateInZone: function (iOffsetDays) {

			const mZones = {
				CET: "Europe/Berlin",
				IST: "Asia/Kolkata",
				UTC: "UTC",
				EST: "America/New_York"
				
			};

			const sZone = localStorage.getItem("DispatcherZone")
				|| "IST";

			const oDate = new Date(
				new Date().toLocaleString("en-US", {
					timeZone: mZones[sZone]
				})
			);

			oDate.setDate(oDate.getDate() + iOffsetDays);

			return oDate;
		},
		onUnassignFO: function (oFreightOrder, sResourceType, sTargetId) {

			sap.m.MessageBox.confirm(
				"Do you want to unassign Freight Order " +
				oFreightOrder.id + "?",
				{
					title: "Confirm Unassignment",

					actions: [
						sap.m.MessageBox.Action.OK,
						sap.m.MessageBox.Action.CANCEL
					],

					emphasizedAction:
						sap.m.MessageBox.Action.OK,

					onClose: function (sAction) {

						if (
							sAction !==
							sap.m.MessageBox.Action.OK
						) {
							return;
						}

						var oModel =
							this.getView().getModel("data");

						// Remove assignment
						if (sResourceType === "Driver") {

							oFreightOrder.driverID = "";

						} else if (
							sResourceType === "Vehicle"
						) {

							oFreightOrder.Veh_id = "";
							oFreightOrder.veh_regno = "";
						}

						// Remove shape from target row
						var sCollection =
							sResourceType === "Driver"
								? "/Drivers"
								: "/Resources";

						var aItems =
							oModel.getProperty(
								sCollection
							) || [];

						var oTarget =
							aItems.find(function (oItem) {

								return (
									oItem.driverID === sTargetId ||
									oItem.resourceId === sTargetId
								);

							});

						if (oTarget) {

							oTarget.FOShapes =
								(oTarget.FOShapes || [])
									.filter(function (oShape) {

										return (
											oShape.shapeId !==
											oFreightOrder.id
										);

									});
						}

						this._addChangedFreightOrder({
							IvTorKey:
								oFreightOrder
									.transportationOrderUUID
									.replace(/-/g, "")
									.toUpperCase(),

							IvTorID:
								oFreightOrder.id,

							IvNewDepartureDatetime:
								this._toBackendDateTime(
									oFreightOrder.Departure_Time
								),

							IvDriverId:
								sResourceType === "Driver"
									? ""
									: oFreightOrder.driverID,

							IvVehicleResId:
								sResourceType === "Vehicle"
									? ""
									: oFreightOrder.Veh_id
						});

						oModel.refresh(true);

						this.byId("btnSave")
							.setEnabled(true);

						sap.m.MessageToast.show(
							"FO " +
							oFreightOrder.id +
							" unassigned successfully"
						);

					}.bind(this)
				}
			);
		},
		press: function () {

			this.onUnassignFO(
				oFreightOrder,
				"Vehicle",
				oFreightOrder.Veh_id
			);

		}.bind(this)


	});
});
