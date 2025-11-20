const express = require('express');
const cors = require('cors');
const fs = require('fs');
const mqtt = require('mqtt');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5182;

// Lê os dados do db.json
const readDb = () => {
    const rawData = fs.readFileSync('./db.json');
    return JSON.parse(rawData).estoque;
};

// HTTP endpoint
app.get('/dados', (req, res) => {
    const dadosEstoque = readDb();
    res.json(dadosEstoque);
});

const BROKER = 'mqtt://seu-broker'; 
const TOPICO = '/TEF/device001/attrs/p';
const client = mqtt.connect(BROKER);

client.on('connect', () => {
    console.log('MQTT conectado!');
    client.subscribe(TOPICO);
});

client.on('message', (topic, message) => {
    const payload = message.toString(); 
    const [nomeItem, pesoStr] = payload.split('|');
    const pesoReal = parseFloat(pesoStr);

    console.log(`Recebido: ${nomeItem} com peso ${pesoReal} kg`);

    const estoqueAtual = readDb();
    
    const novoEstoque = estoqueAtual.map((item) => {
        if (item.item === nomeItem) {
            return {
                ...item,
                peso_atual: pesoReal, 
            };
        }
        return item;
    });
    
    fs.writeFileSync('./db.json', JSON.stringify({ estoque: novoEstoque }, null, 2));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend rodando na porta ${PORT}`);
});