/*
Library is developed by: PALLOB KUMAR GAIN
Date: 4 Jan, 2023
Last Modified: 14 Jan,2023
Mercury10

ABOUT: it is the library for controlling Roboclaw motor controller. 
datasheet: https://downloads.basicmicro.com/docs/roboclaw_user_manual.pdf
//Reference: https://github.com/basicmicro/roboclaw_arduino_library


*/
/*
this hold the all commands in a chain and execute one by one
*/

const serialSystem = require('./serialSystem.js');
const tcpSerialDevice = require('./tcpSerialDevice.js');
const uartSerialDevice = require('./uartSerialDevice.js');

const M1FORWARD = 0; //Drive Forward Motor 1
//Send: [Address, 0, Value, CRC(2 bytes)]
//Receive: [0xFF]
//Note: info get from user_manual.pdf
const M1BACKWARD = 1; //Drive Backwards Motor 1
// Send: [Address, 1, Value, CRC(2 bytes)]
// Receive: [0xFF]

const SETMINMB = 2;
const SETMAXMB = 3;

const M2FORWARD = 4; //Drive Forward Motor 2
const M2BACKWARD = 5; //Drive Backwards Motor 2

const M17BIT = 6;
const M27BIT = 7;

const MIXEDFORWARD = 8;
const MIXEDBACKWARD = 9;
const MIXEDRIGHT = 10;
const MIXEDLEFT = 11;
const MIXEDFB = 12;
const MIXEDLR = 13;

const GETM1ENC = 16;
const GETM2ENC = 17;

const GETM1SPEED = 18;
const GETM2SPEED = 19;
//Send: [Address, 19 | 18]
//Receive: [Value(2 bytes), CRC(2 bytes)]
const RESETENC = 20; //reset encoder
const GETVERSION = 21;
const SETM1ENCCOUNT = 22;
const SETM2ENCCOUNT = 23;

const GETMBATT = 24;
const GETLBATT = 25;
const SETMINLB = 26;
const SETMAXLB = 27;
const SETM1PID = 28;
const SETM2PID = 29;
const GETM1ISPEED = 30;
const GETM2ISPEED = 31;
const M1DUTY = 32;
const M2DUTY = 33;
const MIXEDDUTY = 34;
const M1SPEED = 35;
const M2SPEED = 36;
const MIXEDSPEED = 37;
const M1SPEEDACCEL = 38;
const M2SPEEDACCEL = 39;
const MIXEDSPEEDACCEL = 40;
const M1SPEEDDIST = 41;
const M2SPEEDDIST = 42;
const MIXEDSPEEDDIST = 43;

const M1SPEEDACCELDIST = 44;
const M2SPEEDACCELDIST = 45;
const MIXEDSPEEDACCELDIST = 46;
const GETBUFFERS = 47;
const GETPWMS = 48;

const GETCURRENTS = 49;
//Send: [Address, 49]
//Receive: [M1 Current(2 bytes), M2 Currrent(2 bytes), CRC(2 bytes)]
//10ma increments.
//dividing the value by 100.

const MIXEDSPEED2ACCEL = 50;
const MIXEDSPEED2ACCELDIST = 51;
const M1DUTYACCEL = 52;
const M2DUTYACCEL = 53;
const MIXEDDUTYACCEL = 54;
const READM1PID = 55;
const READM2PID = 56;
const SETMAINVOLTAGES = 57;
const SETLOGICVOLTAGES = 58;
const GETMINMAXMAINVOLTAGES = 59;
const GETMINMAXLOGICVOLTAGES = 60;
const SETM1POSPID = 61;
const SETM2POSPID = 62;
const READM1POSPID = 63;
const READM2POSPID = 64;

const DRIVEM1POSITION = 65;
const DRIVEM2POSITION = 66;
/*
Send: [Address, 65, Accel(4 bytes), Speed(4 Bytes), Deccel(4 bytes),
Position(4 Bytes), Buffer, CRC(2 bytes)]
Receive: [0xFF]
Note: The acceleration is measured in speed increase per second. An acceleration value of 12,000
QPPS with a speed of 12,000 QPPS would accelerate a motor from 0 to 12,000 QPPS in 1
second. Another example would be an acceleration value of 24,000 QPPS and a speed value of
12,000 QPPS would accelerate the motor to 12,000 QPPS in 0.5 seconds.
*/

const MIXEDSPEEDACCELDECCELPOS = 67;
const SETM1DEFAULTACCEL = 68;
const SETM2DEFAULTACCEL = 69;
const SETPINFUNCTIONS = 74;
const GETPINFUNCTIONS = 75;
const SETDEADBAND = 76;
const GETDEADBAND = 77;
const GETENCODERS = 78;
const GETISPEEDS = 79;
const RESTOREDEFAULTS = 80;


const GETTEMP = 82;
//Send: [Address, 82]
//Receive: [Temperature(2 bytes), CRC(2 bytes)]
//Value returned is in 10ths of degrees.
//need to divided by 10 to get the real value.

const GETTEMP2 = 83;	//Only valid on some models

const READSTATUS = 90;
/*
Send: [Address, 90]
Receive: [Status(2 bytes), CRC(2 bytes)]
table: refer to roboclaw_user_manual.pdf [page:74]
*/

const GETENCODERMODE = 91;
const SETM1ENCODERMODE = 92;
const SETM2ENCODERMODE = 93;
const WRITENVM = 94;
const READNVM = 95;	//Reloads values from Flash into Ram
const SETCONFIG = 98;
const GETCONFIG = 99;

const SETM1MAXCURRENT = 133;
const SETM2MAXCURRENT = 134;
/*
Send: [Address, 134, MaxCurrent(4 bytes), 0, 0, 0, 0, CRC(2 bytes)]
Receive: [0xFF]
*/


const GETM1MAXCURRENT = 135;
const GETM2MAXCURRENT = 136;
/*
Send: [Address, 135]
Receive: [MaxCurrent(4 bytes), MinCurrent(4 bytes), CRC(2 bytes)]
*/

const SETPWMMODE = 148;
const GETPWMMODE = 149;
const FLAGBOOTLOADER = 255;


const command_ids_name = {
    [M1FORWARD]: "M1FORWARD",
    [SETMINMB]: "SETMINMB",
    [SETMAXMB]: "SETMAXMB",
    [M2FORWARD]: "M2FORWARD",
    [M2BACKWARD]: "M2BACKWARD",
    [M17BIT]: "M17BIT",
    [M27BIT]: "M27BIT",
    [MIXEDFORWARD]: "MIXEDFORWARD",
    [MIXEDBACKWARD]: "MIXEDBACKWARD",
    [MIXEDRIGHT]: "MIXEDRIGHT",
    [MIXEDLEFT]: "MIXEDLEFT",
    [MIXEDFB]: "MIXEDFB",
    [MIXEDLR]: "MIXEDLR",
    [GETM1ENC]: "GETM1ENC",
    [GETM2ENC]: "GETM2ENC",
    [GETM1SPEED]: "GETM1SPEED",
    [GETM2SPEED]: "GETM2SPEED",
    [RESETENC]: "RESETENC",
    [GETVERSION]: "GETVERSION",
    [SETM1ENCCOUNT]: "SETM1ENCCOUNT",
    [SETM2ENCCOUNT]: "SETM2ENCCOUNT",
    [GETMBATT]: "GETMBATT",
    [GETLBATT]: "GETLBATT",
    [SETMINLB]: "SETMINLB",
    [SETMAXLB]: "SETMAXLB",
    [SETM1PID]: "SETM1PID",
    [SETM2PID]: "SETM2PID",
    [GETM1ISPEED]: "GETM1ISPEED",
    [GETM2ISPEED]: "GETM2ISPEED",
    [M1DUTY]: "M1DUTY",
    [M2DUTY]: "M2DUTY",
    [MIXEDDUTY]: "MIXEDDUTY",
    [M1SPEED]: "M1SPEED",
    [M2SPEED]: "M2SPEED",
    [MIXEDSPEED]: "MIXEDSPEED",
    [M1SPEEDACCEL]: "M1SPEEDACCEL",
    [M2SPEEDACCEL]: "M2SPEEDACCEL",
    [MIXEDSPEEDACCEL]: "MIXEDSPEEDACCEL",
    [M1SPEEDDIST]: "M1SPEEDDIST",
    [M2SPEEDDIST]: "M2SPEEDDIST",
    [MIXEDSPEEDDIST]: "MIXEDSPEEDDIST",
    [M1SPEEDACCELDIST]: "M1SPEEDACCELDIST",
    [M2SPEEDACCELDIST]: "M2SPEEDACCELDIST",
    [MIXEDSPEEDACCELDIST]: "MIXEDSPEEDACCELDIST",
    [GETBUFFERS]: "GETBUFFERS",
    [GETPWMS]: "GETPWMS",
    [GETCURRENTS]: "GETCURRENTS",
    [MIXEDSPEED2ACCEL]: "MIXEDSPEED2ACCEL",
    [MIXEDSPEED2ACCELDIST]: "MIXEDSPEED2ACCELDIST",
    [M1DUTYACCEL]: "M1DUTYACCEL",
    [M2DUTYACCEL]: "M2DUTYACCEL",
    [MIXEDDUTYACCEL]: "MIXEDDUTYACCEL",
    [READM1PID]: "READM1PID",
    [READM2PID]: "READM2PID",
    [SETMAINVOLTAGES]: "SETMAINVOLTAGES",
    [SETLOGICVOLTAGES]: "SETLOGICVOLTAGES",
    [GETMINMAXMAINVOLTAGES]: "GETMINMAXMAINVOLTAGES",
    [GETMINMAXLOGICVOLTAGES]: "GETMINMAXLOGICVOLTAGES",
    [SETM1POSPID]: "SETM1POSPID",
    [SETM2POSPID]: "SETM2POSPID",
    [READM1POSPID]: "READM1POSPID",
    [READM2POSPID]: "READM2POSPID",
    [DRIVEM1POSITION]: "DRIVEM1POSITION",
    [DRIVEM2POSITION]: "DRIVEM2POSITION",
    [MIXEDSPEEDACCELDECCELPOS]: "MIXEDSPEEDACCELDECCELPOS",
    [SETM1DEFAULTACCEL]: "SETM1DEFAULTACCEL",
    [SETM2DEFAULTACCEL]: "SETM2DEFAULTACCEL",
    [SETPINFUNCTIONS]: "SETPINFUNCTIONS",
    [GETPINFUNCTIONS]: "GETPINFUNCTIONS",
    [SETDEADBAND]: "SETDEADBAND",
    [GETDEADBAND]: "GETDEADBAND",
    [GETENCODERS]: "GETENCODERS",
    [GETISPEEDS]: "GETISPEEDS",
    [RESTOREDEFAULTS]: "RESTOREDEFAULTS",
    [GETTEMP]: "GETTEMP",
    [GETTEMP2]: "GETTEMP2",
    [READSTATUS]: "READSTATUS",
    [GETENCODERMODE]: "GETENCODERMODE",
    [SETM1ENCODERMODE]: "SETM1ENCODERMODE",
    [SETM2ENCODERMODE]: "SETM2ENCODERMODE",
    [WRITENVM]: "WRITENVM",
    [READNVM]: "READNVM",
    [SETCONFIG]: "SETCONFIG",
    [GETCONFIG]: "GETCONFIG",
    [SETM1MAXCURRENT]: "SETM1MAXCURRENT",
    [SETM2MAXCURRENT]: "SETM2MAXCURRENT",
    [GETM1MAXCURRENT]: "GETM1MAXCURRENT",
    [GETM2MAXCURRENT]: "GETM2MAXCURRENT",
    [SETPWMMODE]: "SETPWMMODE",
    [GETPWMMODE]: "GETPWMMODE",
    [FLAGBOOTLOADER]: "FLAGBOOTLOADER"
};


const COMM_TIMEOUT = 100; //timeout for serial communication is 100ms
const TASK_TRY_AMOUNT = 3; //try three time, if fails

//status bit mask
const STATUS_NORMAL_MASK = 0x0000;
const STATUS_M1_OVERCURRENT_MASK = 0x0001;
const STATUS_M2_OVERCURRENT_MASK = 0x0002;
const STATUS_ESTOP_MASK = 0x0004;
const STATUS_TEMPERATURE_ERROR_MASK = 0x0008;
const STATUS_TEMPERATURE2_ERROR_MASK = 0x0010;
const STATUS_MAIN_BATT_HIGH_ERROR_MASK = 0x0020;
const STATUS_LOGIC_BATT_HIGH_ERROR_MASK = 0x0040;
const STATUS_LOGIC_BATT_LOW_ERROR_MASK = 0x0080;
const STATUS_M1_DRIVER_FAULT_MASK = 0x0100;
const STATUS_M2_DRIVER_FAULT_MASK = 0x0200;
const STATUS_MAIN_BATT_HIGH_WARN_MASK = 0x0400;
const STATUS_MAIN_BATT_LOW_WARN_MASK = 0x0800;
const STATUS_TEMPERATURE_WARN_MASK = 0x1000;
const STATUS_TEMPERATURE2_WARN_MASK = 0x2000;
const STATUS_M1_HOME_MASK = 0x4000;
const STATUS_M2_HOME_MASK = 0x8000;

const StatusFlags = Object.freeze({
    STATUS_NORMAL_MASK,
    STATUS_M1_OVERCURRENT_MASK,
    STATUS_M2_OVERCURRENT_MASK,
    STATUS_ESTOP_MASK,
    STATUS_TEMPERATURE_ERROR_MASK,
    STATUS_TEMPERATURE2_ERROR_MASK,
    STATUS_MAIN_BATT_HIGH_ERROR_MASK,
    STATUS_LOGIC_BATT_HIGH_ERROR_MASK,
    STATUS_LOGIC_BATT_LOW_ERROR_MASK,
    STATUS_M1_DRIVER_FAULT_MASK,
    STATUS_M2_DRIVER_FAULT_MASK,
    STATUS_MAIN_BATT_HIGH_WARN_MASK,
    STATUS_MAIN_BATT_LOW_WARN_MASK,
    STATUS_TEMPERATURE_WARN_MASK,
    STATUS_TEMPERATURE2_WARN_MASK,
    STATUS_M1_HOME_MASK,
    STATUS_M2_HOME_MASK
});

const status_maker_information = {
    [STATUS_NORMAL_MASK]: { data: 'System Normal', type: 'success' },
    [STATUS_M1_OVERCURRENT_MASK]: { data: 'M1 OverCurrent Warn', type: 'warning' },
    [STATUS_M2_OVERCURRENT_MASK]: { data: 'M2 OverCurrent Warn', type: 'warning' },
    [STATUS_ESTOP_MASK]: { data: 'E-Stop', type: 'warning' },
    [STATUS_TEMPERATURE_ERROR_MASK]: { data: 'Temperature Error', type: 'error' },
    [STATUS_TEMPERATURE2_ERROR_MASK]: { data: 'Temperature2 Error', type: 'error' },
    [STATUS_MAIN_BATT_HIGH_ERROR_MASK]: { data: 'Main Battery High Error', type: 'error' },
    [STATUS_LOGIC_BATT_HIGH_ERROR_MASK]: { data: 'Logic Battery High Error', type: 'error' },
    [STATUS_LOGIC_BATT_LOW_ERROR_MASK]: { data: 'Logic Battery Low Error', type: 'error' },
    [STATUS_M1_DRIVER_FAULT_MASK]: { data: 'M1 Driver Fault', type: 'warning' },
    [STATUS_M2_DRIVER_FAULT_MASK]: { data: 'M2 Driver Fault', type: 'warning' },
    [STATUS_MAIN_BATT_HIGH_WARN_MASK]: { data: 'Main Battery High Warning', type: 'warning' },
    [STATUS_MAIN_BATT_LOW_WARN_MASK]: { data: 'Main Battery Low Warning', type: 'warning' },
    [STATUS_TEMPERATURE_WARN_MASK]: { data: 'Temperature Warning', type: 'warning' },
    [STATUS_TEMPERATURE2_WARN_MASK]: { data: 'Temperature2 Warning', type: 'warning' },
    [STATUS_M1_HOME_MASK]: { data: 'M1 Home', type: 'info' },
    [STATUS_M2_HOME_MASK]: { data: 'M2 Home', type: 'info' },
};

//pin modes
const PinModesFlags = Object.freeze({
    DEFAULT: 0x00,
    ESTOP: 0x01,
    ESTOP_LATCH: 0x81,
    VCLAMP: 0x14,
    RS485_EN: 0x24,
    ENC_TOGGLE: 0x84,
    BRAKE: 0x04,
    HOME_AUTO: 0xE2,
    HOME_USER: 0x62,
    LIMIT_FWD_AUTO: 0xF2,
    LIMIT_REV_USER: 0x72,
    LIMIT_FWD: 0x12,
    LIMIT_REV: 0x22,
    LIMIT_BOTH: 0x32,
});

class roboClaw {

    serialSystem;
    connected_serial;

    RecivedData = Buffer.from([]);
    lastCommandData = Buffer.from([]);
    crc = 0;

    //callback holder
    data_update_callback = null;
    receive_data_length_needed = 0;
    need_check_crc = false;
    data_have_crc = false;
    receive_line_end = null;
    debugFlag;

    closeCallback = [];
    errorCallback = [];
    connectCallback = [];

    task_holder = [];

    motor_driver_listening = false;
    process_task_is_busy = false;

    static getCommandName(command) {
        return command in command_ids_name ? command_ids_name[command] : command;
    }

    static getStatus(status_val) {
        let status_array = [];
        for (let [key, val] of Object.entries(status_maker_information)) {
            if (key != STATUS_NORMAL_MASK && (status_val & key) != 0) status_array.push(val);
        }

        if (status_array.length == 0 && status_val == STATUS_NORMAL_MASK) status_array.push(status_maker_information[STATUS_NORMAL_MASK]);

        return status_array;
    }

    constructor(serialSystem, debugFlag = false) {
        this.serialSystem = serialSystem;
        this.debugFlag = debugFlag;


        this.serialSystem.on('data', (data) => {
            this.updateBuffer(data);
        });

        this.serialSystem.on('close', (...args) => {

            this.stop_listening();

            this.connected_serial = null;

            for (var callback of this.closeCallback) {
                callback(...args);
            }
        });


        this.serialSystem.on('error', (...args) => {
            for (var callback of this.errorCallback) {
                callback(...args);
            }
        });

    }



    dataStreamCheckerThread() {

        // this.debugMsg(
        //     this.receive_line_end,
        //     this.receive_data_length_needed,
        //     this.RecivedData.length <= this.receive_data_length_needed,
        //     this.data_have_crc,
        //     this.RecivedData[this.RecivedData.length-3]==this.receive_line_end,
        //     this.RecivedData[this.RecivedData.length-1]==this.receive_line_end
        // );

        if (
            this.receive_data_length_needed > 0 &&
            (
                this.RecivedData.length >= this.receive_data_length_needed || (
                    this.receive_line_end !== null &&
                    this.RecivedData.length <= this.receive_data_length_needed &&
                    (
                        (this.data_have_crc && this.RecivedData[this.RecivedData.length - 3] == this.receive_line_end)
                        ||
                        (!this.data_have_crc && this.RecivedData[this.RecivedData.length - 1] == this.receive_line_end)
                    )
                )
            )
        ) {

            // this.debugMsg('-CONDITION-->');

            //console.log(RecivedData);
            //if crc match
            try {
                let needed_length = this.data_have_crc ? this.receive_data_length_needed - 2 : this.receive_data_length_needed;
                if (!this.need_check_crc || (this.need_check_crc && this.crc_match(this.RecivedData.slice(0, this.receive_data_length_needed)))) {
                    //this.debugMsg('Before extra remove:', this.RecivedData);
                    let converted = this.RecivedData.slice(0, needed_length); //unwanted remove
                    //this.debugMsg('data processing:', converted);
                    this.data_update_callback(converted);
                }
                else {
                    //console.log('Data Check',this.RecivedData);
                    this.data_update_callback(null); //crc error...
                }
            }
            catch (err) {
                this.debugErr(err);
            }
        }
    }


    updateOnReceived(callback, options) {
        if (options) {
            this.need_check_crc = options.varify_crc;
            this.data_have_crc = this.need_check_crc ? true : options.crc_enable;
            this.receive_data_length_needed = this.data_have_crc ? options.length + 2 : options.length;
            this.receive_line_end = options.terminate_with;
        }
        else {
            this.receive_data_length_needed = 1;
            this.need_check_crc = false;
            this.data_have_crc = false;
            this.receive_line_end = null;
        }

        this.data_update_callback = callback;
    }

    crc_get(devided = true) {
        if (devided) return [(this.crc >> 8) & 0xFF, this.crc & 0xFF];
        return this.crc;
    }

    crc_clear() {
        this.crc = 0;
    }

    crc_update(data) {
        data = data & 0xFF;
        this.crc = this.crc ^ (data << 8);
        for (let i = 0; i < 8; i++) {
            if (this.crc & 0x8000)
                this.crc = (this.crc << 1) ^ 0x1021;
            else
                this.crc <<= 1;
        }
        this.crc = this.crc & 0xFFFF;
    }

    crc_match(data) {
        //crc checking
        /*
        The CRC16 calculation can also be used to validate received data from the Roboclaw. The CRC16 
        value should be calculated using the sent Address and Command byte as well as all the data 
        received back from the Roboclaw except the two CRC16 bytes. The value calculated will match 
        the CRC16 sent by the Roboclaw if there are no errors in the data sent or received.
        */
        if (data.length < 2) return false;
        this.crc_clear();
        for (var i = 0; i < this.lastCommandData.length; i++) {
            this.crc_update(this.lastCommandData[i] & 0xFF);
        }

        for (let i = 0; i < data.length - 2; i++) {
            // if(i==0 && data[0]==0xFF)continue; //if first data is 255
            this.crc_update(data[i] & 0xFF);
        }

        let crc_msb = data[data.length - 2] & 0xFF;
        let crc_lsb = data[data.length - 1] & 0xFF;
        let check_crc = (crc_msb << 8) | crc_lsb;
        let crc_calc = this.crc_get(false);
        //this.debugMsg(`check_crc:${check_crc}, crc:${crc_calc}`);
        return (crc_calc == check_crc) ? true : false;
    }



    bufferToInt(buffer) {
        let val = buffer[0] & 0xFF;
        for (let i = 1; i < buffer.length; i++) {
            val = (val << 8) | (buffer[i] & 0xFF);
        }
        return val;
    }


    clearReceiveBuffer() {
        this.RecivedData = Buffer.from([]);
    }

    clearForMakingReady() {
        return new Promise((accept, reject) => {
            try {

                let clear_process = (err) => {
                    if (err) return reject(err);

                    this.clearReceiveBuffer();

                    this.lastCommandData = Buffer.from([]);
                    this.receive_data_length_needed = 0;
                    this.receive_line_end = null;

                    this.need_check_crc = false;
                    this.data_have_crc = false;
                    this.data_update_callback = null;


                    accept(true);
                };

                if (this.connected_serial) this.connected_serial.flush(clear_process);
                else clear_process(); //clear directly
            }
            catch (err) {
                reject(err);
            }
        });
    }

    getBuffer() {
        return this.RecivedData;
    }

    updateBuffer(data) {
        this.debugMsg('RecivedData:', data);
        this.RecivedData = Buffer.concat([this.RecivedData, data]);
        this.debugMsg('Current Data:', this.RecivedData);
        this.dataStreamCheckerThread();
    }

    start_listening() {
        this.clearForMakingReady();
        this.motor_driver_listening = true;
    }

    stop_listening() {
        this.motor_driver_listening = false;
        while (this.task_holder.length > 0) {
            let { reject } = this.task_holder.shift();
            reject('Pending task canceled');
        }
    }

    task_processing_sys(task) {
        return new Promise(async (resolve, cancel) => {

            try {
                if (!this.connected_serial) return cancel('Communication has not been established yet.');
                await this.clearForMakingReady(); //clear buffer


                let { command_type, address, comm, options } = task;

                let timeout = 'timeout' in options ? options.timeout : COMM_TIMEOUT;

                let timeout_timer;
                let data_send_holder = [];
                this.crc_clear();

                if (command_type) {
                    this.debugMsg('Command Sending-->', roboClaw.getCommandName(comm), this.RecivedData);

                    let { value } = task;

                    address = address & 0xFF;
                    this.crc_update(address);
                    data_send_holder.push(address);

                    comm = comm & 0xFF;
                    this.crc_update(comm);
                    data_send_holder.push(comm);

                    if (Array.isArray(value)) {
                        value.forEach((val) => {
                            val = val & 0xFF;
                            this.crc_update(val);
                            data_send_holder.push(val);
                        });
                    }
                    else {
                        value = value & 0xFF;
                        this.crc_update(value);
                        data_send_holder.push(value);
                    }

                    this.lastCommandData = Buffer.from(data_send_holder);

                    //if this request not need crc addition then skip
                    if (!('send_crc' in options && options.send_crc == false)) {

                        //crc pushing
                        let [first_crc, last_crc] = this.crc_get();
                        data_send_holder.push(first_crc);
                        data_send_holder.push(last_crc);
                    }

                    this.updateOnReceived((data) => {
                        if (timeout_timer) clearTimeout(timeout_timer);

                        if (data == null) {
                            cancel(`${roboClaw.getCommandName(comm)} Invalid response!`);
                            return false;
                        }

                        if (data[0] == 0xFF) {
                            resolve(true); //command accepted
                            return true;
                        } else {
                            cancel(`${roboClaw.getCommandName(comm)} is not responding!`);
                            return false;
                        }
                    });

                    //this.debugMsg("sending buffer {", Buffer.from(data_send_holder), "}");
                }
                else {
                    this.debugMsg('Data Rending-->', roboClaw.getCommandName(comm), this.RecivedData);

                    let { length } = task;
                    let offset = 0;

                    address = address & 0xFF;
                    this.crc_update(address);
                    data_send_holder.push(address);

                    comm = comm & 0xFF;
                    this.crc_update(comm);
                    data_send_holder.push(comm);

                    this.lastCommandData = Buffer.from(data_send_holder);

                    //if this request not need crc addition then skip
                    if (!('send_crc' in options && options.send_crc == false)) {

                        //crc pushing
                        let [first_crc, last_crc] = this.crc_get();
                        data_send_holder.push(first_crc);
                        data_send_holder.push(last_crc);
                    }


                    let offset_end = offset + length;

                    let terminate_with = 'terminate' in options ? options.terminate : null;

                    this.updateOnReceived((data) => {
                        if (timeout_timer) clearTimeout(timeout_timer);

                        if (data == null) {
                            cancel(`CRC mismatch for ${roboClaw.getCommandName(comm)}!`);
                            return false;
                        }

                        if (terminate_with === null && data.length < offset_end) {
                            cancel(`Data length ${data.length} is insufficient; ${offset_end} is needed for ${roboClaw.getCommandName(comm)}!`);
                            return false;
                        }

                        if ('raw' in options && options.raw) {
                            resolve(data);
                            return true;
                        }

                        var datacc = data[offset++] & 0xFF;
                        for (var i = offset; i < offset_end; i++) {
                            datacc = (datacc << 8) | (data[i] & 0xFF);
                        }
                        resolve(datacc);
                        return true;
                    }, {
                        varify_crc: 'crc' in options ? options.crc : true, //crc return so neeed to be true
                        crc_enable: true, //reading should have crc
                        length: offset_end,
                        terminate_with
                    });

                    //this.debugMsg("sending buffer {", Buffer.from(data_send_holder), "}");
                }

                this.clearReceiveBuffer();
                this.connected_serial.write(Buffer.from(data_send_holder), (err) => {
                    if (err) {
                        this.debugMsg(`Error sending ${roboClaw.getCommandName(comm)} :`, err);
                        return cancel(err);
                    }

                    this.debugMsg('Write requested');

                    timeout_timer = setTimeout(() => {
                        clearTimeout(timeout_timer);
                        cancel(`${roboClaw.getCommandName(comm)} is not responding within ${timeout}ms.`);
                    }, timeout);

                });

            }
            catch (err) {
                cancel(err);
            }
        });
    }

    async processQueueTask() {
        if (this.process_task_is_busy) return;
        this.process_task_is_busy = true;

        while (this.task_holder.length > 0) {
            let task = this.task_holder.shift();

            //this.debugMsg('Processing Task');
            for (let trying = 1; trying <= TASK_TRY_AMOUNT; trying++) {
                try {
                    let process_result = await this.task_processing_sys(task);
                    task.accept(process_result);
                    break; //no try any more
                }
                catch (err) {
                    this.debugErr(`Task failed on attempt ${trying}:`, err);
                    //this.debugMsg('Catch :',trying,TASK_TRY_AMOUNT,trying == TASK_TRY_AMOUNT);
                    if (trying == TASK_TRY_AMOUNT) {
                        task.reject(err);
                        break;
                    }
                }
            }

            //task.reject('No Response');
            // this.debugMsg('Ending Task:',TASK_TRY_AMOUNT);
        }


        this.process_task_is_busy = false;
    }



    clearTaskFromQueue(task) {
        let findex = this.task_holder.indexOf(task);
        if (findex != -1) {
            this.task_holder[findex].reject('Task got cancelled');
            this.task_holder.splice(findex, 1);
        }
    }

    cancelAllRemainingTask() {
        while (this.task_holder.length > 0) {
            let { reject } = this.task_holder.shift();
            reject('Task got cancelled');
        }
    }

    insertTaskToQueue(task) {
        this.task_holder.push(task);
        this.processQueueTask();
        return task;
    }

    readData(address, comm, length = 2, options = {}) {
        this.debugMsg('Read data for driver:' + address);

        if (!this.motor_driver_listening) throw new Error('Motor driver is not listening.');
        if (this.connected_serial == null) throw new Error('Motor driver is not defined.');

        return new Promise((accept, reject) => {

            let task = {
                address, comm, length, options, accept, reject, command_type: false
            };

            this.insertTaskToQueue(task);
        });
    }

    command(address, comm, value = [], options = {}) {
        this.debugMsg('Command Sending for driver:' + address);

        if (!this.motor_driver_listening) throw new Error('Motor driver is not listening.');
        if (this.connected_serial == null) throw new Error('Motor driver is not defined.');

        return new Promise((accept, reject) => {

            let task = {
                address, comm, value, options, accept, reject, command_type: true
            };

            this.insertTaskToQueue(task);
        });
    }


    pushDataToU8Array(arr, value, length) {
        value = value & 0xFFFFFFFF; //32 bit
        for (var bitBang = 8 * (length - 1); bitBang >= 0; bitBang -= 8) {
            arr.push((value >> bitBang) & 0xFF);
        }
    }

    debugMsg(...data) {
        if (this.debugFlag) console.log(...data);
    }

    debugErr(...data) {
        if (this.debugFlag) console.error(...data);
    }

    open() {
        return new Promise((resolve, reject) => {

            var serial_open_monitor = setTimeout(() => {
                this.serialSystem.close(new Error('Serial Connect Timeout'));
                reject('Serial Connect Timeout');
            }, 20000);


            this.serialSystem.open(async (err) => {
                try {
                    clearTimeout(serial_open_monitor);
                    if (err) {
                        return reject(err);
                    }
                    this.connected_serial = this.serialSystem;

                    this.start_listening();
                    await Promise.all(this.connectCallback.map((callback) => callback()));
                    resolve(this.connected_serial);
                }
                catch (e) {
                    this.stop_listening();
                    reject(e);
                }

            });


        });
    }

    isConnected() {
        return this.connected_serial != null ? this.connected_serial.isConnected() : false;
    }

    start() {
        return this.start_listening();
    }

    stop() {
        return this.stop_listening();
    }

    close() {
        if (this.connected_serial) {
            this.connected_serial.close();
            this.connected_serial = null;
        }
    }

    onClose(callback) {
        this.closeCallback.push(callback);
    }

    onError(callback) {
        this.errorCallback.push(callback);
    }

    onConnect(callback) {
        this.connectCallback.push(callback);
    }


    getPWMValue(speed_percentage) {
        return parseInt(speed_percentage * (32767 / 100), 10);
    }

    getSpeedValue(speed_percentage) {
        return parseInt(speed_percentage * (127 / 100), 10);
    }

    requestData(...args) {
        return this.readData(...args);
    }

    sendCommand(...args) {
        return this.command(...args);
    }


    async readEncM1(driver_id, details = false) {
        var data = await this.readData(driver_id, GETM1ENC, 5, { raw: true, send_crc: true });
        var encoder = data.readInt32BE(0);//this.bufferToInt(data.slice(0, 4));
        var status = data[4] & 0xFF;
        return details ?
            [encoder, status] : //details will send the status also
            encoder;
    }

    async readEncM2(driver_id, details = false) {
        var data = await this.readData(driver_id, GETM2ENC, 5, { raw: true, send_crc: true });
        var encoder = data.readInt32BE(0);//this.bufferToInt(data.slice(0, 4));
        var status = data[4] & 0xFF;
        return details ?
            [encoder, status] : //details will send the status also
            encoder;
    }


    async readSpeedM1(driver_id, details = false) {
        var data = await this.readData(driver_id, GETM1SPEED, 5, { raw: true, send_crc: true });
        var speed = data.readInt32BE(0);//this.bufferToInt(data.slice(0, 4));
        return details ?
            [speed, data[4] & 0xFF] : //speed (PPS), status (0=FORWARD,1=BACKWARD)
            speed; //speed (PPS)[>0:forward,<0:backward]
    }

    async readSpeedM2(driver_id, details = false) {
        var data = await this.readData(driver_id, GETM2SPEED, 5, { raw: true, send_crc: true });
        var speed = data.readInt32BE(0);// this.bufferToInt(data.slice(0, 4));
        return details ?
            [speed, data[4] & 0xFF] : //speed (PPS), status (0=FORWARD,1=BACKWARD)
            speed; //speed (PPS)[>0:forward,<0:backward]
    }

    async readMainBatteryVoltage(driver_id) {
        var value = await this.readData(driver_id, GETMBATT, 2, { send_crc: true });
        return (value / 10).toFixed(2);
    }

    async readCurrents(driver_id) {
        var data = await this.readData(driver_id, GETCURRENTS, 4, { raw: true, send_crc: true });
        var motor1_current = data.readInt16BE(0);//this.bufferToInt(data.slice(0, 2));
        var motor2_current = data.readInt16BE(2);//this.bufferToInt(data.slice(2, 2));

        //motor1_current = motor1_current << 16 >> 16;
        //motor2_current = motor2_current << 16 >> 16;

        motor1_current = motor1_current / 100;
        motor2_current = motor2_current / 100;
        return [Math.abs(motor1_current), Math.abs(motor2_current)];
        /*
        motor1_current=(motor1_current/100).toFixed(2);
        motor2_current=(motor2_current/100).toFixed(2);
        return [motor1_current>120?0:motor1_current,motor2_current>120?0:motor2_current] //current m1,current m2 (A)
        */
    }

    async readTemp(driver_id) {
        var value = await this.readData(driver_id, GETTEMP, 2, { send_crc: true });
        return Number.parseFloat(value / 10).toFixed(2); //temperature (C)
    }

    async readTemp2(driver_id) {
        var value = await this.readData(driver_id, GETTEMP2, 2, { send_crc: true });
        return Number.parseFloat(value / 10).toFixed(2); //temperature (C)
    }

    async readDriverStatus(driver_id, details = false) {
        //datasheet: page 73 has miss information about the error code
        //90 - Read Status
        var data = await this.readData(driver_id, READSTATUS, 4, { raw: true, timeout: 200, send_crc: true });
        var val = this.bufferToInt(data.slice(0, 2));
        return details ? roboClaw.getStatus(val) : val;
    }


    async getM1MaxCurrent(driver_id) {
        var data = await this.readData(driver_id, GETM1MAXCURRENT, 8, { raw: true, send_crc: true });
        var val = data.readInt32BE(0);//this.bufferToInt(data.slice(0, 4));
        return (Number.parseFloat(val) / 100).toFixed(2);
    }


    async getM2MaxCurrent(driver_id) {
        var data = await this.readData(driver_id, GETM2MAXCURRENT, 8, { raw: true, send_crc: true });
        var val = data.readInt32BE(0);//this.bufferToInt(data.slice(0, 4));
        return (Number.parseFloat(val) / 100).toFixed(2);
    }


    async getM1MinCurrent(driver_id) {
        var data = await this.readData(driver_id, GETM1MAXCURRENT, 8, { raw: true, send_crc: true });
        var val = data.readInt32BE(4);//this.bufferToInt(data.slice(0, 4));
        return (Number.parseFloat(val) / 100).toFixed(2);
    }


    async getM2MinCurrent(driver_id) {
        var data = await this.readData(driver_id, GETM2MAXCURRENT, 8, { raw: true, send_crc: true });
        var val = data.readInt32BE(4);//this.bufferToInt(data.slice(0, 4));
        return (Number.parseFloat(val) / 100).toFixed(2);
    }


    setM1MaxCurrent(driver_id, value) {
        value = value * 1000; //A to mA
        value = value / 10; //10mA unit
        value = value & 0xFFFFFFFF; //32 bit
        var data_cmd = [];

        this.pushDataToU8Array(data_cmd, value, 4);
        this.pushDataToU8Array(data_cmd, 0, 4);

        return this.command(driver_id, SETM1MAXCURRENT, data_cmd);
    }


    setM2MaxCurrent(driver_id, value) {
        value = value * 1000; //A to mA
        value = value / 10; //10mA unit
        value = value & 0xFFFFFFFF; //32 bit
        var data_cmd = [];

        this.pushDataToU8Array(data_cmd, value, 4);
        this.pushDataToU8Array(data_cmd, 0, 4);

        return this.command(driver_id, SETM2MAXCURRENT, data_cmd);
    }


    setM1Position(driver_id, value, settings = {}) {
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, 'accel' in settings ? settings.accel : 12000, 4); //acceralation (QPPS)
        this.pushDataToU8Array(data_cmd, 'speed' in settings ? settings.speed : 12000, 4); //speed (QPPS)
        this.pushDataToU8Array(data_cmd, 'decel' in settings ? settings.decel : 12000, 4); //decel (QPPS)
        this.pushDataToU8Array(data_cmd, value, 4); //position
        data_cmd.push('instant' in settings ? (settings.instant ? 0x01 : 0x00) : 0x01); //instant action

        return this.command(driver_id, DRIVEM1POSITION, data_cmd);
    }


    setM2Position(driver_id, value, settings = {}) {
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, 'accel' in settings ? settings.accel : 12000, 4); //acceralation (QPPS)
        this.pushDataToU8Array(data_cmd, 'speed' in settings ? settings.speed : 12000, 4); //speed (QPPS)
        this.pushDataToU8Array(data_cmd, 'decel' in settings ? settings.decel : 12000, 4); //decel (QPPS)
        this.pushDataToU8Array(data_cmd, value, 4); //position
        data_cmd.push('instant' in settings ? (settings.instant ? 0x01 : 0x00) : 0x01); //instant action

        return this.command(driver_id, DRIVEM2POSITION, data_cmd);
    }


    setM1PositionPID(driver_id, settings) {
        var data_cmd = [];
        var kp = 'kp' in settings ? settings.kp * 1024 : 0x00010000;
        var ki = 'ki' in settings ? settings.ki * 1024 : 0x00008000;
        var kd = 'kd' in settings ? settings.kd * 1024 : 0x00004000;

        this.pushDataToU8Array(data_cmd, kd, 4);
        this.pushDataToU8Array(data_cmd, kp, 4);
        this.pushDataToU8Array(data_cmd, ki, 4);

        this.pushDataToU8Array(data_cmd, 'kiMax' in settings ? settings.kiMax : 0, 4);
        this.pushDataToU8Array(data_cmd, 'deadzoon' in settings ? settings.deadzoon : 0, 4);

        this.pushDataToU8Array(data_cmd, 'min' in settings ? settings.min : 0, 4);
        this.pushDataToU8Array(data_cmd, 'max' in settings ? settings.max : 0, 4);

        return this.command(driver_id, SETM1POSPID, data_cmd);
    }


    setM2PositionPID(driver_id, settings) {
        var data_cmd = [];
        var kp = 'kp' in settings ? settings.kp * 1024 : 0x00010000;
        var ki = 'ki' in settings ? settings.ki * 1024 : 0x00008000;
        var kd = 'kd' in settings ? settings.kd * 1024 : 0x00004000;

        this.pushDataToU8Array(data_cmd, kd, 4);
        this.pushDataToU8Array(data_cmd, kp, 4);
        this.pushDataToU8Array(data_cmd, ki, 4);

        this.pushDataToU8Array(data_cmd, 'kiMax' in settings ? settings.kiMax : 0, 4);
        this.pushDataToU8Array(data_cmd, 'deadzone' in settings ? settings.deadzone : 0, 4);

        this.pushDataToU8Array(data_cmd, 'min' in settings ? settings.min : 0, 4);
        this.pushDataToU8Array(data_cmd, 'max' in settings ? settings.max : 0, 4);

        return this.command(driver_id, SETM2POSPID, data_cmd);
    }


    forwardM1(driver_id, speed) {
        return this.command(driver_id, M1FORWARD, this.getSpeedValue(speed));
    }


    forwardM2(driver_id, speed) {
        return this.command(driver_id, M2FORWARD, this.getSpeedValue(speed));
    }


    backwardM1(driver_id, speed) {
        return this.command(driver_id, M1BACKWARD, this.getSpeedValue(speed));
    }


    backwardM2(driver_id, speed) {
        return this.command(driver_id, M2BACKWARD, this.getSpeedValue(speed));
    }

    setM1DutyCycle(driver_id, duty_cycle) {
        const pwm = this.getPWMValue(duty_cycle);
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, pwm, 2);
        return this.command(driver_id, M1DUTY, data_cmd);
    }

    setM2DutyCycle(driver_id, duty_cycle) {
        const pwm = this.getPWMValue(duty_cycle);
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, pwm, 2);
        return this.command(driver_id, M2DUTY, data_cmd);
    }


    setM1Speed(driver_id, speed) {
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, speed, 4);
        return this.command(driver_id, M1SPEED, data_cmd);
    }

    setM2Speed(driver_id, speed) {
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, speed, 4);
        return this.command(driver_id, M2SPEED, data_cmd);
    }

    stopM1(driver_id) {
        this.setM1Speed(driver_id, 0);
    }

    stopM2(driver_id) {
        this.setM2Speed(driver_id, 0);
    }

    stopBothMotors(driver_id) {
        this.cancelAllRemainingTask();
        return Promise.all([this.forwardM1(driver_id, 0), this.forwardM2(driver_id, 0)]);
    }

    setM1VelocityPID(driver_id, settings) {
        var data_cmd = [];
        var kp = 'kp' in settings ? settings.kp * 65536 : 0x00010000;
        var ki = 'ki' in settings ? settings.ki * 65536 : 0x00008000;
        var kd = 'kd' in settings ? settings.kd * 65536 : 0x00004000;

        this.pushDataToU8Array(data_cmd, kd, 4);
        this.pushDataToU8Array(data_cmd, kp, 4);
        this.pushDataToU8Array(data_cmd, ki, 4);

        this.pushDataToU8Array(data_cmd, 'qpps' in settings ? settings.qpps : 3000, 4);

        return this.command(driver_id, SETM1PID, data_cmd);
    }

    setM2VelocityPID(driver_id, settings) {
        var data_cmd = [];
        var kp = 'kp' in settings ? settings.kp * 65536 : 0x00010000;
        var ki = 'ki' in settings ? settings.ki * 65536 : 0x00008000;
        var kd = 'kd' in settings ? settings.kd * 65536 : 0x00004000;

        this.pushDataToU8Array(data_cmd, kd, 4);
        this.pushDataToU8Array(data_cmd, kp, 4);
        this.pushDataToU8Array(data_cmd, ki, 4);

        this.pushDataToU8Array(data_cmd, 'qpps' in settings ? settings.qpps : 3000, 4);

        return this.command(driver_id, SETM2PID, data_cmd);
    }


    speedAccelM1(driver_id, speed, accel = 5000) {
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, accel, 4);
        this.pushDataToU8Array(data_cmd, speed, 4);
        return this.command(driver_id, M1SPEEDACCEL, data_cmd);
    }


    speedAccelM2(driver_id, speed, accel = 5000) {
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, accel, 4);
        this.pushDataToU8Array(data_cmd, speed, 4);
        return this.command(driver_id, M2SPEEDACCEL, data_cmd);
    }


    setEncM1(driver_id, encoder) {
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, encoder, 4);
        return this.command(driver_id, SETM1ENCCOUNT, data_cmd);
    }


    setEncM2(driver_id, encoder) {
        var data_cmd = [];
        this.pushDataToU8Array(data_cmd, encoder, 4);
        return this.command(driver_id, SETM2ENCCOUNT, data_cmd);
    }

    resetEncoders(driver_id) {
        return this.command(driver_id, RESETENC);
    }

    async readVersion(driver_id) {
        var data = await this.readData(driver_id, GETVERSION, 48, { terminate: 0, raw: true, send_crc: true }); //return upto 52
        var val = (data.length >= 4) ? data.slice(0, data.length - 4) : null;
        return val.toString();
    }


    setM1SpeedDistance(driver_id, speed = 12000, distance = 12000, instant = true) {
        var data_cmd = [];

        this.pushDataToU8Array(data_cmd, speed, 4); //speed (QPPS)
        this.pushDataToU8Array(data_cmd, distance, 4); //position
        data_cmd.push(instant ? 0x01 : 0x00); //instant action

        return this.command(driver_id, M1SPEEDDIST, data_cmd);
    }

    setM2SpeedDistance(driver_id, speed = 12000, distance = 12000, instant = true) {
        var data_cmd = [];

        this.pushDataToU8Array(data_cmd, speed, 4); //speed (QPPS)
        this.pushDataToU8Array(data_cmd, distance, 4); //position
        data_cmd.push(instant ? 0x01 : 0x00); //instant action

        return this.command(driver_id, M2SPEEDDIST, data_cmd);
    }

    setM1SpeedTimeout(driver_id, speed, timeout = 2000, instant = true) {
        timeout = timeout / 1000;
        //timeout is in sec.
        let distance = timeout * Math.abs(speed);

        return this.setM1SpeedDistance(driver_id, speed, distance, instant);
    }

    setM2SpeedTimeout(driver_id, speed, timeout = 2000, instant = true) {
        timeout = timeout / 1000;
        //timeout is in sec.
        let distance = timeout * Math.abs(speed);

        return this.setM2SpeedDistance(driver_id, speed, distance, instant);
    }


    setM1SpeedDistanceAccel(driver_id, speed = 1000, distance = 12000, accel = 500, instant = true) {
        var data_cmd = [];
        accel = Math.abs(accel);

        //console.log({ speed, accel, distance });

        this.pushDataToU8Array(data_cmd, accel, 4); //acceralation (QPPS)
        this.pushDataToU8Array(data_cmd, speed, 4); //speed (QPPS)
        this.pushDataToU8Array(data_cmd, distance, 4); //position
        data_cmd.push(instant ? 0x01 : 0x00); //instant action

        return this.command(driver_id, M1SPEEDACCELDIST, data_cmd);
    }

    setM2SpeedDistanceAccel(driver_id, speed = 1000, distance = 12000, accel = 500, instant = true) {
        var data_cmd = [];

        accel = Math.abs(accel);

        this.pushDataToU8Array(data_cmd, accel, 4); //acceralation (QPPS)
        this.pushDataToU8Array(data_cmd, speed, 4); //speed (QPPS)
        this.pushDataToU8Array(data_cmd, distance, 4); //position
        data_cmd.push(instant ? 0x01 : 0x00); //instant action

        return this.command(driver_id, M2SPEEDACCELDIST, data_cmd);
    }

    setPinModes(driver_id, s3_mode = PinModesFlags.DEFAULT, s4_mode = PinModesFlags.DEFAULT, s5_mode = PinModesFlags.DEFAULT) {
        var data_cmd = [];
        data_cmd.push(s3_mode & 0xFF); //s3 mode
        data_cmd.push(s4_mode & 0xFF); //s4 mode
        data_cmd.push(s5_mode & 0xFF); //s5 mode

        return this.command(driver_id, SETPINFUNCTIONS, data_cmd);
    }


    setM1SpeedAccelTimeout(driver_id, speed, accel = 500, timeout = 3000, instant = true) {
        timeout = timeout / 1000;
        if (timeout < 2) timeout = 2;
        accel = Math.abs(accel);
        //timeout is in sec.
        let top_speed_require_time = (Math.abs(speed) / accel); //S
        top_speed_require_time = top_speed_require_time > timeout ? timeout : top_speed_require_time;
        let cons_speed_time = timeout - top_speed_require_time;
        if (cons_speed_time < 2) cons_speed_time = 2;
        let distance = cons_speed_time * Math.abs(speed) + 0.5 * accel * top_speed_require_time ** 2;
        return this.setM1SpeedDistanceAccel(driver_id, speed, distance, accel, instant);
    }

    setM2SpeedAccelTimeout(driver_id, speed, accel = 500, timeout = 3000, instant = true) {
        timeout = timeout / 1000;
        if (timeout < 2) timeout = 2;
        accel = Math.abs(accel);
        //timeout is in sec.
        let top_speed_require_time = (Math.abs(speed) / accel); //S
        top_speed_require_time = top_speed_require_time > timeout ? timeout : top_speed_require_time;
        let cons_speed_time = timeout - top_speed_require_time;
        if (cons_speed_time < 2) cons_speed_time = 2;
        let distance = cons_speed_time * Math.abs(speed) + 0.5 * accel * top_speed_require_time ** 2;
        return this.setM2SpeedDistanceAccel(driver_id, speed, distance, accel, instant);
    }

}


//add dynamic functions
const member_function = ['readEncM1', 'readEncM2', 'readSpeedM1', 'readSpeedM2', 'readMainBatteryVoltage', 'readCurrents', 'readTemp', 'readTemp2', 'readDriverStatus', 'getM1MaxCurrent', 'getM2MaxCurrent', 'getM1MinCurrent', 'getM2MinCurrent', 'setM1MaxCurrent', 'setM2MaxCurrent', 'setM1Position', 'setM2Position', 'setM1PositionPID', 'setM2PositionPID', 'forwardM1', 'forwardM2', 'backwardM1', 'backwardM2', 'stopBothMotors', 'setM1VelocityPID', 'setM2VelocityPID', 'speedAccelM1', 'speedAccelM2', 'setEncM1', 'setEncM2', 'readVersion', 'setM1SpeedDistanceAccel', 'setM2SpeedDistanceAccel', 'setM1SpeedAccelTimeout', 'setM2SpeedAccelTimeout', 'setM1SpeedDistance', 'setM2SpeedDistance', 'setM1SpeedTimeout', 'setM2SpeedTimeout', 'setM1Speed', 'setM2Speed', 'stopM1', 'stopM2', 'setM1DutyCycle', 'setM2DutyCycle', 'resetEncoders', 'setPinModes'];



const AUTO_DISCONNECT_TIMEOUT = 3000;

const CHANNEL_NUMBER_1 = 1;
const CHANNEL_NUMBER_2 = 2;

const auto_action_conflicts_channel1 = ['setM1Position', 'forwardM1', 'backwardM1', 'stopBothMotors', 'speedAccelM1', 'setM1SpeedDistanceAccel', 'setM1SpeedAccelTimeout', 'setM1SpeedDistance', 'setM1SpeedTimeout', 'setM1Speed', 'stopM1', 'setM1DutyCycle'];

const auto_action_conflicts_channel2 = ['setM2Position', 'forwardM2', 'backwardM2', 'stopBothMotors', 'speedAccelM2', 'setM2SpeedDistanceAccel', 'setM2SpeedAccelTimeout', 'setM2SpeedDistance', 'setM2SpeedTimeout', 'setM2Speed', 'stopM2', 'setM2DutyCycle'];


class ExactMotorDriver {

    motor_obj;
    driver_id;

    channel_auto_action = {
        [CHANNEL_NUMBER_1]: {
            busy: false, thread: null, awaiter: []
        },
        [CHANNEL_NUMBER_2]: {
            busy: false, thread: null, awaiter: []
        },
    };


    constructor(motor_obj) {
        if (!motor_obj) throw new Error('RoboClaw object is required to initialize ExactMotorDriver');
        if (motor_obj instanceof roboClaw == false) throw new Error('The provided driver is not an instance of roboClaw');

        this.motor_obj = motor_obj;
    }

    isConnected() {
        return this.motor_obj != null && this.motor_obj.isConnected();
    }

    setAddress = (driver_id) => {
        this.driver_id = driver_id;
    }

    autoThreadCancel(channel) {
        if (this.channel_auto_action[channel].awaiter.length == 0) return;

        for (let callback of this.channel_auto_action[channel].awaiter) {
            callback(true);
        }
        this.channel_auto_action[channel].awaiter = [];
    }

    stopAutoProcess(channel) {
        clearInterval(this.channel_auto_action[channel].thread);
        this.channel_auto_action[channel].thread = null;
        this.autoThreadCancel(channel);
    }

    checkWaitCancelAuto(channel) {
        //console.log('await cancel');
        return new Promise((accept, reject) => {
            if (!this.channel_auto_action[channel].busy) {
                this.stopAutoProcess(channel);
                accept(true);
            }
            else this.channel_auto_action[channel].awaiter.push(accept);
        });
    }

    autoActionSpeedAccel(channel, speed, accel, timeout) {
        return new Promise(async (accept, reject) => {
            this.channel_auto_action[channel].busy = true;
            try {
                //if(accel>speed*1.5)accel=speed*1.5;

                //console.log('Auto Action Speed:',speed,accel);
                if (!timeout) timeout = AUTO_DISCONNECT_TIMEOUT;

                if (speed == 0) {
                    var stopCommand = channel == CHANNEL_NUMBER_1 ? this.motor_obj.forwardM1.bind(this.motor_obj) : this.motor_obj.forwardM2.bind(this.motor_obj);

                    if (this.channel_auto_action[channel].thread) clearInterval(this.channel_auto_action[channel].thread);
                    await stopCommand(this.driver_id, 0);
                }
                else {

                    let fn = channel == CHANNEL_NUMBER_1 ? this.motor_obj.setM1SpeedAccelTimeout.bind(this.motor_obj) : this.motor_obj.setM2SpeedAccelTimeout.bind(this.motor_obj);
                    let fn1 = channel == CHANNEL_NUMBER_1 ? this.motor_obj.setM1SpeedTimeout.bind(this.motor_obj) : this.motor_obj.setM2SpeedTimeout.bind(this.motor_obj);

                    await fn(this.driver_id, speed, accel, timeout);

                    //console.log('Auto Action Speed 2:', speed, accel);

                    if (this.channel_auto_action[channel].thread) clearInterval(this.channel_auto_action[channel].thread);

                    let disconnect_detector;

                    this.channel_auto_action[channel].thread = setInterval((async (channel, fn1, speed, timeout) => {

                        //console.log('Auto Action Running:',speed,accel);

                        this.channel_auto_action[channel].busy = true;
                        try {

                            if (!disconnect_detector) {
                                //console.log('Disconnect checker initialize');
                                disconnect_detector = setTimeout((() => {
                                    //console.log('timeout stop motor');
                                    this.stopAutoProcess(channel);
                                }).bind(this), timeout);
                            }

                            await fn1(this.driver_id, speed, timeout, true);

                            if (disconnect_detector) {
                                //console.log('Disconnect checker terminate');
                                clearTimeout(disconnect_detector);
                            }
                            disconnect_detector = null;
                        }
                        catch (err) {

                        }
                        this.channel_auto_action[channel].busy = false;
                        this.autoThreadCancel(channel);
                    }).bind(this, channel, fn1, speed, timeout), (2 / 4) * timeout);

                }

                accept(true);
            }
            catch (err) {
                reject(err);
            }
            this.channel_auto_action[channel].busy = false;
            this.autoThreadCancel(channel);
        });
    }

    async setM1SpeedAccelAuto(speed, accel, timeout = 5000) {
        await this.checkWaitCancelAuto(CHANNEL_NUMBER_1);
        return this.autoActionSpeedAccel(CHANNEL_NUMBER_1, speed, accel, timeout);
    }

    async setM2SpeedAccelAuto(speed, accel, timeout = 5000) {
        await this.checkWaitCancelAuto(CHANNEL_NUMBER_2);
        return this.autoActionSpeedAccel(CHANNEL_NUMBER_2, speed, accel, timeout);
    }

}


for (let prop of Object.getOwnPropertyNames(roboClaw.prototype)) {
    if (member_function.includes(prop)) {
        ExactMotorDriver.prototype[prop] = function (...args) {
            return new Promise(async (accept, reject) => {
                try {
                    //console.log(this.driver_id);
                    if (!this.driver_id || !this.motor_obj) return reject('Driver ID is not defined or motor driver is not placed');

                    //auto action stop for conflicts
                    if (auto_action_conflicts_channel1.includes(prop)) await this.checkWaitCancelAuto(CHANNEL_NUMBER_1);
                    else if (auto_action_conflicts_channel2.includes(prop)) await this.checkWaitCancelAuto(CHANNEL_NUMBER_2);

                    accept(this.motor_obj[prop](this.driver_id, ...args));
                }
                catch (err) {
                    reject(err);
                }
            });

        };
    }
}

module.exports = { serialSystem, tcpSerialDevice, uartSerialDevice, roboClaw, ExactMotorDriver, StatusFlags, PinModesFlags };
