import { includes as _includes } from "lodash";
import * as moment from "moment";
import * as momentTz from "moment-timezone";
import { ActivityStatusModel, StatusDetailModel } from "app/model/Common";
import { ManageVehicleStatusModel } from "app/model/ManageVehicle";
import { SecondToTimePipe } from './utility.pipe';


export const storageKeys = {
    groupEditorId: 'groupId'
}

// color list for fleetlog
export const colors = [
    '#0a5eb6',
    '#f75900',
    '#7406b1',
    '#e7003e',
    '#2c6f00',
    '#8F1D21'
]

// bind function to getBounds for polyline and polygon
export function boundShape(google) {
    google.maps.Polyline.prototype.getBounds = function () {
        var bounds = new google.maps.LatLngBounds();
        this.getPath().forEach(function (item, index) {
            bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
        });
        return bounds;
    };
    google.maps.Polygon.prototype.getBounds = function () {
        var bounds = new google.maps.LatLngBounds();
        this.getPath().forEach(function (item, index) {
            bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
        });
        return bounds;
    };
}

// map props to display
export const mapOptions = {
    center: { lat: -33.868820, lng: 151.209296 },
    zoom: 8
};

// validate guid
export function isUUID(id) {
    var pattern = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
    return pattern.test(id);
}

// tab list of manage vehicle tab in fleet
export const manage_vehicle_tab = {
    vehicle_details: 'details',
    odometer_calibration: 'odometer',
    status: 'status',
}

// change input border color on checking of duplicate value
export function valDuplicateInputStyle(isDuplicate = null) {
    let color = '';
    if (isDuplicate == true)
        color = 'Red';
    else if (isDuplicate == false)
        color = 'Green';
    return { 'border-color': color };
}

// display errors based on given input value
export const errors = {
    label: errorLabelClass,
    input: errorInputClass,
    required: errorRequired,
    duplicate: errorDuplicate,
    incorrect: errorIncorrect,
    pattern: errorPattern
}

function errorLabelClass(formName, fieldName) {
    return (formName.submitted || fieldName.dirty) && fieldName.invalid ? 'err-title' : '';
}
function errorInputClass(formName, fieldName) {
    return (formName.submitted || fieldName.dirty) && fieldName.invalid ? 'err-input' : '';
}
function errorRequired(formName, fieldName) {
    return (formName.submitted || fieldName.dirty) && fieldName.errors && fieldName.errors['required'];
}
function errorDuplicate(formName, fieldName, isDuplicate) {
    return !((formName.submitted || fieldName.dirty) && fieldName.errors && fieldName.errors['required']) && isDuplicate == true;
}
function errorIncorrect(formName, fieldName) {
    return (formName.submitted || fieldName.dirty) && fieldName.errors && fieldName.errors['incorrect'];
}
function errorPattern(formName, fieldName) {
    return (formName.submitted || fieldName.dirty) && fieldName.errors && fieldName.errors['pattern'];
}

// convert datetime to timezone format
export function dtToTimezone(dt, region) {
    if (typeof (dt) == 'string' && _includes(dt, 'T') && !_includes(dt, 'Z'))
        dt = dt + 'Z';
    return momentTz.tz(dt, region || 'Australia/Sydney').format('MM/DD/YYYY h:mm:ss a');
}

// vehicle activity status
export const activityStatus = {
    Alerting: { Key: 'Alerting', Status: "Alerting", Description: "Vehicle is Alerting", ColorCode: "Red" },
    Inactive: { Key: 'Inactive', Status: "Inactive", Description: "Vehicle is Inactive for over 24 hours", ColorCode: "Black" },
    DataNotReceived: { Key: 'DataNotReceived', Status: "Data Not Received", Description: "Vehicle has not had data sent to platform for extended period (over 2 Hours)", ColorCode: "#ffd100" },
    Idle: { Key: 'Idle', Status: "Idle", Description: "Vehicle is Idle (Not moving)", ColorCode: "Blue" },
    Moving: { Key: 'Moving', Status: "Moving", Description: "Vehicle is Moving", ColorCode: "Green" },
    Offline: { Key: 'Offline', Status: "Offline", Description: "Vehicle is Offline", ColorCode: "Gray" }
}

// get vehicle status based on last received msg and speed
export function getStatus(statusDetail: StatusDetailModel, fullStatus: boolean = false) {

    let currentDt = moment(dtToTimezone(moment.utc(), statusDetail.TimezoneRegion));
    let lastUpdateDt = moment(dtToTimezone(statusDetail.UpdateTimeUTC, statusDetail.TimezoneRegion));
    let diff = currentDt.diff(lastUpdateDt, 'seconds');

    let status: ActivityStatusModel = new ActivityStatusModel();
    if (diff > 86400) {
        // Status - Inactive > Over 24 hr
        status = activityStatus.Inactive;
    }
    else if (diff > 7200) {
        // Status - DataNotReceived > Over 2 hr
        status = activityStatus.DataNotReceived;
    }
    else if (statusDetail.Speed == 0) {
        // Status - Idle
        status = activityStatus.Idle;
    }
    else {
        // Status - Moving
        status = activityStatus.Moving;
    }

    if (!fullStatus)
        return status;

    let vehicleStatus: ManageVehicleStatusModel = new ManageVehicleStatusModel();
    vehicleStatus = {
        AcitvityStatus: status,
        DisplayContent: {
            Status: status.Description,
            LastUpdate: "Last update " + moment(lastUpdateDt).format("MMMM Do YYYY, h:mm:ss a"),
            Frequency: (activityStatus.Moving.Key == status.Key ? "Moving" : "Stopped") + ": send data every hour",
            UpdateLocationStatus: (status.Status == activityStatus.Idle.Status || status.Status == activityStatus.Moving.Status) ?
                "Successfully received location " + moment(lastUpdateDt).from(currentDt) :
                "Vehicle failed to update location for more than " + moment(lastUpdateDt).from(currentDt)
        }
    };
    return vehicleStatus;
}

declare var google: any;
// get cords from string
export function getLatLng(cords: string) {
    var cord = cords.split(',');
    return new google.maps.LatLng(cord[0], cord[1]);
}

// calculate the bounds based on center cord and size of shape
export function calcBounds(center, size) {
    var n = new google.maps.geometry.spherical.computeOffset(center, size.height / 2, 0).lat(),
        s = new google.maps.geometry.spherical.computeOffset(center, size.height / 2, 180).lat(),
        e = new google.maps.geometry.spherical.computeOffset(center, size.width / 2, 90).lng(),
        w = new google.maps.geometry.spherical.computeOffset(center, size.width / 2, 270).lng();
    return new google.maps.LatLngBounds(new google.maps.LatLng(s, w), new google.maps.LatLng(n, e))
}

// validate the time value
export function validateTime(val) {
    if (_includes(val, '_'))
        return false;

    let times = val.split(':');
    let hour = parseInt(times[0]);
    let min = parseInt(times[1]);

    return hour < 24 && min < 60;
}

// static list of from times
export const fromTimes = [
    { text: "12:00 am", value: "00:00:00" },
    { text: "1:00 am", value: "01:00:00" },
    { text: "2:00 am", value: "02:00:00" },
    { text: "3:00 am", value: "03:00:00" },
    { text: "4:00 am", value: "04:00:00" },
    { text: "5:00 am", value: "05:00:00" },
    { text: "6:00 am", value: "06:00:00" },
    { text: "7:00 am", value: "07:00:00" },
    { text: "8:00 am", value: "08:00:00" },
    { text: "9:00 am", value: "09:00:00" },
    { text: "10:00 am", value: "10:00:00" },
    { text: "11:00 am", value: "11:00:00" },
    { text: "12:00 pm", value: "12:00:00" },
    { text: "1:00 pm", value: "13:00:00" },
    { text: "2:00 pm", value: "14:00:00" },
    { text: "3:00 pm", value: "15:00:00" },
    { text: "4:00 pm", value: "16:00:00" },
    { text: "5:00 pm", value: "17:00:00" },
    { text: "6:00 pm", value: "18:00:00" },
    { text: "7:00 pm", value: "19:00:00" },
    { text: "8:00 pm", value: "20:00:00" },
    { text: "9:00 pm", value: "21:00:00" },
    { text: "10:00 pm", value: "22:00:00" },
    { text: "11:00 pm", value: "23:00:00" }
];

// static list of to times
export const toTimes = [
    { text: "12:59 am", value: "00:59:59" },
    { text: "1:59 am", value: "01:59:59" },
    { text: "2:59 am", value: "02:59:59" },
    { text: "3:59 am", value: "03:59:59" },
    { text: "4:59 am", value: "04:59:59" },
    { text: "5:59 am", value: "05:59:59" },
    { text: "6:59 am", value: "06:59:59" },
    { text: "7:59 am", value: "07:59:59" },
    { text: "8:59 am", value: "08:59:59" },
    { text: "9:59 am", value: "09:59:59" },
    { text: "10:59 am", value: "10:59:59" },
    { text: "11:59 am", value: "11:59:59" },
    { text: "12:59 pm", value: "12:59:59" },
    { text: "1:59 pm", value: "13:59:59" },
    { text: "2:59 pm", value: "14:59:59" },
    { text: "3:59 pm", value: "15:59:59" },
    { text: "4:59 pm", value: "16:59:59" },
    { text: "5:59 pm", value: "17:59:59" },
    { text: "6:59 pm", value: "18:59:59" },
    { text: "7:59 pm", value: "19:59:59" },
    { text: "8:59 pm", value: "20:59:59" },
    { text: "9:59 pm", value: "21:59:59" },
    { text: "10:59 pm", value: "22:59:59" },
    { text: "11:59 pm", value: "23:59:59" }
];