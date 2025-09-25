const net = require('net');
const { ReadlineParser }=require('@serialport/parser-readline');
const serialSystem=require('./serialSystem.js');

module.exports=class tcpSerialDevice extends serialSystem{
    ip;
    port;
    client;
    
    setIpAddress(ip,port){
        this.ip=Array.isArray(ip)?ip.join('.'):ip;
        this.port=port;
    }

    constructor(ip,port,options={}){
        if(!('delimiter' in options))options.delimiter=null;
        if(!('timeout' in options))options.timeout=3000;
        
        super();

        this.setIpAddress(ip,port);

        this.onOpen(() => {
            
            return new Promise(async (accept, reject) => {
                try{

                    await this.closeSocket();

                    this.client = new net.Socket();
                    if(!this.client)return reject('System error!');

                    let client_open_monitor=setTimeout(async ()=>{
                        await this.closeSocket();
                        reject('TCP  Connect Timeout');
                    },options.timeout);

                    // Connect to the server
                    //console.log({ip:this.ip,port:this.port});

                    this.client.connect(this.port, this.ip, () => {
                        //console.log('Connected-->');
                        if(client_open_monitor)clearTimeout(client_open_monitor);
                        accept(this.client);
                    });
                    
                    if(options.delimiter){
                        this.lineParser = this.client.pipe(new ReadlineParser({ delimiter:options.delimiter }));
                        this.lineParser.on('data', (line) =>{
                            this.dataUpdate(line);
                        });
                    }
                    else{
                        // Listening for data from the server
                        this.client.on('data', (data) => {
                            this.dataUpdate(data);
                        });
                    }
            
                    // Handle connection close
                    this.client.on('close', () => {
                        this.close();
                    });
            
                    this.client.on('error', (err) => {
                        if(client_open_monitor)clearTimeout(client_open_monitor);
                    // console.log('Error-->',err);
                        reject(err);
                        this.error(err);
                    });

                }
                catch(err){
                    reject(err);
                }
            });
        });

        this.onWrite(async (data, cb) => {
            if(!this.client)return cb(new Error('TCP client is not available.'));
            try{
                await this.client.write(data);
                cb(null);
            }
            catch(err){
                cb(err);
            }
        });
        
        
        this.onClose(async  () => {
            await this.closeSocket();
        }); //close serial
        
    }

    async closeSocket(){
        if(this.client){
            if('destroy' in this.client)await this.client.destroy();
            if('end' in this.client)await this.client.end();
            this.client=null;
        }
    }

}

