import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
    <section className="bg-sky-100 dark:bg-gray-700 min-h-screen pt-36">
        <div className="grid max-w-screen-xl h-full px-4 py-16 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
            <div className="mr-auto place-self-center lg:col-span-10">
            <h1 className="max-w-2xl mb-4 text-4xl dark:text-white font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl">
                Bem-vindo ao seu controle Inteligente de Estoques,{" "}
                <span className="text-cyan-700">Smart Stock</span>
            </h1>

            <p className="max-w-1xl mb-6 font-light text-gray-700 lg:mb-8 md:text-lg lg:text-xl dark:text-white">
                Visualize os dados do seu estoque EM TEMPO REAL. Acesse o Controle
                de Estoque para ver produtos, quantidades e listas de compras
                automáticas. Na aba Estatísticas, acompanhe consumo, produtos mais
                vendidos e projeções de reabastecimento.
            </p>

            <h2 className="text-gray-800 mb-8 dark:text-white">
            Por qual área deseja navegar?
            </h2>
            <Link
            to="/estoque"
            className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-cyan-700 hover:bg-cyan-800 focus:ring-4 focus:ring-cyan-300"
            >
            Controle de Estoque
            </Link>
            <Link
            to="/estatisticas"
            className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            >
            Estatísticas
            </Link>
        </div>
        </div>
    </section>
    );
};

export default Home;
