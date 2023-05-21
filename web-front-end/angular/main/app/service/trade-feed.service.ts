import { Injectable } from '@angular/core';
import { environment } from 'main/environments/environment';
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class TradeFeedService {
    private socket: Socket;

    constructor() {
        this.connect();
    }

    private connect(forceNew = false) {
        this.socket = io(environment.tradeFeedUrl, { forceNew });
        this.socket.on("connect", this.onConnect);
        this.socket.on("disconnect", this.onDisconnect);
    }

    private onConnect = () => {
        console.log('Trade feed is connected, connection id' + this.socket.id);
    }

    private onDisconnect = () => {
        console.log('Trade feed is disconnected, connection id was ' + this.socket.id);
    }

    public subscribe(topic: string, callback: (...args: any[]) => void) {
        this.socket.emit('subscribe', topic);
        console.log('subscribing', topic);
        const callbackFn = (args: any) => {
            if (args._from !== 'System' && args.topic === topic) {
                callback(args.message);
            }
        }
        this.socket.on('publish', callbackFn)
        return () => {
            this.unSubscribe(topic, callbackFn);
        }
    }

    public unSubscribe(topic: string, callback: (...args: any[]) => void) {
        console.log('unsubscribing' + topic)
        this.socket.emit('unsubscribe', topic);
        this.socket.off('publish', callback)
    }
}