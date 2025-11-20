import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const links = [
        { path: '/', name: 'Home' },
        { path: '/estoque', name: 'Estoque' },
        { path: '/estatisticas', name: 'Estatísticas' },
    ];

    return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="text-xl font-bold">
            Smart Stock
        </div>

        <button
        className="md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
        {isMenuOpen ? 'X' : 'Menu'}
        </button>

        <ul className={`md:flex space-x-4 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            {links.map(link => (
                <li key={link.path}>
                    <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                    isActive ? 'text-green-400 font-bold' : 'hover:text-green-300'
                }
                onClick={() => setIsMenuOpen(false)}
            >
                {link.name}
            </NavLink>
            </li>
        ))}
        </ul>
    </nav>
    );
};

export default Navbar;