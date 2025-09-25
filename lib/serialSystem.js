module.exports=class serialSystem {

    open_set_cb;
    close_set_cb;
    read_rq_cb;
    write_cb;
    flush_cb;
    waitListenerCallbacks=[];

    on_callbacks = {
        'close': [],
        'error': [],
        'data': [],
        'connect':[]
    };

    is_connected=false;
    receiving=true;

    constructor() {

    }

    isConnected() {
        return this.is_connected;
    }

    onOpen(open_set_cb) {
        this.open_set_cb = open_set_cb;
    }

    open(cb) {
        if (this.open_set_cb && typeof this.open_set_cb == 'function') {
            this.open_set_cb().then(r => {
                this.is_connected = true;
                this.receiving=true;

                cb(null, r);
                
                for (let cb of this.on_callbacks['connect']) {
                    cb(r);
                }

            }).catch(err => {
                this.is_connected = false;
                cb(err);
            });
        }
        else cb(new Error('Any open method is not defined!'));
    }

    onFlush(flush_cb) {
        this.flush_cb = flush_cb;
    }

    flush(cb) {
        if (!(this.flush_cb && typeof this.flush_cb == 'function')) return cb(null);
        this.flush_cb().then(r => cb(null, r)).catch(err => cb(err));
    }

    onWrite(write_cb) {
        this.write_cb = write_cb;
    }

    write(...data) {
        if (!this.write_cb)return;

        if(typeof data[data.length-1]=='object' && data.length>=2){
            let options=data.pop();
            return new Promise((accept,reject)=>{
                let receive_wait=('receive' in options && options.receive);
                if(receive_wait){

                    let timeout=setTimeout(()=>{
    
                        if(waiter_callback)this.clearWaiterCallback(waiter_callback); //if timeout happen clear the callback
    
                        reject('Serial does not make any response');
                    },'timeout' in options?options.timeout:1000);
                    
    
                    let waiter_callback=this.setWaiterCallback(line=>{
                        
                        clearTimeout(timeout);
                        accept(line);
    
                    });

                    this.write_cb(...data,(err)=>{
                        if(err){
                            clearTimeout(timeout);
                            reject(err);
                        }
                    });
                }
                else{
                    this.write_cb(...data,(err)=>{
                        if(err){
                            return reject(err);
                        }
                        accept();
                    });
                }
            });
        }
        else if(typeof data[data.length-1]=='function')return this.write_cb(...data);
        else{
            return new Promise((accept,reject)=>{
                this.write_cb(...data,(err)=>{
                    if(err)return reject(err);
                    accept();
                });
            });
        }
    }

    print(str,...data){
      return this.write(str.toString(),...data);  
    }

    println(str,...data){
        return this.write(str.toString()+'\r\n',...data);  
    }

    onData(cb) {
        this.on('data', cb);
    }

    dataUpdate(data) {
        if(this.waitListenerCallbacks.length>0){
            let currentCallback=this.waitListenerCallbacks.shift();
            currentCallback(data);
        }
        else if(this.receiving){
            for (let cb of this.on_callbacks['data']) {
                cb(data);
            }
        }
    }

    clearWaiterCallback(callback){
        if(callback){
            let callback_index=this.waitListenerCallbacks.indexOf(callback);
            if(callback_index!=-1)this.waitListenerCallbacks.splice(callback_index,1);
        }
        else this.waitListenerCallbacks.splice(0,this.waitListenerCallbacks.length);
    }

    setWaiterCallback(callback){
        this.waitListenerCallbacks.push(callback);
        return callback;
    }

    receiverPause(){
        this.receiving=false;
    }

    receiverResume(){
        this.receiving=true;
    }

    onConnect(cb){
        this.on('connect', cb);
    }

    onError(cb) {
        this.on('error', cb);
    }

    error(...data) {
        for (let cb of this.on_callbacks['error']) {
            cb(...data);
        }
    }

    onClose(cb) {
        this.on('close', cb);
    }

    close(...data) {
        if(this.is_connected ){
            for (let cb of this.on_callbacks['close']) {
                cb(...data);
            }
            this.is_connected = false;
        }
        this.clearWaiterCallback();
    }

    on(name, cb) {
        if (name in this.on_callbacks) this.on_callbacks[name].push(cb);
    }
}