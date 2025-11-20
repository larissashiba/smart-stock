import { useState, useEffect } from "react";
import CardSensor from "../components/CardSensor";

const Estoque = () => {
    const [cards, setCards] = useState([]);
    const [listaCompras, setListaCompras] = useState([]);
    const [alertaCritico, setAlertaCritico] = useState(null);
    
    const API_URL = 'http://localhost:5182/dados'; 

    const fetchEstoqueData = async () => {
        try {
            const res = await fetch(API_URL);
            
            if (!res.ok) {
                throw new Error(`Falha ao buscar dados: Status ${res.status}`);
            }

            const data = await res.json();
            
            const cardsComCalculo = data.map(item => {
                const pesoMaximo = item.peso_maximo > 0 ? item.peso_maximo : 1; 
                
                const porcentagem = Math.round((item.peso_atual / pesoMaximo) * 100);
                
                let status;
                if (porcentagem <= 5) status = "PRODUTOS QUE DEVEM SER RECOMPRADOS";
                else if (porcentagem < 25) status = "ESTOQUE CRÍTICO";
                else if (porcentagem < 50) status = "REABASTECER";
                else status = "OK";
                
                return {
                    ...item,
                    porcentagem_estoque: porcentagem,
                    status: status 
                };
            });

            setCards(cardsComCalculo);
        } catch (error) {
            console.error("Erro ao carregar o estoque:", error);
        }
    };

    useEffect(() => {
        fetchEstoqueData();

        const interval = setInterval(() => {
            fetchEstoqueData();
        }, 5000); 


        return () => clearInterval(interval);
    }, []); 

    useEffect(() => {
        const novosItensLista = cards
            .filter((c) => c.status === "PRODUTOS QUE DEVEM SER RECOMPRADOS")
            .map((c) => c.item);

        setListaCompras(novosItensLista);

        const critico = cards.find((c) => c.status === "ESTOQUE CRÍTICO");
        setAlertaCritico(critico ? `⚠️ Estoque crítico: ${critico.item}` : null);
    }, [cards]);

    return (
        <div className="pt-24 p-4 sm:p-8 min-h-screen bg-[#0d1117] text-white">
            <h1 className="text-3xl font-bold mb-6">Monitoramento de Estoque SmartStock</h1>

            {alertaCritico && (
                <div className="mb-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300">
                    <h2 className="text-xl font-semibold mb-2">Alerta do Servidor</h2>
                    <p>{alertaCritico}</p>
                </div>
            )}

            {listaCompras.length > 0 && (
                <div className="mb-8 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">🛒 Lista de Compras (Reposição Urgente)</h2>
                    <ul className="list-disc ml-6">
                        {listaCompras.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {cards.length > 0 ? (
                    cards.map((card) => (
                        <CardSensor
                            key={card.item}
                            item={card.item}
                            peso={card.peso_atual?.toFixed(2) || "0.00"}
                            porcentagem={card.porcentagem_estoque || 0} 
                            status={card.status}
                        />
                    ))
                ) : (
                    <p>Carregando dados de estoque...</p>
                )}
            </div>
        </div>
    );
};

export default Estoque;