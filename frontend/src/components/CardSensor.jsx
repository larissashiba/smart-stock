import React from "react";

const CardSensor = ({ item, peso, porcentagem, status }) => {
    const statusColors = {
        OK: "bg-green-500",
        REABASTECER: "bg-yellow-400",
        RECOMPRAR: "bg-red-500",
        "ESTOQUE CRÍTICO": "bg-red-500",
    };

  // Ajusta o status para chave do statusColors
    const statusKey =
    status === "PRODUTOS QUE DEVEM SER RECOMPRADOS"
    ? "RECOMPRAR"
    : status === "REABASTECER"
    ? "REABASTECER"
    : status === "ESTOQUE CRÍTICO"
    ? "ESTOQUE CRÍTICO"
    : "OK";

    return (
    <div className="p-4 rounded-xl shadow-md bg-gray-800 text-white flex flex-col justify-between">
        <h3 className="text-xl font-bold mb-2">{item}</h3>
        <p>
        Peso atual: <span className="font-semibold">{peso} kg</span>
        </p>
        <p>
        Porcentagem do estoque: <span className="font-semibold">{porcentagem}%</span>
        </p>
        <div className="mt-2">
        <span
            className={`px-2 py-1 rounded-full text-white font-bold ${statusColors[statusKey]}`}
        >
            {status}
        </span>
        </div>
    </div>
    );
};

export default CardSensor;