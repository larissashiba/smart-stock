#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include "HX711.h"

// ------------------------------------
// Configurações - MQTT
// ------------------------------------

const char* default_SSID = "Wokwi-GUEST"; // Nome da rede Wi-Fi
const char* default_PASSWORD = ""; // Senha da rede Wi-Fi
const char* default_BROKER_MQTT = "broker.hivemq.com"; //para teste
const int default_BROKER_PORT = 1883;
const char* default_TOPICO_SUBSCRIBE = "/TEF/device001/cmd"; // Tópico MQTT de escuta 
const char* default_TOPICO_PUBLISH_1 = "/TEF/device001/attrs"; // Tópico MQTT de envio 1
const char* default_TOPICO_PUBLISH_2 = "/TEF/device001/attrs/p"; // Tópico MQTT de envio 2 (USADO para peso)
const char* default_ID_MQTT = "fiware_001"; // ID MQTT

char* SSID = const_cast<char*>(default_SSID);
char* PASSWORD = const_cast<char*>(default_PASSWORD);
char* BROKER_MQTT = const_cast<char*>(default_BROKER_MQTT);
int BROKER_PORT = default_BROKER_PORT;
char* TOPICO_SUBSCRIBE = const_cast<char*>(default_TOPICO_SUBSCRIBE);
char* TOPICO_PUBLISH_1 = const_cast<char*>(default_TOPICO_PUBLISH_1);
char* TOPICO_PUBLISH_2 = const_cast<char*>(default_TOPICO_PUBLISH_2);
char* ID_MQTT = const_cast<char*>(default_ID_MQTT);

// ----------------------------
// SERVIDOR HTTP
// ----------------------------

String serverName = "http:seu-servidor:5182/dados";

// ----------------------------
// CLIENTES DE REDE
// ----------------------------

WiFiClient espClient;
PubSubClient MQTT(espClient);

// ----------------------------
// SENSORES HX711
// ----------------------------

#define CAL_FACTOR_FARINHA 84.00 
#define CAL_FACTOR_ACUCAR 79.00
#define CAL_FACTOR_OLEO 74.00

#define DOUT_FARINHA 4
#define SCK_FARINHA 5
HX711 scale_farinha;

#define DOUT_ACUCAR 16
#define SCK_ACUCAR 2
HX711 scale_acucar;

#define DOUT_OLEO 17
#define SCK_OLEO 15
HX711 scale_oleo;

// ----------------------------
// Estrutura de sensores
// ----------------------------

struct ItemSensor {
    String item;
    HX711* scale;
    float calibration_factor_value; 
    float fator_calibracao;
};

ItemSensor sensors[3];
const int NUM_SENSORS = 3;

// ------------------------------------
// Funções de Conexão e MQTT 
// ------------------------------------

void reconnectMQTT() {
    while (!MQTT.connected()) {
        Serial.print("* Tentando se conectar ao Broker MQTT: ");
        Serial.println(BROKER_MQTT);
    if (MQTT.connect(ID_MQTT)) {
        Serial.println("Conectado com sucesso ao broker MQTT!");
        } else {
        Serial.println("Falha ao reconectar no broker.");
        Serial.println("Haverá nova tentativa de conexão em 2s");
        delay(2000);
        }
    }
}

void reconectWiFi() {
    if (WiFi.status() == WL_CONNECTED)
    return;
    WiFi.begin(SSID, PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
    }
    Serial.println();
    Serial.println("✅ Conectado com sucesso na rede ");
    Serial.print(SSID);
    Serial.println("IP obtido: ");
    Serial.println(WiFi.localIP());
}

void mqtt_callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("- Mensagem MQTT recebida (Ignorada): ");
    String msg = "";
    for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
    }
    Serial.println(msg);
}

void VerificaConexoesWiFIEMQTT() {
  // Garante que o MQTT tente reconectar
    reconectWiFi(); 
    if (!MQTT.connected())
    reconnectMQTT();
}

void initWiFi() {
    Serial.println("------Conexao WI-FI------");
    Serial.print("Conectando-se na rede: ");
    Serial.println(SSID);
    Serial.println("Aguarde");
    reconectWiFi();
}

void initMQTT() {
    MQTT.setServer(BROKER_MQTT, BROKER_PORT);
    MQTT.setCallback(mqtt_callback);
}

// ----------------------------
// Funções de Envio
// ----------------------------

void sendHTTP(String item, float peso) {
    if (WiFi.status() != WL_CONNECTED) {
    return;
    }

    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"item\":\"" + item + "\",\"peso\":" + String(peso, 2) + "}";
    Serial.println("HTTP -> " + payload);
    int httpCode = http.POST(payload);
    if (httpCode <= 0) {
    }
    http.end();
}

void sendMQTT(String item, float peso) {
    if (!MQTT.connected()) return;

    String value = item + "|" + String(peso, 2);
    Serial.println("MQTT -> " + String(TOPICO_PUBLISH_2) + " : " + value);
    MQTT.publish(TOPICO_PUBLISH_2, value.c_str());
}

// ----------------------------
// SETUP
// ----------------------------

void setup() {
    Serial.begin(115200);
    delay(500);

   // 1. Inicializa Conexões (Padrão Professor)
    initWiFi();
    initMQTT();
  reconnectMQTT(); // Conecta MQTT na inicialização (exibe status)

  // 2. Configuração dos sensores
    sensors[0] = {"Farinha", &scale_farinha, CAL_FACTOR_FARINHA, 0}; 
    sensors[1] = {"Acucar", &scale_acucar, CAL_FACTOR_ACUCAR, 0}; 
    sensors[2] = {"Oleo", &scale_oleo, CAL_FACTOR_OLEO, 0}; 

  // 3. Inicializa e calibra os sensores
  // A lógica foi corrigida para garantir a ordem correta (begin -> set_scale -> tare)
  // e removemos a atribuição redundante 'sensors[x].fator_calibracao = ...'
    Serial.println("--- Iniciando Calibração dos Sensores ---");

   // Calibra Farinha
    scale_farinha.begin(DOUT_FARINHA, SCK_FARINHA);
    scale_farinha.set_scale(CAL_FACTOR_FARINHA); // Aplica o fator
    scale_farinha.tare(); // Zera a balança
    Serial.println("-> Farinha Calibrada.");

   // Calibra Açúcar
    scale_acucar.begin(DOUT_ACUCAR, SCK_ACUCAR);
    scale_acucar.set_scale(CAL_FACTOR_ACUCAR);
    scale_acucar.tare();
    Serial.println("-> Açúcar Calibrado.");

   // Calibra Óleo
    scale_oleo.begin(DOUT_OLEO, SCK_OLEO);
    scale_oleo.set_scale(CAL_FACTOR_OLEO);
    scale_oleo.tare();
    Serial.println("-> Óleo Calibrado.");

  // 4. Mensagem de Conclusão 
    Serial.println("--- Calibração Concluída ---");

}

// ----------------------------
// LOOP
// ----------------------------
void loop() {
  VerificaConexoesWiFIEMQTT(); // Verifica e reconecta se necessário
  MQTT.loop(); // Processa mensagens MQTT

    Serial.println("\n--- Novas Leituras ---");
        for (int i = 0; i < NUM_SENSORS; i++) {
            float peso_kg = sensors[i].scale->get_units(10); 

      // Garante que leituras muito próximas de zero sejam tratadas como 0.00 kg.
        if (peso_kg < 0.05) peso_kg = 0.00; 
      // Imprime o peso em KG 
        Serial.printf("%s: PESO CALIBRADO: %.2f kg\n", sensors[i].item.c_str(), peso_kg);

       // Envia os dados
    sendHTTP(sensors[i].item, peso_kg);
    sendMQTT(sensors[i].item, peso_kg);

        delay(100); 
    }

    delay(5000);
}