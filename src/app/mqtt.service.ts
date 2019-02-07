import { Injectable, EventEmitter } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';

@Injectable()
export class MqttService {
  client: any;
  onMqttMessageChanged = new EventEmitter<Object>(true);
  onMqttConnectionLost = new EventEmitter<boolean>(true);
  onMqttConnected = new EventEmitter<boolean>(false);
  connected = false;
  constructor() {
    // this.connect();
  }

  connect() {
    this.client = new Paho.MQTT.Client('192.168.1.110', 8080, 'ionic_client');

    //this.onMessage();
    //this.onConnectionLost();
    // set callback handlers
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    this.client.onMessageArrived = this.onMessage.bind(this);
    try {
      this.client.connect({
        useSSL: false,
        userName: 'admin',
        password: 'uniovi',
        timeout: 10,
        keepAliveInterval: 60,
        onFailure: this.onFailure.bind(this),
        onSuccess: this.onConnected.bind(this)
      });
    } catch (ex) {
      console.log(ex);
    }
  }
  onFailure(invocationContext, errorCode) {
    this.onMqttConnectionLost.emit(true);
    console.log('Mqtt Failure: ' + errorCode.toString());
  }
  
  onConnected() {
    console.log('Connected');
    this.onMqttConnected.emit(true);
    // this.client.subscribe(AppConfigurator.getBrokerDeviceTopic());
    this.client.subscribe('uniovi/poc/#');
    this.connected = true;
  }

  sendMessage(message: string) {
    let packet = new Paho.MQTT.Message(message);
    // packet.destinationName = AppConfigurator.getBrokerFeedbackTopic();
    packet.destinationName = 'uniovi/poc/feedback';

    this.client.send(packet);
  }

  onMessage(message: Paho.MQTT.Message) {
    this.onMqttMessageChanged.emit(JSON.parse(message.payloadString));
  }

  onConnectionLost() {
    this.connected = false;
    this.onMqttConnectionLost.emit(true);
    this.client.onConnectionLost = (responseObject: Object) => {
      console.log('Connection lost : ' + JSON.stringify(responseObject));
    };
  }
}