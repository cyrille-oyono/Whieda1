import React from 'react';
import ProductsManager from './components/ProductsManager'; // Ajustez le chemin si besoin

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-600 text-white p-4 shadow">
        <h1 className="text-xl font-bold">Wheida Smart - Tableau de Bord</h1>
      </header>

      <main>
        {/* Affichage du gestionnaire de produits que nous venons de créer */}
        <ProductsManager />
      </main>
    </div>
  );
}
