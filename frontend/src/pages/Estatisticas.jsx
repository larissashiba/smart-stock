import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ⚠️ DADOS FICTÍCIOS PARA O GRÁFICO 
const dadosConsumoHistorico = [
    { mes: "Jan", consumo: 120 },
    { mes: "Fev", consumo: 150 },
    { mes: "Mar", consumo: 180 },
    { mes: "Abr", consumo: 130 },
    { mes: "Mai", consumo: 160 },
    { mes: "Jun", consumo: 200 },
];


const PageContainer = ({ title, children }) => (
    <div className="pt-24 p-4 sm:p-8 min-h-screen bg-[#0d1117] text-white">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-3">{title}</h1>
            {children}
    </div>
    </div>
);


const ConsumoChart = ({ data }) => (
<ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="mes" stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} formatter={(value) => [`${value} unidades`, "Consumo Mensal"]} />
        <Legend />
        <Line type="monotone" dataKey="consumo" stroke="#4ade80" strokeWidth={3} dot={false} name="Consumo Mensal (Unidades)" />
    </LineChart>
    </ResponsiveContainer>
);

const Estatisticas = () => {
    const [dadosHistoricos, setDadosHistoricos] = useState([]);
    const [estoqueAtual, setEstoqueAtual] = useState(null); 
    

    const API_URL_ESTOQUE = 'http://localhost:5182/dados'; 


    const fetchEstoqueAtual = async () => {
        try {
            const res = await fetch(API_URL_ESTOQUE);
            if (!res.ok) throw new Error(`Falha ao buscar dados: Status ${res.status}`);
            
            const estoqueItens = await res.json();
            
            // Soma o 'peso_atual' de todos os itens para obter o estoque total
            const totalAtual = estoqueItens.reduce((sum, item) => sum + item.peso_atual, 0);
            
            setEstoqueAtual(totalAtual);
        } catch (error) {
            console.error("Erro na busca de Estoque Atual:", error);
            // Define 0 no caso de falha na conexão/API
            setEstoqueAtual(0); 
        }
    };


    useEffect(() => {
        setDadosHistoricos(dadosConsumoHistorico);

        fetchEstoqueAtual();
        const interval = setInterval(fetchEstoqueAtual, 10000); 
        return () => clearInterval(interval);
    }, []); 


    const { consumoMedioDiario, pontoDeReabastecimento, statusReabastecimento } = useMemo(() => {
        if (dadosHistoricos.length === 0 || estoqueAtual === null)
            return { consumoMedioDiario: 0, pontoDeReabastecimento: 0, statusReabastecimento: "Carregando..." };


        const consumoTotal = dadosHistoricos.reduce((sum, item) => sum + item.consumo, 0);
        const mediaMensal = consumoTotal / dadosHistoricos.length;
        const cdm = mediaMensal / 30; // Consumo Médio Diário


        const pr = Math.ceil(cdm * 5 + 50);


        let status = "";
        if (estoqueAtual <= 50) status = "CRÍTICO! Ação Imediata!";
        else if (estoqueAtual <= pr) status = "Atenção! Abaixo do Ponto de Reabastecimento.";
        else status = "Estoque OK";

        return { consumoMedioDiario: cdm.toFixed(2), pontoDeReabastecimento: pr, statusReabastecimento: status };
    }, [dadosHistoricos, estoqueAtual]);


    const statusClasses = {
        "CRÍTICO! Ação Imediata!": "bg-red-900 border-red-500 text-red-300",
        "Atenção! Abaixo do Ponto de Reabastecimento.": "bg-yellow-900 border-yellow-500 text-yellow-300",
        "Estoque OK": "bg-green-900 border-green-500 text-green-300",
        "Carregando...": "bg-gray-700 border-gray-500 text-gray-400",
    }[statusReabastecimento];

    const statusBorderColor = {
        "CRÍTICO! Ação Imediata!": "border-red-500",
        "Atenção! Abaixo do Ponto de Reabastecimento.": "border-yellow-500",
        "Estoque OK": "border-green-500",
        "Carregando...": "border-gray-500",
    }[statusReabastecimento];

    return (
    <PageContainer title="Estatísticas | Consumo e Projeção">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className={`bg-gray-800 p-6 rounded-lg shadow-xl border-l-4 ${statusBorderColor}`}>
            <h3 className="text-xl font-semibold mb-3">🚦 Status de Reabastecimento</h3>
            <p className={`font-bold text-lg p-2 rounded text-center my-3 border ${statusClasses} border-opacity-50`}>
            {statusReabastecimento}
            </p>
            <p className="text-sm text-gray-400 mt-4">
            Estoque Atual (Sensor): <span className="font-bold text-white">{estoqueAtual !== null ? `${estoqueAtual.toFixed(2)}` : "..."}</span> unidades
            </p>
            <p className="text-sm text-gray-400">
            Consumo Médio Diário: <span className="font-bold text-white">{consumoMedioDiario}</span> unidades
            </p>
            <p className="text-sm text-gray-400">
            Ponto de Reabastecimento (PR): <span className="font-bold text-white">{pontoDeReabastecimento}</span> unidades
            </p>
        </div>
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-4">📉 Consumo Mensal Histórico</h3>
            <ConsumoChart data={dadosHistoricos} />
        </div>
        </div>
    </PageContainer>
    );
};

export default Estatisticas;