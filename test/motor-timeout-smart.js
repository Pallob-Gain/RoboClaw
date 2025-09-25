const path = require('path')
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const { tcpSerialDevice, roboClaw, ExactMotorDriver } = require('../lib/index.js');

const SERVER_PORT = 3021;

const MOTOR_ID = 128;

// Replace with your server details: software used to config: USR-M0 V2.2.6.1.exe
const motorDriverHost = '192.168.0.40'; // Replace with server IP or hostname
const motorDriverPort = 20131; // Replace with the server's port


const serial_system = new tcpSerialDevice(motorDriverHost,motorDriverPort);

const motor_driver = new roboClaw(serial_system);

const exact_motor_driver = new ExactMotorDriver(motor_driver);
exact_motor_driver.setAddress(MOTOR_ID);

const MAX_MOTOR_SPEED=1000;

let motor_settings = {
    velocity: {
        kp: 5.00998,
        ki: 5.14679,
        kd: 0.0000,
        qpps: MAX_MOTOR_SPEED //max speed in qpps
    },
    position: {
        kp: 110.00,
        ki: 4.0000,
        kd: 1.0000,
        kiMax: 33,
        deadzoon: 10,
        min: 0,
        max: 38880,
        accel: 500,
        decel: 500,
        speed: 1000
    }
};

motor_driver.onConnect(async () => {
    console.log('Motor Driver Connected');
    try {
        //console.log(exact_motor_driver);
        await exact_motor_driver.setM1PositionPID(motor_settings.position);
        await exact_motor_driver.setM1VelocityPID(motor_settings.velocity);
    }
    catch (err) {
        console.log('error:', err);
    }
});

motor_driver.onClose(() => {
    console.error('Motor Driver Closed');
    process.exit(-1);
});

motor_driver.onError((err) => {
    console.error('Motor Driver Error:', err);
    if (motor_driver.isConnected() == true) {
        motor_driver.stop();
        motor_driver.close();
    }
});

let motor_last_percent = 0;
let motor_last_state = false;
let motor_running_thread=null;



const startMotorSpin=async (speed)=>{
    console.log({speed});
    await  exact_motor_driver.setM1SpeedAccelAuto(speed,500);
}
const stopMotorSpin=async ()=>{
    await exact_motor_driver.stopBothMotors();
}

const setMotorState = async (state) => {
    motor_last_state = state;
    try {
        if (state) await startMotorSpin(MAX_MOTOR_SPEED * (motor_last_percent / 100));
        else {
            await stopMotorSpin();
        }
    }
    catch (err) {
        console.log('error:', err);
    }
}

const setMotorSpeed = async (speed) => {
    motor_last_percent = Number(speed);
    try {
        if (motor_last_state) await startMotorSpin(MAX_MOTOR_SPEED * (motor_last_percent / 100));
    }
    catch (err) {
        console.log('error:', err);
    }
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index-control.html'));
});

io.on('connection', io_client => {

    io_client.on('motor-speed-value', async (data) => {
        console.log('motor-speed-value', data);
        try {
            await setMotorSpeed(data);
        }
        catch (err) {
            console.log('error:', err);
        }
    });

    io_client.on('motor-state-controller', async (data) => {
        console.log('motor-state-controller', data);
        try {
            await setMotorState(data);
        }
        catch (err) {
            console.log('error:', err);
        }
    });

    io_client.on('laser-intensity-value', async (data) => {
        console.log('laser-intensity-value', data);
        await setLaserIntensity(data);
    });

    io_client.on('laser-state-controller', async (data) => {
        console.log('laser-state-controller', data);
        await setLaserState(data);
    });

    io_client.on('disconnect', () => {

    });

});


const main = async () => {
    try {
        await motor_driver.open();

        let version = await exact_motor_driver.readVersion();
        console.log({ version });

        await exact_motor_driver.setEncM1(0); //reset encoder

        let thread_busy = false;
        setInterval(async () => {
            if(!motor_driver.isConnected())return;

            if (thread_busy) return;

            thread_busy = true;
            try {
                
                let encoder = await exact_motor_driver.readEncM1();
                let speed = await exact_motor_driver.readSpeedM1();
                let [current] = await exact_motor_driver.readCurrents();
                let status=await exact_motor_driver.readDriverStatus(true);

                io.emit('motor-info-update', { encoder, speed, current,status });
                
            }
            catch (err) {
                console.log('error:', err);
                //process.exit();
            }
            thread_busy = false;
        }, 100);
    }
    catch(err){
        console.log('Error:',err);
        process.exit();
    }
}


http.listen(SERVER_PORT, main);