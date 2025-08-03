"use strict";
/**
 * MQTT模块类型定义
 * 基于Serial-Studio MQTT::Client实现的TypeScript版本
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerVerifyMode = exports.SSLProtocol = exports.QoSLevel = exports.MQTTProtocolVersion = exports.MQTTClientMode = exports.MQTTConnectionState = void 0;
var MQTTConnectionState;
(function (MQTTConnectionState) {
    MQTTConnectionState[MQTTConnectionState["Disconnected"] = 0] = "Disconnected";
    MQTTConnectionState[MQTTConnectionState["Connecting"] = 1] = "Connecting";
    MQTTConnectionState[MQTTConnectionState["Connected"] = 2] = "Connected";
    MQTTConnectionState[MQTTConnectionState["Disconnecting"] = 3] = "Disconnecting";
    MQTTConnectionState[MQTTConnectionState["Reconnecting"] = 4] = "Reconnecting";
})(MQTTConnectionState = exports.MQTTConnectionState || (exports.MQTTConnectionState = {}));
var MQTTClientMode;
(function (MQTTClientMode) {
    MQTTClientMode[MQTTClientMode["Subscriber"] = 0] = "Subscriber";
    MQTTClientMode[MQTTClientMode["Publisher"] = 1] = "Publisher";
})(MQTTClientMode = exports.MQTTClientMode || (exports.MQTTClientMode = {}));
var MQTTProtocolVersion;
(function (MQTTProtocolVersion) {
    MQTTProtocolVersion[MQTTProtocolVersion["MQTT_3_1"] = 3] = "MQTT_3_1";
    MQTTProtocolVersion[MQTTProtocolVersion["MQTT_3_1_1"] = 4] = "MQTT_3_1_1";
    MQTTProtocolVersion[MQTTProtocolVersion["MQTT_5_0"] = 5] = "MQTT_5_0";
})(MQTTProtocolVersion = exports.MQTTProtocolVersion || (exports.MQTTProtocolVersion = {}));
var QoSLevel;
(function (QoSLevel) {
    QoSLevel[QoSLevel["AtMostOnce"] = 0] = "AtMostOnce";
    QoSLevel[QoSLevel["AtLeastOnce"] = 1] = "AtLeastOnce";
    QoSLevel[QoSLevel["ExactlyOnce"] = 2] = "ExactlyOnce";
})(QoSLevel = exports.QoSLevel || (exports.QoSLevel = {}));
var SSLProtocol;
(function (SSLProtocol) {
    SSLProtocol["TLS_1_2"] = "TLSv1.2";
    SSLProtocol["TLS_1_3"] = "TLSv1.3";
    SSLProtocol["ANY_PROTOCOL"] = "any";
})(SSLProtocol = exports.SSLProtocol || (exports.SSLProtocol = {}));
var PeerVerifyMode;
(function (PeerVerifyMode) {
    PeerVerifyMode["None"] = "none";
    PeerVerifyMode["QueryPeer"] = "query";
    PeerVerifyMode["VerifyPeer"] = "verify";
    PeerVerifyMode["AutoVerifyPeer"] = "auto";
})(PeerVerifyMode = exports.PeerVerifyMode || (exports.PeerVerifyMode = {}));
//# sourceMappingURL=types.js.map