export var Role;
(function (Role) {
    Role["VENDOR"] = "VENDOR";
    Role["HOST"] = "HOST";
    Role["ADMIN"] = "ADMIN";
})(Role || (Role = {}));
export var BoothType;
(function (BoothType) {
    BoothType["AVAILABLE"] = "AVAILABLE";
    BoothType["RESERVED"] = "RESERVED";
    BoothType["SOLD"] = "SOLD";
    BoothType["LOCKED"] = "LOCKED";
})(BoothType || (BoothType = {}));
export var ActionType;
(function (ActionType) {
    ActionType["HOST_APPROVAL"] = "HOST_APPROVAL";
})(ActionType || (ActionType = {}));
export var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "DRAFT";
    EventStatus["PUBLISHED"] = "PUBLISHED";
    EventStatus["CLOSED"] = "CLOSED";
    EventStatus["CANCELLED"] = "CANCELLED";
})(EventStatus || (EventStatus = {}));
export var EmailLogCategory;
(function (EmailLogCategory) {
    EmailLogCategory["VERIFY_EMAIL"] = "VERIFY_EMAIL";
    EmailLogCategory["RESET_PASSWORD"] = "RESET_PASSWORD";
    EmailLogCategory["BOOKING_CONFIRMED"] = "BOOKING_CONFIRMED";
    EmailLogCategory["HOST_APPROVE"] = "HOST_APPROVE";
})(EmailLogCategory || (EmailLogCategory = {}));
export var AdminRequestStatus;
(function (AdminRequestStatus) {
    AdminRequestStatus["PENDING"] = "PENDING";
    AdminRequestStatus["APPROVED"] = "APPROVED";
    AdminRequestStatus["REJECTED"] = "REJECTED";
})(AdminRequestStatus || (AdminRequestStatus = {}));
//# sourceMappingURL=types.js.map