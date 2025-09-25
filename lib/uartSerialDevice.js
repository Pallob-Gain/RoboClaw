var { SerialPort }=require('serialport');
const { ReadlineParser }=require('@serialport/parser-readline');
const serialSystem=require('./serialSystem.js');

module.exports=class uartSerialDevice extends serialSystem{
    path;
    buadrate;
    serial;
    
    configUart(path,buadrate){
        this.path=path;
        this.buadrate=buadrate;
    }

    set(options,callback){
        if(this.serial){
            return new Promise((resolve,reject)=>{
                var timeChecker=setTimeout(()=>{
                    reject('Serial setting timeout');
                },2000);

                this.serial.set(options,()=>{
                    clearTimeout(timeChecker);
                    if(callback)callback();
                    resolve(true);
                });
            });
        }
    }

    getList(){
        return SerialPort.list();
    }

    constructor(path,buadrate,options={}){
        if(!('delimiter' in options))options.delimiter=null;
        if(!('timeout' in options))options.timeout=3000;
        
        super();

        this.configUart(path,buadrate);

        this.onOpen(() => {
            return new Promise((accept, reject) => {
                try{
                    if(this.serial && 'close' in this.serial){
                        this.serial.close();
                        this.serial=null;
                    }

                    let serial_open_monitor=setTimeout(()=>{
                        this.serial.close();
                        reject('Serial Connect Timeout');
                    },options.timeout);
            
                    this.serial=new SerialPort({path:this.path,baudRate: this.buadrate}, (err)=>{
                        if(err){
                            clearTimeout(serial_open_monitor);
                            reject(err);
                        }
                    });

                    if(this.serial==null)return reject('Serial port not responding!');

                    this.serial.on('open',()=>{
                        clearTimeout(serial_open_monitor);
                        accept(this.serial);
                    });

                    if(options.delimiter){
                        this.lineParser = this.serial.pipe(new ReadlineParser({ delimiter:options.delimiter }));
                        this.lineParser.on('data', (line) =>{
                            this.dataUpdate(line);
                        });
                    }
                    else{
                        // Listening for data from the server
                        this.serial.on('data', (data) => {
                            this.dataUpdate(data);
                        });
                    }
            
                    // Handle connection close
                    this.serial.on('close', (...args) => {
                        this.close(...args);
                    });
            
                    this.serial.on('error', (...args) => {
                    // console.log('Error-->',err);
                        reject(...args);
                        this.error(...args);
                    });
                }
                catch(err){
                    reject(err);
                }
            });
        });

        this.onWrite(async (data, cb) => {
            if(!this.serial)return cb(new Error('TCP client is not available.'));

            this.serial.write(data,(err)=>{
                if (err){
                    return cb(err);
                }

                this.serial.drain((err)=> {
                    cb(err);
                });
    
            }); 
            
        });
        
        this.onClose(() => {
            if(this.serial && 'close' in this.serial)this.serial.close();
        }); //close serial
        
    }

}

